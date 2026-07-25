# Development

## Prerequisites

- **Node.js** 20+
- **pnpm** 11+ (`corepack enable` recommended)
- **Docker Desktop** (Postgres, Redis, MinIO)
- Optional: Android Studio / Xcode / Expo Go for mobile

## First-time setup

```bash
git clone https://github.com/aungzawmyo/boks.git
cd boks
cp .env.example .env

pnpm install
pnpm docker:up

# Build shared packages (required before apps that import them)
pnpm --filter @boks/configuration build
pnpm --filter @boks/design-tokens build
pnpm --filter @boks/validation build
pnpm --filter @boks/shared-types build
pnpm --filter @boks/api-client build

pnpm db:migrate
pnpm db:seed
```

Copy env into API if needed:

```bash
# Windows PowerShell
Copy-Item .env apps\api\.env -Force
```

Admin uses `apps/admin/.env.local` (`NEXT_PUBLIC_API_URL`).  
Mobile uses `apps/mobile/.env` (`EXPO_PUBLIC_API_URL`).

## Run apps

Prefer separate terminals:

```bash
pnpm dev:api      # http://localhost:3001
pnpm dev:admin    # http://localhost:3000
pnpm dev:mobile   # Expo Dev Tools
```

Or all via Turborepo (parallel):

```bash
pnpm dev
```

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@boks.local` | `Admin123!` |
| Customer | `alex@boks.local` | `Customer123!` |

Configurable via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Useful scripts

| Script | Description |
|--------|-------------|
| `pnpm docker:up` / `docker:down` | Start/stop infra |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Reseed demo data (destructive clear of catalog/users) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm build` | Build all packages/apps |

## Ports

| Service | Port |
|---------|------|
| Admin (Next.js) | 3000 |
| API (NestJS) | 3001 |
| Postgres | 5432 |
| Redis | 6379 |
| MinIO API | 9000 |
| MinIO Console | 9001 |

MinIO console login (local): `minioadmin` / `minioadmin`.

## pnpm 11 note

Build scripts for native deps must be allowed in `pnpm-workspace.yaml` under `allowBuilds` (prisma, esbuild, sharp, etc.). If install fails with `ERR_PNPM_IGNORED_BUILDS`, run:

```bash
pnpm approve-builds --all
pnpm install
```

## Mobile networking

- **Expo web on LAN** (e.g. `http://192.168.x.x:8081`): the client auto-uses the same hostname for the API (`http://192.168.x.x:3001`) when `EXPO_PUBLIC_API_URL` is `localhost`.
- Emulator/simulator: `localhost` usually works for API.
- Native device / Expo Go: set `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3001` in `apps/mobile/.env`, then restart Expo (`r` or stop/start). Auto-host detection only applies on web.
- Add the Expo origin to `CORS_ORIGINS` (e.g. `http://192.168.1.35:8081`).
- Ensure Windows Firewall allows inbound TCP **3001** (and that the API is listening — Nest binds `0.0.0.0`).

## Project conventions

- TypeScript everywhere.
- Prefer shared Zod schemas and `@boks/api-client` over duplicated fetch helpers.
- Do not commit `.env` (use `.env.example`).
- Single-store domain language: Book, Format, Inventory — not “Seller” or “Shop”.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `EADDRINUSE :3001` | Stop other Node process on 3001 |
| Prisma connection error | `pnpm docker:up`, check `DATABASE_URL` |
| Admin cannot load books | Sign in as admin; check `NEXT_PUBLIC_API_URL` |
| Workspace import errors | Rebuild packages under `packages/*` |
| Books API 500 on pagination | Ensure API was rebuilt after query number coercion fix |
