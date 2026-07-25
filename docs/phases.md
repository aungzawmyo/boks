# Implementation phases

boks is delivered in six phases. **Phases 1 and 2 are complete** in the current repository.

## Phase 1 — Foundation (done)

**Goal:** Browseable catalog + admin management + auth.

- Monorepo (pnpm / Turborepo)
- Docker: Postgres, Redis, MinIO
- NestJS API: auth, books, authors, categories, publishers, dashboard, cover upload
- Prisma schema + seed
- Next.js admin (TailAdmin): overview dashboard, catalog CRUD, sign-in
- Expo mobile: auth, Home, Explore, Book details; Library/Cart stubs
- Shared packages: types, validation, api-client, design-tokens, configuration

**Exit criteria:** Admin can manage books; customer can register/login and browse/search published titles.

---

## Phase 2 — Cart, checkout, payments (done)

**Goal:** Sell physical and ebook formats.

- Server-side cart + line items (format-aware; ebooks capped at qty 1)
- Shipping addresses CRUD with default handling
- Checkout with shipping methods (standard free over $25, express)
- Payment abstraction: Stripe PaymentIntents when `STRIPE_SECRET_KEY` is set, auto-succeeding mock provider for local dev
- Order lifecycle: PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED (+ CANCELLED / REFUNDED) with inventory decrement/restore
- Customer order history + order detail + cancel (mobile Cart tab, Checkout, Order screens)
- Admin orders list (status filter, search, pagination) and detail with fulfillment actions + tracking numbers
- Dashboard KPIs computed from real orders (revenue, orders, ebooks sold, 30-day growth)

**Deferred to later phases:** coupons (Phase 5), Stripe webhooks in production hardening (Phase 6).

**Exit criteria (met):** Paid test order for physical and ebook SKUs succeeds; admin can move it through fulfillment.

---

## Phase 3 — Inventory, shipping, returns, reporting

**Goal:** Operational fulfillment for physical goods.

- Multi-warehouse stock movements
- Shipping zones / fees
- Packing / shipped / delivered transitions
- Returns and refunds (partial/full)
- Low-stock notifications (email or admin alerts)
- Sales / inventory reports in admin

**Exit criteria:** Staff can fulfill and return a physical order end-to-end.

---

## Phase 4 — Digital library & reader

**Goal:** Secure digital delivery and reading.

- Upload EPUB/PDF to private bucket
- License records per purchase
- Ownership-gated short-lived download URLs
- Device / download limits
- In-app EPUB + PDF reader
- Bookmarks, highlights, notes, reading progress sync
- Refund → access revocation

**Exit criteria:** Purchased ebook opens in-app; unauthorized users cannot obtain file bytes.

---

## Phase 5 — Engagement & growth

**Goal:** Retention and merchandising.

- Reviews + moderation
- Wishlist, recently viewed
- Campaigns / featured books / homepage banners
- Push notifications
- Analytics dashboards
- Multilingual content + dark mode polish

**Exit criteria:** Customer can review a book; admin can feature titles and moderate reviews.

---

## Phase 6 — Offline, hardening, production

**Goal:** Production readiness.

- Offline reading for authorized downloads
- Conflict-safe progress sync
- Security testing (auth, IDOR on downloads, rate limits)
- CI/CD, staging, backups, observability
- Performance tuning (catalog search indexes, CDN)
- App store release checklist

**Exit criteria:** Production deploy with monitoring, backups, and passing security review.

---

## Phase dependency graph

```text
Phase 1 (catalog + auth)
    └── Phase 2 (cart + Stripe)
            └── Phase 3 (fulfillment)
            └── Phase 4 (digital delivery)  ← can start after Phase 2 ebook orders
                    └── Phase 6 (offline)
    └── Phase 5 (reviews / promos)  ← can overlap with 3–4
```

## Explicit non-goals until later

Multi-vendor marketplace, seller onboarding, commission payouts, and storefront white-labeling are **not** in the phase plan.
