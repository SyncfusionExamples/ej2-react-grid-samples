import React, { forwardRef, useState, useEffect } from 'react';
import {
  TextBoxComponent,
  NumericTextBoxComponent,
  UploaderComponent,
  type SelectedEventArgs,
} from '@syncfusion/ej2-react-inputs';
import {
  DropDownListComponent,
  type FieldSettingsModel,
} from '@syncfusion/ej2-react-dropdowns';
import "../styles/EditDialogTemplate.css";
import { categoryData, brandData, tagsOptions, stockStatusOptions, warrentyOptions } from '../data/data';
import { DataManager, GraphQLAdaptor, Query } from '@syncfusion/ej2-data';
import type { ProductDetails } from '../models/product-details';



const fields: FieldSettingsModel = { text: 'text', value: 'value' };
const uploaderPath : object  = {
  saveUrl: 'https://services.syncfusion.com/react/production/api/FileUploader/Save',
  removeUrl: 'https://services.syncfusion.com/react/production/api/FileUploader/Remove',
};

const productProfile : DataManager= new DataManager({
  url: 'http://localhost:4205/',
  adaptor: new GraphQLAdaptor({
    response: { result: 'getProductById' },
    query: `
      query GetProduct($datamanager: DataManagerInput) {
        getProductById(datamanager: $datamanager) {
          productId
          productName
          description
          minimumOrderQuantity
          manufacturer
          tags
          warrantyPeriod
          returnPolicy
          sellingPrice
        }
      }
    `,
  }),
});

export const DialogFormTemplate = forwardRef((props: ProductDetails, ref) => {
  const [formData, setFormData] = useState(() => ({
    productId: props?.productId ?? '',
    productName: props?.productName ?? '',
    category: props?.category ?? null,
    brand: props?.brand ?? null,
    productImage: props?.productImage ?? null,
    mrp: Number(props?.mrp) || 0,
    discount: Number(props?.discount) || 0,
    stockQuantity: Number(props?.stockQuantity) || 0,
    stockStatus: props?.stockStatus ?? 'InStock',
    rating: Number(props?.rating) || 0,
    minimumOrderQuantity: Number(props?.minimumOrderQuantity) || 1,
    warrantyPeriod: Number(props?.warrantyPeriod) || 0,
    manufacturer: props?.manufacturer ?? '',
    tags: props?.tags ?? null,
    returnPolicy: props?.returnPolicy ?? '',
    description: props?.description ?? '',
  }));

  // Fetch extra details (only in edit mode)
  useEffect(() => {
    if (!props?.productId) return; // skip in add mode
    setloadingAdditionalDetails(true);
    const query : Query = new Query().addParams('id', String(props.productId));

    productProfile.executeQuery(query)
      .then((res: any) => {
        const additionalFields = res.result || {};
        setFormData((prev) => ({
          ...prev,
          ...additionalFields,
          minimumOrderQuantity: Number(additionalFields.minimumOrderQuantity) || 1,
          warrantyPeriod: Number(additionalFields.warrantyPeriod) || 0,
          // Add other fields that might come from API if needed
        }));
      })
      .catch((err) => {
        console.error('Failed to load additional product details:', err);
      })
      .finally(() => {
        setloadingAdditionalDetails(false);
      });
  }, [props?.productId]);

  const [loadingAdditionalDetails, setloadingAdditionalDetails] = useState(false);
  const isAdd = !props?.productId;

  //-----------------------Helper Function-------------------------------
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onFileSelected = (args: SelectedEventArgs) => {
    const file = args.filesData?.[0]?.rawFile as File | undefined;
    if (!file) return;
    // Convert to base64 → this goes to backend
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({
        ...prev,
        productImage: base64 
      }));
      window.pendingProductImage = {
          base64,
        };
    };
    reader.readAsDataURL(file);
  };

  const uploaderComponent = React.useMemo(() => (
    <UploaderComponent
        id='productImage'
        multiple={false}
        asyncSettings={uploaderPath}
        allowedExtensions=".png,.jpg,.jpeg,.webp"
        selected={onFileSelected}/>), []);

  return (
    <div className="dialog-template-container" style={{ padding: '20px', position: 'relative' }}>
      <div className="edit-dialog-form two-col">
        {/* Product ID + Name */}
        <div className="form-row">
          <div className="form-field">
            <label>Product ID</label>
            <TextBoxComponent
              name="productId"
              value={String(formData.productId)}
              enabled={isAdd}
              change={(e: any) => updateField('productId', e.value)}
            />
          </div>

          <div className="form-field">
            <label>Product Name *</label>
            <TextBoxComponent
              name="productName"
              value={formData.productName || ''}
              change={(e: any) => updateField('productName', e.value)}
            />
          </div>
        </div>

        {/* Category + Brand */}
        <div className="form-row">
          <div className="form-field">
            <label>Category</label>
            <DropDownListComponent
              name="category"
              value={formData.category}
              dataSource={categoryData}
              fields={fields}
              placeholder="Select category"
              change={(e: any) => updateField('category', e.value)}
            />
          </div>

          <div className="form-field">
            <label>Brand</label>
            <DropDownListComponent
              name="brand"
              value={formData.brand}
              dataSource={brandData}
              fields={fields}
              placeholder="Select brand"
              change={(e: any) => updateField('brand', e.value)}
            />
          </div>
        </div>

        {/* Product Image */}
        <div className="form-row full">
          <div className="form-field image-upload-field">
            <label>Product Image</label>
            <div className="image-field">
              <img
                  src={String(formData.productImage)}
                  alt="Product preview"
                  className="preview"
                  style={{ maxWidth: '180px', marginBottom: '12px', borderRadius: '4px' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
             {uploaderComponent}
            </div>
          
          </div>
        </div>

        {/* MRP + Discount */}
        <div className="form-row">
          <div className="form-field">
            <label>MRP</label>
            <NumericTextBoxComponent
              name="mrp"
              value={formData.mrp}
              format="c0"
              currency= 'USD'
              decimals={0}
              min={100}
              change={(e: any) => updateField('mrp', Math.round(e.value))}
            />
          </div>

          <div className="form-field">
            <label>Discount (%)</label>
            <NumericTextBoxComponent
              name="discount"
              value={formData.discount}
              max={1}
              format={'p0'}
              change={(e: any) => updateField('discount', e.value)}
            />
          </div>
        </div>

        {/* Stock Quantity + Status */}
        <div className="form-row">
          <div className="form-field">
            <label>Stock Quantity</label>
            <NumericTextBoxComponent
              name="stockQuantity"
              value={formData.stockQuantity}
              min={0}
              format="n0"
              decimals={0}
              change={(e: any) => updateField('stockQuantity', Math.round(e.value))}
            />
          </div>

          <div className="form-field">
            <label>Stock Status</label>
            <DropDownListComponent
              name="stockStatus"
              value={formData.stockStatus}
              dataSource={stockStatusOptions}
              fields={fields}
              change={(e: any) => updateField('stockStatus', e.value)}
            />
          </div>
        </div>

        {/* Rating + Minimum Order Qty */}
        <div className="form-row">
          <div className="form-field">
            <label>Rating</label>
            <NumericTextBoxComponent
              name="rating"
              value={formData.rating}
              min={0}
              max={5}
              step={0.1}
              decimals={1}
              change={(e: any) => updateField('rating', e.value)}
            />
          </div>

          <div className="form-field">
            <label>Minimum Order Qty</label>
            <NumericTextBoxComponent
              name="minimumOrderQuantity"
              value={formData.minimumOrderQuantity}
              min={1}
              format="n0"
              decimals={0}
              change={(e: any) => updateField('minimumOrderQuantity', Math.round(e.value))}
            />
          </div>
        </div>

        {/* Warranty + Manufacturer */}
        <div className="form-row">
          <div className="form-field">
            <label>Warranty (Years)</label>
            <DropDownListComponent
              name="warrantyPeriod"
              value={formData.warrantyPeriod}
              dataSource={warrentyOptions}
              fields={fields}
              placeholder="Select warranty"
              change={(e: any) => updateField('warrantyPeriod', Number(e.value))}
            />
          </div>

          <div className="form-field">
            <label>Manufacturer</label>
            <TextBoxComponent
              name="manufacturer"
              value={formData.manufacturer}
              change={(e: any) => updateField('manufacturer', e.value)}
            />
          </div>
        </div>

        {/* Tags + Return Policy */}
        <div className="form-row">
          <div className="form-field">
            <label>Tags</label>
            <DropDownListComponent
              name="tags"
              value={formData.tags}
              dataSource={tagsOptions}
              fields={fields}
              change={(e: any) => updateField('tags', e.value)}
            />
          </div>

          <div className="form-field">
            <label>Return Policy</label>
            <TextBoxComponent
              name="returnPolicy"
              value={formData.returnPolicy}
              change={(e: any) => updateField('returnPolicy', e.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-row full">
          <div className="form-field">
            <label>Description</label>
            <TextBoxComponent
              name="description"
              value={formData.description || ''}
              multiline={true}
             
              change={(e: any) => updateField('description', e.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingAdditionalDetails && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div
            style={{
              padding: '20px 40px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#333',
            }}
          >
            Loading additional details...
          </div>
        </div>
      )}
    </div>
  );
}); 