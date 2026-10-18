/**
 * API Service Module
 * Handles all HTTP requests to the Flask backend
 * TypeScript version with proper type annotations
 */
import { AxiosInstance } from 'axios';
declare const apiClient: AxiosInstance;
/**
 * Type definitions
 */
export interface Product {
    id: number;
    productName: string;
    category: string;
    productId: string;
    price: number;
    stock: number;
    status: 'In Stock' | 'Out of Stock' | 'Discontinued';
    createdAt?: string;
    updatedAt?: string;
}
export interface SortDescriptor {
    field: string;
    direction: 'asc' | 'desc';
}
export interface FilterDescriptor {
    field: string;
    operator: string;
    value: unknown;
}
export interface ProductQueryParams {
    skip?: number;
    take?: number;
    sorted?: SortDescriptor[];
    where?: FilterDescriptor[];
    search?: string;
}
export interface ApiResponse<T> {
    result: T;
    count: number;
    message?: string;
}
export interface StatsResponse {
    totalProducts: number;
    totalStock: number;
    totalValue: number;
    inStockProducts: number;
}
/**
 * Product API endpoints
 */
export declare const productAPI: {
    /**
     * Get products with server-side data binding
     * Supports paging, filtering, sorting, and searching
     */
    getProducts: (params?: ProductQueryParams) => Promise<ApiResponse<Product[]>>;
    /**
     * Get a single product by ID
     */
    getProduct: (prod: string) => Promise<Product>;
    /**
     * Create a new product
     */
    createProduct: (productData: Omit<Product, "id">) => Promise<Product>;
    /**
     * Update an existing product
     */
    updateProduct: (prod: string, productData: Partial<Product>) => Promise<Product>;
    /**
     * Delete a product
     */
    deleteProduct: (prod: string) => Promise<{
        message: string;
    }>;
    /**
     * Get inventory statistics
     */
    getStats: () => Promise<StatsResponse>;
};
export default apiClient;
