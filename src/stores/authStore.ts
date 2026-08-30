import { create } from 'zustand';
import { tokenStorage } from '../storage/tokenStorage';

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  shopId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true initially until session is restored
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => {
    tokenStorage.clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
