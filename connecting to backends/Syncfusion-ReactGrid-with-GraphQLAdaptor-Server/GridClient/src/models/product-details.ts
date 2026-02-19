
export type ProductDetails =  {
  productId?: string | number;
  productImage?: string;
  productName?: string;
  category?: string;
  brand?: string;
  rating?: number;
  mrp?: number;
  sellingPrice?: number;
  discount?: number;
  stockQuantity?: number;
  stockStatus?: string;  
  minimumOrderQuantity?: number;
  manufacturer?: string;
  tags?: string;           
  description?: string;
  warrantyPeriod?: number;    
  returnPolicy?: string;
}

export interface ProductDialogProps {
  visible: boolean;
  rowData: ProductDetails | null;
  onBeforeOpen?: () => void;
  onClose: () => void;
  width?: string;
}

