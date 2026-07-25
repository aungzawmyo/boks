# Deployment

This document covers local Docker usage and a recommended production path. Phase 1 is optimized for local development; harden before public launch (Phase 6).

## Environments

| Environment | Purpose |
|-------------|---------|
| Local | Docker Compose + `pnpm dev:*` |
| Staging | Cloud DB + object storage + preview apps |
| Production | Managed Postgres, Redis, S3, HTTPS, secrets manager |

## Local infrastructure (Docker Compose)

File: [`docker-compose.yml`](../docker-compose.yml)

```bash
pnpm docker:up      # postgres, redis, minio
pnpm docker:down
```

Services:

| Container | Image | Ports |
|-----------|-------|-------|
| `boks-postgres` | postgres:16-alpine | 5432 |
| `boks-redis` | redis:7-alpine | 6379 |
| `boks-minio` | minio/minio | 9000, 9001 |

API auto-creates `boks-covers` (public read) and `boks-ebooks` (private) when MinIO is up.

## Building for production

```bash
# Shared packages first
pnpm --filter @boks/configuration --filter @boks/design-tokens --filter @boks/validation --filter @boks/shared-types --filter @boks/api-client build

# API
pnpm --filter @boks/api build
pnpm --filter @boks/api start   # node dist/main.js

# Admin
pnpm --filter @boks/admin build
pnpm --filter @boks/admin start

# Mobile
# Use EAS Build / store submission — see Expo docs
```

## Suggested production topology

```text
Internet
   │
   ├── CDN / WAF ──► Admin (Vercel / Node host)
   ├── CDN / WAF ──► API (Fly.io / Railway / ECS / K8s)
   └── Mobile apps ──► API
                │
                ├── Managed PostgreSQL
                ├── Managed Redis
                └── S3 (or MinIO on private network)
```

## Environment variables (production)

Set all keys from [`.env.example`](../.env.example). Critical changes:

| Variable | Production guidance |
|----------|---------------------|
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random secrets; rotate carefully |
| `DATABASE_URL` | Managed Postgres with TLS |
| `CORS_ORIGINS` | Exact admin + mobile web origins |
| `S3_*` | Real AWS S3 / R2 / GCS S3 API |
| `S3_BUCKET_EBOOKS` | Private ACL; no public policy |
| `SEED_*` | Do **not** run seed in production |

Never commit production `.env` files.

## Database migrations

```bash
# CI / release job against production DATABASE_URL
pnpm --filter @boks/api exec prisma migrate deploy
```

Prefer `migrate deploy` in prod (not `migrate dev`).

## Object storage checklist

- [ ] Covers bucket: public read **or** CloudFront with OAI
- [ ] Ebooks bucket: **private only**
- [ ] IAM user/role limited to required buckets/actions
- [ ] Lifecycle rules for incomplete multipart uploads
- [ ] Phase 4: signed URL TTL short (e.g. 60–300s)

## Admin hosting

- Deploy Next.js on Vercel, Netlify, or Node (`next start`).
- Set `NEXT_PUBLIC_API_URL` to the public API origin.
- Force HTTPS; enable secure cookies if moving tokens out of `localStorage` later.

## Mobile release

- Configure EAS (`eas.json`) with production `EXPO_PUBLIC_API_URL`.
- Use separate staging and production API backends.
- Submit via App Store / Play Console when reader + payments are ready.

## Observability (recommended Phase 6)

- Structured API logs + request IDs
- Error tracking (Sentry)
- Uptime checks on `/health`
- DB backups + restore drills
- Alert on low disk / 5xx rate / payment webhook failures

## Security before go-live

See [security.md](./security.md). Minimum:

- Strong JWT secrets
- Rate limiting on auth endpoints
- HTTPS everywhere
- Private ebook storage
- No demo seed passwords in production
- Dependency audit (`pnpm audit`)

## CI sketch

```yaml
# Conceptual
- pnpm install --frozen-lockfile
- pnpm --filter './packages/**' build
- pnpm --filter @boks/api build
- pnpm --filter @boks/admin build
- # optional: lint, unit tests, migrate on staging
```
