import { apiClient } from './client';

export interface PurchaseItemInput {
  productId?: string;
  name?: string;
  unit?: string;
  quantity: string;
  unitPrice?: string;
  discount?: string;
  note?: string;
}

export interface InitialPaymentInput {
  amount: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_BANKING' | 'CHEQUE' | 'OTHER';
  reference?: string;
  note?: string;
}

export interface DeliveryInput {
  address: string;
  contact: string;
  scheduledAt?: string;
  transportCharge?: string;
  notes?: string;
}

export interface CreatePurchaseInput {
  customerId: string;
  purchaseDate?: string;
  items: PurchaseItemInput[];
  discount?: string;
  notes?: string;
  initialPayment?: InitialPaymentInput;
  delivery?: DeliveryInput;
}

export interface PurchaseResponse {
  success: boolean;
  data: {
    id: string;
    purchaseDate: string;
    netAmount: string;
    status: string;
    invoice: {
      id: string;
      invoiceNumber: string;
      totalAmount: string;
      dueAmount: string;
    };
  };
}

export interface PurchaseListItem {
  id: string;
  purchaseDate: string;
  netAmount: string;
  status: string;
  notes?: string | null;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: string;
    dueAmount: string;
  };
  items?: Array<{
    id: string;
    name?: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    product?: {
      name: string;
    };
  }>;
}

export interface PurchaseListResponse {
  success: boolean;
  data: PurchaseListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const purchasesApi = {
  createPurchase: async (data: CreatePurchaseInput, idempotencyKey?: string): Promise<PurchaseResponse['data']> => {
    const key = idempotencyKey || `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const response = await apiClient.post<PurchaseResponse>('/purchases', data, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return response.data.data;
  },

  getPurchase: async (id: string): Promise<PurchaseListItem> => {
    const response = await apiClient.get<{ success: boolean; data: PurchaseListItem }>(`/purchases/${id}`);
    return response.data.data;
  },

  getPurchases: async (params?: { page?: number; limit?: number; customerId?: string; status?: 'DRAFT' | 'CONFIRMED' | 'VOIDED'; from?: string; to?: string }): Promise<{ items: PurchaseListItem[]; meta: PurchaseListResponse['meta'] }> => {
    const response = await apiClient.get<PurchaseListResponse>('/purchases', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  }
};
