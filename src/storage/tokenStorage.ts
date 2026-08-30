import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'digikhata_refresh_token';
const isWeb = Platform.OS === 'web';

/**
 * In-memory storage for accessToken.
 * Access token is never written to disk or SecureStore.
 */
let memoryAccessToken: string | null = null;

export const tokenStorage = {
  /**
   * Returns in-memory access token (synchronous/immediate).
   */
  getAccessToken(): string | null {
    return memoryAccessToken;
  },

  /**
   * Sets in-memory access token.
   */
  setAccessToken(token: string | null): void {
    memoryAccessToken = token;
  },

  /**
   * Reads the persistent refresh token from SecureStore.
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      if (isWeb) return localStorage.getItem(REFRESH_TOKEN_KEY);
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error('Error getting refresh token from SecureStore', e);
      return null;
    }
  },

  /**
   * Stores the persistent refresh token in SecureStore.
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Error saving refresh token to SecureStore', e);
    }
  },

  /**
   * Deletes the persistent refresh token from SecureStore.
   */
  async deleteRefreshToken(): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error deleting refresh token from SecureStore', e);
    }
  },

  /**
   * Clears both in-memory access token and persistent refresh token.
   */
  async clearTokens(): Promise<void> {
    memoryAccessToken = null;
    await this.deleteRefreshToken();
  },
};
