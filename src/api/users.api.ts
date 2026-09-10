import { apiClient } from './client';

export interface UserItem {
  id: string;
  shopId: string;
  name: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'OPERATOR' | 'DRIVER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface UserListResponse {
  success: boolean;
  data: UserItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateUserInput {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'OPERATOR' | 'DRIVER' | 'VIEWER';
}

export const usersApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ items: UserItem[]; meta: UserListResponse['meta'] }> => {
    const response = await apiClient.get<UserListResponse>('/users', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  createUser: async (data: CreateUserInput): Promise<UserItem> => {
    const response = await apiClient.post<{ success: boolean; data: UserItem }>('/users', data);
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'): Promise<UserItem> => {
    const response = await apiClient.patch<{ success: boolean; data: UserItem }>(`/users/${id}/status`, { status });
    return response.data.data;
  },
};
