import { createApiClient } from '@boks/api-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

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
