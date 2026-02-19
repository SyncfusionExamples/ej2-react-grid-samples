import React, { useMemo, useRef, useCallback,  } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Group,
  Search,
  Toolbar,
  CommandColumn,
  Edit,
} from "@syncfusion/ej2-react-grids";
import type { CommandModel, DialogEditEventArgs, EditSettingsModel, FilterSettingsModel } from "@syncfusion/ej2-grids";
import { DataManager, GraphQLAdaptor, Query } from "@syncfusion/ej2-data";
import { DialogFormTemplate } from "./EditDialogTemplate";
import { ProductDialog } from "./ShowMoreDetailsDialog";
import { TooltipComponent, type BeforeOpenEventArgs, type TooltipEventArgs } from "@syncfusion/ej2-react-popups";
import { RatingComponent } from "@syncfusion/ej2-react-inputs";

import { type ProductDetails} from '../models/product-details'
import '../styles/ProductGrid.css';


const commands : CommandModel[] = [
      { buttonOption: { content: 'More Details', cssClass: 'e-primary' } }
  ];

const App: React.FC = () => {
  const [dialogVisible, setDialogVisible] = React.useState<Boolean>(false);
  const [dialogData, setDialogData] = React.useState<ProductDetails>(null);
  const gridRef = useRef<GridComponent>(null);
  const toolTip = useRef<TooltipComponent>(null);

  const pageSettings = { pageSize: 10, pageSizes: true };
  const filterSettings: FilterSettingsModel = { type: "CheckBox" };
  const toolbar: string[] = ["Add", "Edit", "Delete", "Search"];
 
  let productData: ProductDetails = {};
   const editSettings : EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: "Dialog",
    template: (props: ProductDetails) => <DialogFormTemplate {...props} />,
  };
  
  //Fetch additional details
  const productProfile : DataManager=  new DataManager({
        url: 'http://localhost:4205/',
        adaptor: new GraphQLAdaptor({
          response: { result: 'getProductById' },
          query: `
            query GetProduct($datamanager: DataManagerInput) {
              getProductById(datamanager: $datamanager) {
                productId,productName,description,minimumOrderQuantity,manufacturer,tags,warrantyPeriod,returnPolicy,sellingPrice
              }
            }
          `
        })
  });

  //Fetch initial records
  const productDetails : DataManager = React.useMemo(() => {
    return new DataManager({
      url: 'http://localhost:4205/',
        adaptor: new GraphQLAdaptor({
          response: {
            result: 'getProducts.result',
            count: 'getProducts.count'
          },
          query: `
            query getProducts($datamanager: DataManagerInput) {
              getProducts(datamanager: $datamanager) {
                count
                result {
                  productId, productImage, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }
            }
          `,
          getMutation: function (action: any): string {       
          if (action === 'insert') {
              return `mutation CreateProductMutation($value: ProductInput!) {
                createProduct(value: $value) {
                  productId, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }`;
            }    
          if (action === 'update') {
              return `mutation UpdateProductMutation($key: String!, $keyColumn: String, $value: ProductInput!) {
                updateProduct(key: $key, keyColumn: $keyColumn, value: $value) {
                  productId, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }`;
            }
          else { 
            // Use this in your getMutation helper
            return `mutation RemoveProductMutation($key: String!, $keyColumn: String) {
              deleteProduct(key: $key, keyColumn: $keyColumn) {
                productId
                productName
                category
                description
                brand
                minimumOrderQuantity
                mrp
                discount
                stockQuantity
                stockStatus
              }
            }`;
              }
            }
        }),
        crossDomain: true,
    });
  }, []); 
  
  let defaultProductImage : string
  const actionBegin = useCallback((args: DialogEditEventArgs) => {
    if(args.requestType == 'beginEdit'){
      defaultProductImage = (args as any).rowData.productImage
    }  
    else if (args.requestType === 'save') {
      const uploadedImageDraft = window.pendingProductImage;
      const resolvedProductImage =
        uploadedImageDraft?.base64 ??
        productData.productImage ??
        defaultProductImage;

      (args as any).data.productImage = resolvedProductImage;
      window.pendingProductImage = null; // cleanup
    }  
  }, []);

  const actionComplete = useCallback((args: DialogEditEventArgs) => {
    if (args.requestType !== 'beginEdit' && args.requestType !== 'add') return;
    const formEl = args.form as HTMLFormElement;
    const formInst = (formEl as any)?.ej2_instances?.[0] || null;

    if (formInst) {

      formInst.addRules?.('productId', {
        required: [true, 'ProductID is required'],
      });
      formInst.addRules?.('productName', {
        required: [true, 'ProductName is required'],
      });
      // Quantity ≥ 1
      formInst.addRules?.('stockQuantity', {
        required: [true, 'Quantity is required'],
        number: [true, 'Quantity must be a valid number'],
        min: [1, 'Quantity must be at least 1']
      });

     // Discount in fraction scale: 0.01 – 1.00
      formInst.addRules?.('discount', {
        required: [true, 'Discount is required'],
        custom: [(args: any) => {
          // Get actual NumericTextBox instance
          const input = args.element as HTMLInputElement;
          const inst = (input as any).ej2_instances?.[0];
          // Real numeric value (NOT the formatted string)
          const value = inst?.value;
          // Validate the number
          return typeof value === 'number' && value >= 0.01 && value <= 1;
        }, 'Enter a value between 0.01 and 1 (i.e., 1% to 100%)']
      });

      // Product ID editable only on Add
      if (args.requestType === 'beginEdit') {
        formInst.removeRules?.('productId');
      }
    }

    // Initial focus
    const nameInput = document.querySelector(
      '.e-dialog .edit-dialog-form [name="productName"]'
    ) as HTMLElement | null;
    nameInput?.focus();
  }, []);


  const commandClick = useCallback(async (args: any) => {
    const rowData = args?.rowData;
    const productId = rowData.productId ?? rowData.ProductID ?? rowData.id;
    const query = new Query().addParams('id', productId);
    const res: any = await productProfile.executeQuery(query);
    
    // DataManager returns { result: any[]; count?: number }
    const detailItem = Array.isArray(res?.result) ? res.result[0] : res?.result;
      
    // Merge base row with fetched details
    const merged = { ...rowData, ...detailItem };
    
    // Update state to show the dialog
    setDialogData(merged);
    setDialogVisible(true);
  }, [productProfile]);

  
  const handleCloseDialog = useCallback(() => {
      setDialogVisible(false);
      setDialogData(null);
    }, []);


  // ------------------------------Template configuaration---------------------------------------------

  //productID tempalte
  function idTemplate(props: any) {
    return (
      <div className="product-id">
        <strong>{props.productId}</strong>
      </div>
    );
  }

  //ProductName Template
  function productTemplate(props: any) {
  return (
    <div className="product-cell">
      <img
        src={props.productImage}               
        alt={props.productName || 'Product'}
        className="product-img"
        loading="lazy"     // good for performance  
      />
      <span className="product-name">{props.productName}</span>
    </div>
  );
}

//StockQtyTemplate
function stockQtyTemplate(props: ProductDetails) { 
  const getQtyClass = (qty: number | undefined): string => {
    if (qty === undefined || qty <= 0) return "qty-zero";
    if (qty <= 5) return "qty-low";
    return "qty-ok";
  };
  return (
    <span className={`qty-badge ${getQtyClass(props.stockQuantity)}`}>
      {props.stockQuantity}
    </span>
  );
}

//Stock Status Template
function stockStatusTemplate(props: ProductDetails) {
  const statusClass = props.stockStatus === 'In Stock' ? 'status-in' : 'status-out';
  return <span className={`status-chip ${statusClass}`}>{props.stockStatus}</span>;
}

//Rating Template
function ratingTemplate(props: any) {
  return <RatingComponent id='rating' value={props.rating} readOnly></RatingComponent>;
}

// --------------------------------Helper Function ------------------------------------------------------
  function isTruncated(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth;
  }

function beforeRender(args: TooltipEventArgs) { 
    const target = args.target as HTMLElement;
      // Guard: ensure we're on a data cell in ProductName column only
      if (!target.classList.contains('e-rowcell') || !target.classList.contains('pn-cell')) {
        // Cancel if somehow triggered elsewhere
        args.cancel = true;
        return;
      }

      // OPTIONAL: show tooltip only when text overflows
      if (!isTruncated(target)) {
        args.cancel = true;
        return;
      }

      // Set tooltip content to the cell's visible text
     (toolTip.current as TooltipComponent).content = target.innerText?.trim() ?? '';
}

//-------------------------Grid Configuaration --------------------------------------------------------
  const memoGrid = useMemo(() => (
    <TooltipComponent ref={toolTip} beforeRender={beforeRender} target=".e-rowcell">
      <GridComponent
        ref={gridRef}
        dataSource={productDetails}
        height={520}
        toolbar={toolbar}
        allowPaging
        allowSorting
        allowFiltering
        pageSettings={pageSettings}
        filterSettings={filterSettings}
        editSettings={editSettings}
        actionBegin={actionBegin}
        commandClick={commandClick}
        actionComplete={actionComplete}>   
      <ColumnsDirective>
        <ColumnDirective
          field="productId"
          headerText="Product ID"
          textAlign="Right"
          width={150}
          isPrimaryKey={true}
          template={idTemplate}
        />
        <ColumnDirective
          field="productName"
          headerText="Product"
          width={260}
          template={productTemplate}
          customAttributes={{ class: 'pn-cell' }}
        />
        <ColumnDirective
          field="category"
          headerText="Category"
          width={120}
          customAttributes={{ class: 'pn-cell' }}
        />
        <ColumnDirective field="brand" headerText="Brand" width={120} />
        <ColumnDirective
          field="rating"
          headerText="Rating"
          width={150}
          textAlign="Right"
          template={ratingTemplate}
        />
        <ColumnDirective
          field="mrp"
          headerText="MRP"
          width={120}
          textAlign="Right"
          format={{ format: 'C2', currency: 'USD' }}
        />
        <ColumnDirective
          field="discount"
          headerText="Discount"
          width={110}
          type="number"
          textAlign="Right"
          format={{ format: 'P0' }}
        />
        <ColumnDirective
          field="stockQuantity"
          headerText="Quantity"
          width={110}
          textAlign="Right"
          allowFiltering={false}
          template={stockQtyTemplate}
        />
        <ColumnDirective
          field="minimumOrderQuantity"
          textAlign="Right"
          type="number"
          visible={false}
        />
        <ColumnDirective
          field="stockStatus"
          headerText="Stock Status"
          width={150}
          template={stockStatusTemplate}
        />
        <ColumnDirective headerText="Commands" width={150} commands={commands} />
      </ColumnsDirective>

        <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, Edit,CommandColumn]} />
      </GridComponent> 
        </TooltipComponent>
    
  ), [
    productDetails,
    actionBegin,
    actionComplete, 
  ]);

  return (
    <div className="app-container">
      {memoGrid}       
      {/* Render the dialog as part of the component tree */}
      {dialogVisible && (
        <ProductDialog
          visible={dialogVisible}
          rowData={dialogData}
          onBeforeOpen={(args:BeforeOpenEventArgs) => {
             args.maxHeight = '100rem';
          }}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default App;
