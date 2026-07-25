# Overview

## What is boks?

**boks** is a modern bookstore platform for selling **physical books** and **digital books** (EPUB/PDF) under a **single-store** model (not a multi-vendor marketplace).

Customers browse and buy through a mobile app. Store operators manage catalog, inventory, orders, and content through a web admin panel. Both clients talk to one NestJS API backed by PostgreSQL and S3-compatible object storage.

## Applications

| App | Tech | Purpose |
|-----|------|---------|
| Mobile | React Native (Expo) | Customer storefront, library, reader (later) |
| Admin | Next.js + TailAdmin (free) | Back-office dashboard and CRUD |
| API | NestJS + Prisma | Business logic, auth, catalog, uploads |

## Shared packages

| Package | Role |
|---------|------|
| `@boks/shared-types` | Shared DTO / response types |
| `@boks/validation` | Zod schemas for inputs |
| `@boks/api-client` | Typed HTTP client for mobile + admin |
| `@boks/configuration` | Roles, formats, constants |
| `@boks/design-tokens` | Mobile brand colors, radii, spacing |

## Users

| Persona | Access |
|---------|--------|
| Customer | Mobile app: browse, search, account; later cart, library, reader |
| Admin / Staff | Admin panel: dashboard, catalog CRUD; later orders, inventory, reports |
| System | Docker services: Postgres, Redis, MinIO |

## Product principles

1. **Single store** — one merchant; avoid marketplace commissions and seller onboarding complexity.
2. **Dual format** — every title can offer physical and/or ebook SKUs with separate pricing.
3. **Private digital assets** — ebook originals are never public; ownership is checked before issuing short-lived download URLs (Phase 4).
4. **Phased delivery** — ship a usable catalog first; commerce and reader follow.

## Design direction

- **Mobile**: cream background (`#F9F8F3`), forest green primary (`#1A4334`), rounded cards; browse patterns inspired by Play Store / Play Books / familiar social feed patterns.
- **Admin**: TailAdmin layout and components, customized for bookstore navigation (Overview, Catalog, Commerce, Inventory, Digital Library, Content, General).

## Out of scope (intentionally)

- Multi-vendor / marketplace
- Seller payouts and commission engines
- White-label storefront builder

See [phases.md](./phases.md) for what ships when.
