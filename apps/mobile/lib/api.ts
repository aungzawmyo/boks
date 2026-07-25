import { createApiClient } from '@boks/api-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * On Expo web opened via LAN (e.g. http://192.168.1.35:8081), rewrite
 * localhost API URLs to the same hostname so the browser hits the host machine.
 * Native / Expo Go still need EXPO_PUBLIC_API_URL=http://<lan-ip>:3001.
 */
function resolveApiUrl(): string {
  const configured = (
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
  ).replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      try {
        const url = new URL(configured);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          url.hostname = host;
          return url.toString().replace(/\/$/, '');
        }
      } catch {
        return `http://${host}:3001`;
      }
    }
  }

  return configured;
}

const API_URL = resolveApiUrl();

const memory = new Map<string, string>();

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return memory.get(key) ?? localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    memory.set(key, value);
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    memory.delete(key);
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken() {
  return getItem('boks_access_token');
}

export async function setSession(accessToken: string, refreshToken: string, userJson: string) {
  await setItem('boks_access_token', accessToken);
  await setItem('boks_refresh_token', refreshToken);
  await setItem('boks_user', userJson);
}

export async function clearSession() {
  await deleteItem('boks_access_token');
  await deleteItem('boks_refresh_token');
  await deleteItem('boks_user');
}

export async function getStoredUser<T>() {
  const raw = await getItem('boks_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const api = createApiClient({
  baseUrl: API_URL,
  getAccessToken,
});

export { API_URL };
