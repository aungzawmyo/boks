import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const bookSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string().optional(),
  format: z.enum(['PHYSICAL', 'EBOOK']).optional(),
  sort: z
    .enum(['newest', 'title', 'price_asc', 'price_desc', 'rating'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const bookFormatInputSchema = z.object({
  format: z.enum(['PHYSICAL', 'EBOOK']),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  isbn: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  previewPages: z.number().int().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  fileKey: z.string().optional().nullable(),
});

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(320).optional(),
  description: z.string().min(1),
  language: z.string().min(2).max(16).default('en'),
  coverKey: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publisherId: z.string().uuid().optional().nullable(),
  authorIds: z.array(z.string().uuid()).min(1),
  categoryIds: z.array(z.string().uuid()).min(1),
  formats: z.array(bookFormatInputSchema).min(1),
  inventoryOnHand: z.number().int().min(0).optional().default(0),
});

export const updateBookSchema = createBookSchema.partial();

export const createAuthorSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(220).optional(),
  bio: z.string().optional().nullable(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).optional(),
  description: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createPublisherSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(220).optional(),
});

export const updatePublisherSchema = createPublisherSchema.partial();

export const addressInputSchema = z.object({
  fullName: z.string().min(1).max(200),
  line1: z.string().min(1).max(300),
  line2: z.string().max(300).optional().nullable(),
  city: z.string().min(1).max(120),
  state: z.string().max(120).optional().nullable(),
  postalCode: z.string().min(1).max(30),
  country: z.string().min(2).max(2).default('US'),
  phone: z.string().max(40).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressInputSchema.partial();

export const addToCartSchema = z.object({
  bookFormatId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid().optional().nullable(),
  shippingMethod: z.enum(['standard', 'express']).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
  trackingNumber: z.string().max(120).optional().nullable(),
});

export const orderSearchSchema = z.object({
  status: z
    .enum([
      'PENDING_PAYMENT',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ])
    .optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookSearchInput = z.infer<typeof bookSearchSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
