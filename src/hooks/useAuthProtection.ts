import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../storage/tokenStorage';

export function useAuthProtection() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser, logout, setLoading } = useAuthStore();

  useEffect(() => {
    async function restoreSession() {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          // Refresh session to populate in-memory accessToken and rotate refreshToken
          const refreshRes = await authApi.refresh(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data;

          tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) {
            await tokenStorage.setRefreshToken(newRefreshToken);
          }

          const profile = await authApi.me();
          setUser(profile.data);
        } else {
          await tokenStorage.clearTokens();
          logout();
        }
      } catch (e) {
        console.log('[AuthProtection] Session restoration failed:', e);
        await tokenStorage.clearTokens();
        logout();
      } finally {
        setLoading(false);
      }
    }
    
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to dashboard if authenticated and trying to access auth routes
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);
}
