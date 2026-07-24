import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { UserDto } from '@boks/shared-types';
import {
  api,
  clearSession,
  getAccessToken,
  getStoredUser,
  setSession,
} from '@/lib/api';

type AuthContextValue = {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setUser(await getStoredUser<UserDto>());
          return;
        }
        const me = await api.auth.me();
        setUser(me);
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const result = await api.auth.login({ email, password });
        await setSession(
          result.accessToken,
          result.refreshToken,
          JSON.stringify(result.user),
        );
        setUser(result.user);
      },
      async register(input) {
        const result = await api.auth.register(input);
        await setSession(
          result.accessToken,
          result.refreshToken,
          JSON.stringify(result.user),
        );
        setUser(result.user);
      },
      async logout() {
        await clearSession();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
