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
  data: {
    items: Customer[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface CustomerLedgerItem {
  id: string;
  type: 'PURCHASE' | 'PAYMENT' | 'OPENING_BALANCE' | 'REFUND';
  referenceId: string;
  date: string;
  debit: string;
  credit: string;
  balance: string;
  description: string;
}

export interface CustomerLedgerResponse {
  success: boolean;
  data: {
    items: CustomerLedgerItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; status?: 'ACTIVE' | 'INACTIVE'; hasDue?: boolean }): Promise<CustomerListResponse['data']> => {
    const response = await apiClient.get<CustomerListResponse>('/customers', { params });
    return response.data.data;
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

  getCustomerLedger: async (id: string, params?: { page?: number; limit?: number }): Promise<CustomerLedgerResponse['data']> => {
    const response = await apiClient.get<CustomerLedgerResponse>(`/customers/${id}/ledger`, { params });
    return response.data.data;
  },
};
