import { apiClient } from './client';

export interface Product {
  id: string;
  shopId: string;
  productCode: string;
  name: string;
  categoryId?: string | null;
  unit: string;
  price: string;
  costPrice?: string | null;
  stockQuantity: string;
  minStockAlert: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CreateProductInput {
  name: string;
  categoryId?: string;
  unit: string;
  price: string;
  costPrice?: string;
  stockQuantity?: string;
  minStockAlert?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: string;
  costPrice?: string;
  stockQuantity?: string;
  minStockAlert?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const productsApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    categoryId?: string;
  }): Promise<{ items: Product[]; meta: ProductListResponse['meta'] }> => {
    const response = await apiClient.get<ProductListResponse>('/products', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  createProduct: async (data: CreateProductInput): Promise<Product> => {
    const response = await apiClient.post<ProductResponse>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: UpdateProductInput): Promise<Product> => {
    const response = await apiClient.patch<ProductResponse>(`/products/${id}`, data);
    return response.data.data;
  },
};
