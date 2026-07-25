# Architecture

## High-level diagram

```text
┌─────────────────┐     ┌─────────────────┐
│  Expo Mobile    │     │  Next.js Admin  │
│  apps/mobile    │     │  apps/admin     │
└────────┬────────┘     └────────┬────────┘
         │  HTTPS / JSON         │
         └──────────┬────────────┘
                    ▼
         ┌─────────────────────┐
         │   NestJS API        │
         │   apps/api :3001    │
         └──────────┬──────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
PostgreSQL       Redis          MinIO / S3
(catalog,        (ready for     covers (public read)
 users, auth)     cache/jobs)   ebooks (private)
```

## Monorepo layout

```text
boks/
  apps/
    api/          NestJS + Prisma
    admin/        Next.js App Router + TailAdmin
    mobile/       Expo Router
  packages/
    api-client/
    shared-types/
    validation/
    configuration/
    design-tokens/
  docs/
  docker-compose.yml
```

## Request flow (catalog)

1. Mobile or Admin calls `@boks/api-client` against `API_URL`.
2. NestJS validates input, applies JWT when required.
3. Prisma reads/writes PostgreSQL.
4. Cover images resolve via `S3_PUBLIC_URL` + `boks-covers` key.
5. Ebook `fileKey` may be stored but is **not** served publicly.

## Auth flow

```text
Client                  API
  │  POST /auth/login    │
  │─────────────────────►│  verify password (bcrypt)
  │◄─────────────────────│  accessToken + refreshToken + user
  │                      │
  │  Authorization: Bearer <access>
  │─────────────────────►│  JwtStrategy → user on request
  │                      │
  │  POST /auth/refresh  │
  │─────────────────────►│  rotate refresh token hash
```

- Access JWT: short-lived (`JWT_ACCESS_EXPIRES_IN`, default `15m`).
- Refresh token: opaque random string, SHA-256 hashed in DB.
- Roles: `CUSTOMER` | `ADMIN` | `STAFF`. Admin routes require `ADMIN` or `STAFF`.

## Storage

| Bucket | Visibility | Contents |
|--------|------------|----------|
| `boks-covers` | Public read | Book cover images |
| `boks-ebooks` | Private | EPUB/PDF originals (Phase 4 downloads via signed URLs) |

API creates buckets on startup when MinIO is reachable.

## Admin UI architecture

- Based on free TailAdmin Next.js template.
- Bookstore sidebar IA: Overview, Catalog, Commerce, Inventory, Digital Library, Content, General.
- Auth tokens stored in `localStorage` (`boks_access_token`, `boks_refresh_token`).
- Catalog pages call `/admin/*` endpoints with Bearer token.

## Mobile UI architecture

- Expo Router: `(auth)`, `(tabs)`, `book/[slug]`.
- Design tokens from `@boks/design-tokens`.
- Session via `expo-secure-store` (native) / `localStorage` (web).
- Metro configured for monorepo workspace packages.

## Cross-cutting packages

Clients should prefer:

- Zod schemas from `@boks/validation` for forms.
- Types from `@boks/shared-types` for UI models.
- `createApiClient()` from `@boks/api-client` instead of raw `fetch`.

## Future architecture hooks

| Concern | Planned approach |
|---------|------------------|
| Payments | Stripe Checkout / PaymentIntents + webhooks |
| Jobs | Redis + BullMQ (emails, low-stock alerts) |
| Push | Expo Notifications / FCM |
| Reader | In-app EPUB/PDF with progress sync API |
| CDN | CloudFront or equivalent in front of signed downloads |
