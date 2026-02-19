import React, { useMemo, useRef } from 'react';
import { DialogComponent} from '@syncfusion/ej2-react-popups';
import type { ProductDialogProps } from '../models/product-details';
import "../styles/ShowMoreDetailsDialog.css";

export const ProductDialog: React.FC<ProductDialogProps> = ({
  visible,
  rowData,
  onBeforeOpen,
  onClose,
  width = '700px',
}) => {
  const dialogRef = useRef<DialogComponent>(null);
  const headerText = useMemo(() => rowData?.productName ?? '', [rowData]);
  const tags : string = rowData?.tags ? rowData.tags.trim() : '';
  const fmtInt = (n?: number) => typeof n === 'number' && !isNaN(n) ? Math.round(n).toLocaleString() : '--';
  const stars = [1, 2, 3, 4, 5];    
  const mrp : number = rowData?.mrp ?? 0;
  const discount: number = rowData?.discount ?? 0;
  const sellingPrice: number = mrp - (mrp * discount);

  return (
    <DialogComponent
      ref={dialogRef}
      visible={visible}
      header={headerText}
      showCloseIcon={true}
      width={width}
      beforeOpen={onBeforeOpen}
      close={onClose}
      position={{ X: 'center', Y: 'center' }}
      animationSettings={{ effect: 'Zoom', duration: 150 }}
      cssClass="product-dialog modern-dialog"
    >
      <div className="product-dialog-content">
        {/* Header with title + subtitle */}
        <div className="dialog-header">
          <h3>Product Details</h3>
          <div className="product-title-highlight">
            {rowData?.brand} • {rowData?.category}
          </div>
        </div>

        <div className="main-content-grid">
          {/* LEFT: Image + badges + rating */}
          <div className="product-visual">
            <div className="image-container">
              {rowData?.productImage ? (
                <img
                  src={rowData.productImage}
                  alt={`${rowData?.brand ?? ''} ${rowData?.category ?? ''}`.trim()}
                  className="main-product-img"
                  loading="lazy"
                />
              ) : (
                <div className="image-placeholder">No Image</div>
              )}

              {/* Floating badges */}
              <div className="image-badges below-image">
                {!!rowData?.discount && rowData.discount > 0 && (
                  <span className="badge discount">-{rowData.discount}%</span>
                )}
                <span
                  className={`badge stock ${rowData && rowData.stockQuantity !== undefined && rowData.stockQuantity < 10 ? 'low' : ''}`}
                >
                  {rowData?.stockStatus}
                </span>
              </div>
            </div>

            {/* Rating stars */}
            <div className="rating-container">
              <div className="stars">
                {stars.map(star => {
                  const active = (rowData?.rating ?? 0) >= star;
                  const half = (rowData?.rating ?? 0) === star - 0.5;
                  return (
                    <span
                      key={star}
                      className={`${active ? 'active' : ''} ${half ? 'half' : ''}`}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              <span className="rating-text">{rowData?.rating ?? 0} / 5</span>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="product-info">
            <div className="price-block">
              <div className="current-price">
                ${fmtInt(sellingPrice)}
              </div>
              <div className="mrp-strike">
                MRP: <s>${fmtInt(rowData?.mrp)}</s>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="label">Product ID</span>
                <span className="value">{rowData?.productId ?? '--'}</span>
              </div>

              <div className="info-item">
                <span className="label">Stock</span>
                <span className="value">
                  {rowData?.stockQuantity ?? 0} units
                </span>
              </div>

              <div className="info-item">
                <span className="label">Min. Order</span>
                <span className="value">
                  {rowData?.minimumOrderQuantity ?? '--'}
                </span>
              </div>

              <div className="info-item">
                <span className="label">Manufacturer</span>
                <span className="value">{rowData?.manufacturer ?? '--'}</span>
              </div>
            </div>

            {/* Tags */}  
              <div className="tags-container">
                <span className="tag">
                      {tags}
                </span>  
              </div>

            {/* Description */}
            <div className="description">
              <h4>Description</h4>
              <p>{rowData?.description ?? ''}</p>
            </div>

            {/* Footer info */}
            <div className="footer-info">
              <div>
                Warranty: <strong>{rowData?.warrantyPeriod ?? 0} Years</strong>
              </div>
              <div>
                ↩ Return: <strong>{rowData?.returnPolicy ?? '--'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogComponent>
  );
};
