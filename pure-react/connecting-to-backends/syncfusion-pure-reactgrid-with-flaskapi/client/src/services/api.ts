/**
 * API Service Module
 * Handles all HTTP requests to the Flask backend.
 */
import axios, { type AxiosInstance } from 'axios'

// const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000/api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://hbxdz9dw-5000.inc1.devtunnels.ms/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Surface only server-side failures so request paths stay quiet.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response) {
      console.error('[api] request failed:', error.response.status, error.response.data)
    }
    return Promise.reject(error)
  }
)

const toJsonString = (value: unknown): string | undefined => (value == null ? undefined : JSON.stringify(value))

export interface Product {
  id: number
  productName: string
  category: string
  /** Business-facing product identifier, e.g. PROD-000001 */
  productId: string
  price: number
  stock: number
  status: 'In Stock' | 'Out of Stock' | 'Discontinued'
  supplier?: string
  createdAt?: string
  updatedAt?: string
}

export const PRODUCT_STATUS_OPTIONS = [
  { text: 'In Stock', value: 'In Stock' },
  { text: 'Out of Stock', value: 'Out of Stock' },
  { text: 'Discontinued', value: 'Discontinued' }
]

export const PRODUCT_CATEGORY_OPTIONS = [
  'Electronics',
  'Accessories',
  'Storage',
  'Networking',
  'Software',
  'Components',
  'Peripherals',
  'Smart Devices'
]

export interface SortDescriptor {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterDescriptor {
  field: string
  operator: string
  value: unknown
}

export interface FilterGroup {
  condition?: 'and' | 'or'
  predicates?: FilterDescriptor[]
  [key: string]: unknown
}

export interface ProductQueryParams {
  skip?: number
  take?: number
  sorted?: SortDescriptor[]
  where?: FilterDescriptor[] | FilterGroup[]
  search?: string
}

export interface ApiResponse<T> {
  result: T
  count: number
  message?: string
}

export interface StatsResponse {
  totalProducts: number
  totalStock: number
  totalValue: number
  inStockProducts: number
}

export const productAPI = {
  getProducts: async (params: ProductQueryParams = {}): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: {
        skip: params.skip ?? 0,
        take: params.take ?? 25,
        sorted: toJsonString(params.sorted),
        where: toJsonString(params.where),
        search: params.search || undefined
      }
    })
    return response.data
  },

  getProduct: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${encodeURIComponent(productId)}`)
    return response.data
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', productData)
    return response.data
  },

  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${encodeURIComponent(productId)}`, productData)
    return response.data
  },

  deleteProduct: async (productId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/products/${encodeURIComponent(productId)}`)
    return response.data
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await apiClient.get<StatsResponse>('/stats')
    return response.data
  }
}

export default apiClient
