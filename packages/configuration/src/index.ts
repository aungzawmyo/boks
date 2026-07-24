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
