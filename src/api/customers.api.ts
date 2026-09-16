import { apiClient } from './client';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string | null;
  businessName?: string | null;
  address?: string | null;
  area?: string | null;
  district?: string | null;
  notes?: string | null;
  creditLimit: string;
  currentBalance: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string | null;
  createdAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface CustomerLedgerItem {
  id: string;
  type: 'PURCHASE' | 'PAYMENT' | 'OPENING_BALANCE' | 'REFUND' | 'REVERSAL';
  referenceId?: string;
  sourceId?: string;
  date?: string;
  entryDate?: string;
  debit: string;
  credit: string;
  balance?: string;
  balanceAfter?: string;
  description: string;
}

export interface CustomerLedgerResponse {
  success: boolean;
  data: CustomerLedgerItem[];
  meta: {
    currentBalance: string;
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  alternatePhone?: string;
  businessName?: string;
  address?: string;
  area?: string;
  district?: string;
  notes?: string;
  creditLimit?: string;
  openingBalance?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: 'ACTIVE' | 'INACTIVE';
}

export const customersApi = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; status?: 'ACTIVE' | 'INACTIVE'; hasDue?: boolean }): Promise<{ items: Customer[]; meta: CustomerListResponse['meta'] }> => {
    const response = await apiClient.get<CustomerListResponse>('/customers', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<CustomerResponse>(`/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: CreateCustomerInput): Promise<Customer> => {
    const response = await apiClient.post<CustomerResponse>('/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerInput): Promise<Customer> => {
    const response = await apiClient.patch<CustomerResponse>(`/customers/${id}`, data);
    return response.data.data;
  },

  getCustomerLedger: async (id: string, params?: { page?: number; limit?: number }): Promise<{ items: CustomerLedgerItem[]; meta: any }> => {
    const response = await apiClient.get<CustomerLedgerResponse>(`/customers/${id}/ledger`, { params });
    const rawItems = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const items = rawItems.map((item: any) => ({
      ...item,
      date: item.date || item.entryDate || item.createdAt,
      referenceId: item.referenceId || item.sourceId || "",
      balance: item.balance ?? item.balanceAfter ?? "0",
    }));
    const meta = response.data.meta || (response.data.data as any)?.meta || {};
    return { items, meta };
  },
};
