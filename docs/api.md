# API reference

Base URL (local): `http://localhost:3001`

All JSON endpoints use `Content-Type: application/json` unless noted (multipart for uploads).

## Conventions

| Item | Detail |
|------|--------|
| Auth header | `Authorization: Bearer <accessToken>` |
| Errors | NestJS shape: `{ statusCode, message, error? }` |
| Pagination | `page`, `pageSize` query params; response `meta: { page, pageSize, total, totalPages }` |
| Roles | `ADMIN` / `STAFF` required for `/admin/*` (except public catalog) |

---

## Health

### `GET /health`

No auth.

```json
{ "status": "ok", "service": "boks-api" }
```

---

## Auth

### `POST /auth/register`

Body:

```json
{
  "email": "reader@example.com",
  "password": "Secret123!",
  "firstName": "Alex",
  "lastName": "Reader"
}
```

Response: `AuthTokensDto` — `{ accessToken, refreshToken, user }`.

### `POST /auth/login`

Body: `{ "email", "password" }` → tokens + user.

### `POST /auth/refresh`

Body: `{ "refreshToken" }` → new tokens (old refresh invalidated).

### `POST /auth/forgot-password`

Body: `{ "email" }`.

Always returns a generic success message. In development, may include `resetToken` when the user exists (no email provider yet).

### `POST /auth/reset-password`

Body: `{ "token", "password" }`.

### `GET /auth/me`

Requires Bearer token. Returns current `user`.

---

## Public catalog

### `GET /books`

Query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search title, description, author name |
| `category` | string | Category id or slug |
| `author` | string | Author id or slug |
| `publisher` | string | Publisher id or slug |
| `language` | string | e.g. `en` |
| `format` | `PHYSICAL` \| `EBOOK` | Has that format |
| `sort` | `newest` \| `title` \| `price_asc` \| `price_desc` \| `rating` | Default `newest` |
| `page` | number | Default `1` |
| `pageSize` | number | Default `20`, max `100` |

Only **PUBLISHED** books.

Response:

```json
{
  "data": [ /* BookListItemDto */ ],
  "meta": { "page": 1, "pageSize": 20, "total": 12, "totalPages": 1 }
}
```

### `GET /books/:idOrSlug`

Book detail by UUID or slug. Published only.

### `GET /authors`

### `GET /authors/:id`

### `GET /categories`

### `GET /publishers`

---

## Admin — dashboard

### `GET /admin/dashboard`

Auth: ADMIN | STAFF.

Returns KPI payload (commerce numbers are Phase-1 placeholders; `lowStockCount` is live from inventory).

```json
{
  "netRevenue": 124560.8,
  "revenueGrowth": 18.6,
  "orders": 1248,
  "ordersGrowth": 14.3,
  "ebooksSold": 832,
  "ebooksGrowth": 22.7,
  "lowStockCount": 23,
  "publishedBooks": 12
}
```

---

## Admin — books

All require ADMIN | STAFF. Lists include drafts.

### `GET /admin/books`

Same query params as public list.

### `GET /admin/books/:id`

### `POST /admin/books`

Example body:

```json
{
  "title": "The Silent Voyage",
  "description": "A maritime mystery…",
  "language": "en",
  "status": "PUBLISHED",
  "publisherId": "<uuid>",
  "authorIds": ["<uuid>"],
  "categoryIds": ["<uuid>"],
  "inventoryOnHand": 40,
  "formats": [
    {
      "format": "PHYSICAL",
      "price": 16.99,
      "currency": "USD",
      "isbn": "9781234567890",
      "sku": "PHY-SILENT"
    },
    {
      "format": "EBOOK",
      "price": 9.99,
      "currency": "USD",
      "previewPages": 15
    }
  ]
}
```

### `PATCH /admin/books/:id`

Partial update of the same fields.

### `DELETE /admin/books/:id`

---

## Admin — authors / categories / publishers

| Method | Path |
|--------|------|
| GET | `/admin/authors` |
| POST | `/admin/authors` — `{ name, slug?, bio? }` |
| PATCH | `/admin/authors/:id` |
| DELETE | `/admin/authors/:id` |
| GET | `/admin/categories` |
| POST | `/admin/categories` — `{ name, slug?, description? }` |
| PATCH | `/admin/categories/:id` |
| DELETE | `/admin/categories/:id` |
| GET | `/admin/publishers` |
| POST | `/admin/publishers` — `{ name, slug? }` |
| PATCH | `/admin/publishers/:id` |
| DELETE | `/admin/publishers/:id` |

---

## Admin — uploads

### `POST /admin/uploads/cover`

Auth: ADMIN | STAFF.  
`multipart/form-data` field name: `file` (max ~5 MB).

Response:

```json
{
  "key": "covers/<uuid>.jpg",
  "url": "http://localhost:9000/boks-covers/covers/<uuid>.jpg"
}
```

Use `key` as `coverKey` when creating/updating a book.

---

## Cart (Phase 2)

All cart endpoints require auth and return the full `CartDto`:
`{ id, items[], subtotal, itemCount, hasPhysicalItems }`.

| Endpoint | Description |
|----------|-------------|
| `GET /cart` | Get (or lazily create) the current user's cart |
| `POST /cart/items` | Body `{ bookFormatId, quantity? }` — adds/increments (ebooks capped at 1) |
| `PATCH /cart/items/:itemId` | Body `{ quantity }` — `0` removes the line |
| `DELETE /cart/items/:itemId` | Remove one line |
| `DELETE /cart` | Clear the cart |

## Addresses (Phase 2)

| Endpoint | Description |
|----------|-------------|
| `GET /addresses` | List the user's addresses (default first) |
| `POST /addresses` | Create — first address becomes default automatically |
| `PATCH /addresses/:id` | Update; `isDefault: true` unsets other defaults |
| `DELETE /addresses/:id` | Delete |

## Checkout & orders (Phase 2)

### `POST /checkout`

Body: `{ "addressId": "<uuid>", "shippingMethod": "standard" | "express" }`
(address/method required only when the cart contains physical items).

Validates stock, creates an order (`PENDING_PAYMENT`) with snapshot items, and
returns `{ order, payment: { provider: "stripe" | "mock", clientSecret } }`.
Shipping: standard $3.99 (free ≥ $25 subtotal), express $9.99.

### `POST /orders/:id/pay`

Settles the order. With the mock provider it succeeds immediately; with Stripe
it verifies the PaymentIntent status first. On success: status → `PAID`,
physical inventory decremented, cart cleared.

### Other order endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /orders` | Current user's orders (newest first) |
| `GET /orders/:id` | Order detail (owner only) |
| `POST /orders/:id/cancel` | Allowed while `PENDING_PAYMENT` or `PAID`; restores inventory |

### Admin orders (ADMIN | STAFF)

| Endpoint | Description |
|----------|-------------|
| `GET /admin/orders` | Paginated; filters: `status`, `q` (order number or customer email) |
| `GET /admin/orders/:id` | Detail incl. customer info |
| `PATCH /admin/orders/:id/status` | Body `{ status, trackingNumber? }` — transitions: PAID→PROCESSING→SHIPPED→DELIVERED, plus CANCELLED/REFUNDED (restores inventory) |

`GET /admin/dashboard` now returns live KPIs computed from orders (net revenue,
order count, ebooks sold, 30-day growth vs the previous 30 days, low stock).

---

## Typed client

Prefer the shared client:

```ts
import { createApiClient } from "@boks/api-client";

const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getAccessToken: () => localStorage.getItem("boks_access_token"),
});

await api.books.list({ q: "silent", sort: "rating" });
await api.admin.books.create({ /* ... */ });
```

## Example: login (PowerShell)

```powershell
$body = '{"email":"admin@boks.local","password":"Admin123!"}'
Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method POST -Body $body -ContentType 'application/json'
```
