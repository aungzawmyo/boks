export const APP_NAME = 'boks';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const BOOK_FORMATS = {
  PHYSICAL: 'PHYSICAL',
  EBOOK: 'EBOOK',
} as const;

export type BookFormatType = (typeof BOOK_FORMATS)[keyof typeof BOOK_FORMATS];

export const BOOK_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type BookStatus = (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const SHIPPING_METHODS = {
  standard: {
    id: 'standard',
    label: 'Standard delivery',
    description: '3–5 business days',
    fee: 3.99,
    freeOver: 25,
  },
  express: {
    id: 'express',
    label: 'Express delivery',
    description: '1–2 business days',
    fee: 9.99,
    freeOver: null as number | null,
  },
} as const;

export type ShippingMethodId = keyof typeof SHIPPING_METHODS;

export function shippingFeeFor(
  method: ShippingMethodId,
  subtotal: number,
): number {
  const m = SHIPPING_METHODS[method];
  if (m.freeOver != null && subtotal >= m.freeOver) return 0;
  return m.fee;
}
