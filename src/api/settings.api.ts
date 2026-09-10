import { apiClient } from './client';

export interface CompanySettings {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupHistoryItem {
  id: string;
  backupName: string;
  sizeBytes?: number;
  status: string;
  createdAt: string;
}

export const settingsApi = {
  getCompanySettings: async (): Promise<CompanySettings> => {
    const response = await apiClient.get<{ success: boolean; data: CompanySettings }>('/settings/company');
    return response.data.data;
  },

  updateCompanySettings: async (data: { name?: string; address?: string; phone?: string }): Promise<CompanySettings> => {
    const response = await apiClient.patch<{ success: boolean; data: CompanySettings }>('/settings/company', data);
    return response.data.data;
  },

  triggerBackup: async (notes?: string): Promise<{ backupId: string; message: string }> => {
    const response = await apiClient.post<{ success: boolean; data: any }>('/settings/backup', { notes });
    return response.data.data;
  },

  getBackupHistory: async (): Promise<BackupHistoryItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackupHistoryItem[] }>('/settings/backup/history');
    return response.data.data || [];
  },

  restoreBackup: async (backupId: string): Promise<void> => {
    await apiClient.post('/settings/restore', { backupId });
  },
};
