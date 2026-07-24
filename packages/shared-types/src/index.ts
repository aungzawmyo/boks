import type { BookFormatType, BookStatus, Role } from '@boks/configuration';

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

export interface DashboardStatsDto {
  netRevenue: number;
  revenueGrowth: number;
  orders: number;
  ordersGrowth: number;
  ebooksSold: number;
  ebooksGrowth: number;
  lowStockCount: number;
}
