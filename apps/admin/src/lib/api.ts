import { createApiClient } from "@boks/api-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("boks_access_token");
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("boks_access_token", accessToken);
  localStorage.setItem("boks_refresh_token", refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem("boks_access_token");
  localStorage.removeItem("boks_refresh_token");
  localStorage.removeItem("boks_user");
}

export function setUser(user: unknown) {
  localStorage.setItem("boks_user", JSON.stringify(user));
}

export function getUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("boks_user");
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
