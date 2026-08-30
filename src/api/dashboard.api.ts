import { apiClient } from './client';
import { Customer } from './customers.api';

export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    activeCustomers: number;
    totalDue: string;
    todaySales: string;
    monthSales: string;
    todayCollections: string;
    pendingDeliveries: number;
    recentPurchases: Array<{
      id: string;
      purchaseDate: string;
      netAmount: string;
      status: string;
      customer: {
        id: string;
        name: string;
        phone: string;
      };
      invoice?: {
        invoiceNumber: string;
        dueAmount: string;
      };
    }>;
    recentPayments: Array<{
      id: string;
      paymentDate: string;
      amount: string;
      method: string;
      customer: {
        id: string;
        name: string;
        phone: string;
      };
    }>;
  };
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse['data']> => {
    const response = await apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
    return response.data.data;
  },
};
