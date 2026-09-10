import { apiClient } from './client';

export interface SmsLogItem {
  id: string;
  recipientName?: string | null;
  phone: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  createdAt: string;
  sentAt?: string | null;
  failureReason?: string | null;
}

export interface SmsListResponse {
  success: boolean;
  data: SmsLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const smsApi = {
  getSmsHistory: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<{ items: SmsLogItem[]; meta: SmsListResponse['meta'] }> => {
    const response = await apiClient.get<SmsListResponse>('/sms/history', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  resendSms: async (smsId: string): Promise<SmsLogItem> => {
    const response = await apiClient.post<{ success: boolean; data: SmsLogItem }>('/sms/resend', { smsId, id: smsId });
    return response.data.data;
  },
};
