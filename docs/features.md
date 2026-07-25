# Features

Status legend: **Done** (Phase 1) · **Stub** (UI only) · **Planned** (later phase)

## Customer mobile app

| Feature | Status | Notes |
|---------|--------|-------|
| Registration / login | Done | JWT access + refresh |
| Password recovery | Done | Token returned in API for local/dev email stub |
| Browse by category | Done | Home chips + Explore |
| Search, filter, sort | Done | `q`, category, format, sort |
| Book details | Done | Physical / ebook format selection |
| Ratings display | Done | Seeded average rating + review count |
| Shopping cart | Stub | Cart tab; checkout Phase 2 |
| Coupons / checkout | Planned | Phase 2 |
| Delivery address / shipping | Planned | Phase 2–3 |
| Order tracking / history | Planned | Phase 2–3 |
| Personal digital library | Stub | Library tab |
| EPUB / PDF reader | Planned | Phase 4 |
| Bookmarks / highlights / notes | Planned | Phase 4 |
| Reading progress sync | Planned | Phase 4 |
| Wishlist / recently viewed | Planned | Phase 5 |
| Write reviews | Planned | Phase 5 |
| Push notifications | Planned | Phase 5 |
| Dark mode / i18n | Planned | Phase 5–6 |
| Offline reading | Planned | Phase 6 |

## Physical-book management

| Feature | Status | Notes |
|---------|--------|-------|
| SKU / ISBN on formats | Done | Seeded + editable via book form |
| Stock by warehouse | Done | Single `MAIN` warehouse seed |
| Variants / editions | Planned | Extend `BookFormat` / editions |
| Pricing / discounts | Partial | Base prices done; campaigns Phase 5 |
| Shipping fees / zones | Planned | Phase 3 |
| Packing / shipping / returns | Planned | Phase 3 |
| Low-stock awareness | Partial | Inventory thresholds + dashboard KPI |

## Digital-book management

| Feature | Status | Notes |
|---------|--------|-------|
| Upload EPUB / PDF | Planned | Private `boks-ebooks` bucket reserved |
| Free preview pages | Partial | `previewPages` field on ebook format |
| Licensing / device limits | Planned | Phase 4 |
| Expiring download URLs | Planned | Phase 4 |
| Ownership checks | Planned | Phase 4 |
| Refund / revoke access | Planned | Phase 4 |

## Admin panel

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard KPIs / charts | Done | Live low-stock + seeded commerce KPIs |
| Books CRUD | Done | Create / edit / delete + formats |
| Authors / categories / publishers CRUD | Done | |
| Cover upload API | Done | MinIO public covers bucket |
| Orders / customers / coupons | Stub | Sidebar → Coming soon |
| Inventory / warehouses UI | Stub | Coming soon |
| Digital files / licenses UI | Stub | Coming soon |
| Banners / reviews moderation | Stub | Coming soon |
| Reports / settings / audit | Planned | Phase 3 / 5 / 6 |
| Admin roles (ADMIN / STAFF) | Partial | Guards exist; fine-grained RBAC later |

## Platform / ops

| Feature | Status | Notes |
|---------|--------|-------|
| Monorepo | Done | pnpm + Turborepo |
| Docker Compose (Postgres, Redis, MinIO) | Done | Local infra |
| Seed data | Done | 12 books, admin + customer |
| Stripe payments | Planned | Phase 2 |
| Redis usage (cache / queues) | Planned | Wired env; usage later |
| CI / production hardening | Planned | Phase 6 |
