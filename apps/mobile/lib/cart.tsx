import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type CartContextValue = {
  cart: CartDto | null;
  count: number;
  refreshing: boolean;
  refresh: () => Promise<void>;
  add: (bookFormatId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setRefreshing(true);
    try {
      setCart(await api.cart.get());
    } catch {
      // keep the previous cart on transient failures
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.itemCount ?? 0,
      refreshing,
      refresh,
      async add(bookFormatId, quantity = 1) {
        setCart(await api.cart.add({ bookFormatId, quantity }));
      },
      async updateItem(itemId, quantity) {
        setCart(await api.cart.updateItem(itemId, quantity));
      },
      async removeItem(itemId) {
        setCart(await api.cart.removeItem(itemId));
      },
      async clear() {
        setCart(await api.cart.clear());
      },
    }),
    [cart, refreshing, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
