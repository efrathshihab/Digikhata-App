import { apiClient } from './client';
import { tokenStorage } from '../storage/tokenStorage';

export interface LoginParams {
  email: string;
  password: string;
  clientType: 'MOBILE' | 'WEB';
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email?: string;
      role: string;
      shopId: string;
    };
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email?: string;
    role: string;
    shopId: string;
  };
}

export const authApi = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', params);
    return response.data;
  },

  me: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/auth/me');
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.log('[Auth] Server logout request failed:', e);
    } finally {
      await tokenStorage.clearTokens();
    }
  },
};
