import { apiClient } from './client';

export interface ReportSummary {
  totalSales: string;
  totalCollections: string;
  totalDue: string;
  newCustomersCount: number;
}

export interface SalesReportItem {
  date: string;
  salesCount: number;
  totalAmount: string;
}

export interface PaymentsReportItem {
  date: string;
  paymentsCount: number;
  totalAmount: string;
}

export interface DueAgingBucket {
  bucket: string;
  customerCount: number;
  totalDue: string;
}

export const reportsApi = {
  getSummary: async (params?: { from?: string; to?: string }): Promise<ReportSummary> => {
    const response = await apiClient.get<{ success: boolean; data: ReportSummary }>('/reports/summary', { params });
    return response.data.data;
  },

  getSalesReport: async (params?: { from?: string; to?: string }): Promise<SalesReportItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: SalesReportItem[] }>('/reports/sales', { params });
    return response.data.data;
  },

  getPaymentsReport: async (params?: { from?: string; to?: string }): Promise<PaymentsReportItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: PaymentsReportItem[] }>('/reports/payments', { params });
    return response.data.data;
  },

  getDueAgingReport: async (): Promise<DueAgingBucket[]> => {
    const response = await apiClient.get<{ success: boolean; data: DueAgingBucket[] }>('/reports/due-aging');
    return response.data.data;
  },

  exportReport: async (data: {
    type: 'SUMMARY' | 'SALES' | 'PAYMENTS' | 'DUE_AGING';
    format: 'CSV' | 'PDF';
    from?: string;
    to?: string;
  }): Promise<string> => {
    const response = await apiClient.post<{ success: boolean; data: { downloadUrl?: string; content?: string } }>('/reports/export', data);
    return response.data.data?.downloadUrl || response.data.data?.content || 'Export generated successfully';
  },
};
