export interface DataManagerInput {
  skip: number
  take: number
  group: string[]
  sorted?: string | SortParam[];   // ⬅ Accept string OR array
  search?: string ; // ⬅ Accept string OR array
  where: string      
  requiresCounts: boolean
  aggregates: string[]
  params: string
}

export interface ProductDetails {
  productId?: string;
  productImage?: string;
  productName?: string;
  category?: string;
  brand?: string;
  sellingPrice?: number;
  mrp?: number;
  discount?: number;
  stockQuantity?: number;
  stockStatus?: string;
  rating?: number;
  minimumOrderQuantity?: number;
  manufacturer?: string;
  tags?: string[];
  warrantyPeriod?: number;
  returnPolicy?: string;

}

export interface AvatarEntry {
  FileName: string;
  Base64Data: string;
};


export interface FilterPredicate {
  field: string;
  operator: string;
  value: any;
  ignoreCase?: boolean;
}

export interface FilterBlock {
  condition?: "and" | "or";
  ignoreCase?: boolean;
  isComplex?: boolean;
  predicates: (FilterPredicate | FilterBlock)[];
}

export interface SortParam {
  name: string;
  direction: 'asc' | 'desc' | string; // adjust if needed
}


export interface GetProductsArgs {
  datamanager: DataManagerInput;
}


export interface CreateProductArgs {
  value: ProductDetails;
}


export interface UpdateProductArgs {
  key: string | number;
  keyColumn: keyof ProductDetails;       // "productId" | "name" | ...
  value: Partial<ProductDetails>;

}

export interface DeleteProductArgs {
  key: string | number;
  keyColumn?: keyof ProductDetails;
}




export type ExpenseInput = Omit<ProductDetails, 'productId'>;