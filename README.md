# boks

Modern bookstore platform for selling **physical** and **digital** books.

| App | Stack | Path |
|-----|--------|------|
| Mobile | React Native (Expo) | `apps/mobile` |
| Admin | Next.js + TailAdmin (free) | `apps/admin` |
| API | NestJS + Prisma | `apps/api` |
| Shared | Types, Zod, API client, design tokens | `packages/*` |

## Architecture

```text
React Native App ─┐
                  ├── NestJS API ── PostgreSQL
Next.js Admin ────┘       │
                          ├── MinIO (S3)
                          ├── Redis
                          └── (Stripe / email / push in later phases)
```

## Prerequisites

- Node.js 20+
- pnpm 11+
- Docker Desktop

## Quick start

```bash
# 1. Clone & install
git clone https://github.com/aungzawmyo/boks.git
cd boks
cp .env.example .env
pnpm install

# 2. Infra
pnpm docker:up

# 3. Database
pnpm db:migrate
pnpm db:seed

# 4. Build shared packages
pnpm --filter @boks/configuration build
pnpm --filter @boks/design-tokens build
pnpm --filter @boks/validation build
pnpm --filter @boks/shared-types build
pnpm --filter @boks/api-client build

# 5. Run apps (separate terminals)
pnpm dev:api      # http://localhost:3001
pnpm dev:admin    # http://localhost:3000
pnpm dev:mobile   # Expo
```

### Demo accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@boks.local` | `Admin123!` |
| Customer | `alex@boks.local` | `Customer123!` |

MinIO console: http://localhost:9001 (`minioadmin` / `minioadmin`)

## Phase 1 (this release)

- Auth (register, login, refresh, password reset)
- Public catalog search / filter / sort
- Book details with physical + ebook formats
- Admin dashboard shell (bookstore KPIs + charts)
- Admin CRUD: books, authors, categories, publishers
- Cover upload endpoint (MinIO); ebook files remain private by design
- Mobile Home / Explore / Book details + auth
- Library & cart tabs as stubs for later phases

## Roadmap

2. Cart, checkout, Stripe, physical orders  
3. Inventory, shipping, returns, reporting  
4. Digital library, signed downloads, EPUB/PDF reader  
5. Reviews, promotions, notifications, analytics  
6. Offline reading, hardening, production deploy  

Single-store model only (no multi-vendor marketplace).

## Monorepo scripts

| Script | Description |
|--------|-------------|
| `pnpm docker:up` | Postgres, Redis, MinIO |
| `pnpm db:migrate` | Prisma migrate |
| `pnpm db:seed` | Seed catalog + users |
| `pnpm dev:api` | NestJS API |
| `pnpm dev:admin` | Next.js admin |
| `pnpm dev:mobile` | Expo |

## License

MIT (admin UI based on [TailAdmin free Next.js](https://github.com/TailAdmin/free-nextjs-admin-dashboard)).
