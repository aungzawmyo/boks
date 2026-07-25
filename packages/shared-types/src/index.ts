import type {
  BookFormatType,
  BookStatus,
  OrderStatus,
  Role,
  ShippingMethodId,
} from '@boks/configuration';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface AuthorDto {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PublisherDto {
  id: string;
  name: string;
  slug: string;
}

export interface BookFormatDto {
  id: string;
  format: BookFormatType;
  price: number;
  compareAtPrice?: number | null;
  isbn?: string | null;
  sku?: string | null;
  previewPages?: number | null;
  currency: string;
}

export interface InventoryDto {
  id: string;
  warehouseName: string;
  onHand: number;
  lowStockThreshold: number;
}

export interface BookListItemDto {
  id: string;
  title: string;
  slug: string;
  language: string;
  coverUrl?: string | null;
  status: BookStatus;
  averageRating: number;
  reviewCount: number;
  authors: AuthorDto[];
  categories: CategoryDto[];
  formats: BookFormatDto[];
  lowestPrice?: number | null;
}

export interface BookDetailDto extends BookListItemDto {
  description: string;
  publisher?: PublisherDto | null;
  inventory?: InventoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface AddressDto {
  id: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface CartItemDto {
  id: string;
  bookFormatId: string;
  bookId: string;
  title: string;
  slug: string;
  format: BookFormatType;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  coverUrl?: string | null;
  authorName?: string | null;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
  hasPhysicalItems: boolean;
}

export interface OrderItemDto {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  format: BookFormatType;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  number: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingMethod?: ShippingMethodId | null;
  address?: AddressDto | null;
  paymentProvider?: string | null;
  trackingNumber?: string | null;
  items: OrderItemDto[];
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  /** Present in admin listings */
  customer?: { id: string; email: string; name: string } | null;
}

export interface CheckoutResponseDto {
  order: OrderDto;
  payment: {
    provider: 'mock' | 'stripe';
    clientSecret?: string | null;
  };
}

export interface DashboardStatsDto {
  netRevenue: number;
  revenueGrowth: number;
  orders: number;
  ordersGrowth: number;
  ebooksSold: number;
  ebooksGrowth: number;
  lowStockCount: number;
}
