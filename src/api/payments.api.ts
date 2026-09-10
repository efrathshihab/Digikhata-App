import { apiClient } from './client';

export interface CreatePaymentInput {
  customerId: string;
  paymentDate?: string;
  amount: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_BANKING' | 'CHEQUE' | 'OTHER';
  reference?: string;
  note?: string;
  attachmentUrl?: string;
  allocations?: Array<{
    invoiceId: string;
    amount: string;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    id: string;
    paymentDate: string;
    amount: string;
    method: string;
    status: string;
  };
}

export interface PaymentListItem {
  id: string;
  paymentDate: string;
  amount: string;
  method: string;
  reference?: string;
  note?: string;
  status: string;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface PaymentListResponse {
  success: boolean;
  data: PaymentListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const paymentsApi = {
  createPayment: async (data: CreatePaymentInput, idempotencyKey?: string): Promise<PaymentResponse['data']> => {
    const key = idempotencyKey || `payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const response = await apiClient.post<PaymentResponse>('/payments', data, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return response.data.data;
  },

  getPayments: async (params?: { page?: number; limit?: number; customerId?: string; status?: 'CONFIRMED' | 'REVERSED'; from?: string; to?: string }): Promise<{ items: PaymentListItem[]; meta: PaymentListResponse['meta'] }> => {
    const response = await apiClient.get<PaymentListResponse>('/payments', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  reversePayment: async (id: string, reason: string, idempotencyKey?: string): Promise<PaymentResponse['data']> => {
    const key = idempotencyKey || `reverse_${id}_${Date.now()}`;
    const response = await apiClient.post<PaymentResponse>(`/payments/${id}/reverse`, { reason }, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return response.data.data;
  }
};
