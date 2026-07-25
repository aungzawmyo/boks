# Security

## Threat model (summary)

| Asset | Risk | Mitigation (current / planned) |
|-------|------|--------------------------------|
| User credentials | Credential stuffing, leaks | bcrypt hashes; planned rate limits |
| JWT access tokens | Theft via XSS | Short TTL; prefer httpOnly cookies later |
| Refresh tokens | Replay | Hashed at rest; rotated on use |
| Admin APIs | Privilege escalation | Role guards (`ADMIN` / `STAFF`) |
| Ebook files | Hotlinking / piracy | Private bucket; signed URLs + ownership (Phase 4) |
| Cover images | Low sensitivity | Public read OK |
| Payments | Fraud / webhook spoofing | Stripe signatures (Phase 2) |

## Authentication

- Passwords hashed with **bcrypt** (cost 10).
- Access tokens: JWT signed with `JWT_ACCESS_SECRET`.
- Refresh tokens: high-entropy random strings; only **SHA-256 hashes** stored in `RefreshToken`.
- Password reset tokens similarly hashed; single-use via `usedAt`.
- `/auth/forgot-password` does not reveal whether an email exists.

## Authorization

| Route prefix | Access |
|--------------|--------|
| `/health`, `/auth/register|login|…`, `/books`, `/authors`, `/categories`, `/publishers` | Public (catalog published-only) |
| `/auth/me` | Any authenticated user |
| `/admin/*` | `ADMIN` or `STAFF` JWT |

Customers cannot call admin mutations even with a valid customer token.

## Digital files (policy)

1. Store originals only in **private** object storage (`boks-ebooks`).
2. Never put ebook objects behind a public ACL or public CDN path.
3. Before issuing a download URL, verify:
   - authenticated user
   - active license / paid order for that format
   - device / download limits (Phase 4)
4. Use **short-lived signed URLs** (minutes, not days).
5. On refund or ban, revoke license so new URLs cannot be minted.

Phase 1 stores optional `fileKey` metadata only; download issuance is Phase 4.

## Admin client storage

Phase 1 admin stores JWTs in `localStorage`. Acceptable for early development; for production prefer:

- httpOnly secure cookies, or
- memory + refresh rotation with strict CSP

## Secrets management

- Never commit `.env`.
- Rotate `JWT_*` and `S3_*` credentials if leaked.
- Use different secrets per environment.
- Disable or change seed admin password before any shared deploy.

## CORS

Configured via `CORS_ORIGINS` (comma-separated). Keep this tight in production.

## Recommended hardening backlog

- [ ] Rate limit `/auth/login` and `/auth/forgot-password`
- [ ] Account lockout / MFA for admins
- [ ] Helmet / security headers on API
- [ ] Input size limits on uploads (covers already ~5 MB)
- [ ] Audit log for admin mutations
- [ ] Dependency scanning in CI
- [ ] Penetration test before Phase 6 launch
- [ ] IDOR tests on future download endpoints

## Responsible disclosure

If you find a vulnerability in a deployed instance of this project, contact the repository owner privately rather than opening a public issue with exploit details.
