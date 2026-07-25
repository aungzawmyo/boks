# Database

PostgreSQL via **Prisma**. Schema: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).

## Enums

| Enum | Values |
|------|--------|
| `Role` | `CUSTOMER`, `ADMIN`, `STAFF` |
| `BookFormatType` | `PHYSICAL`, `EBOOK` |
| `BookStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |

## Entity relationship (Phase 1)

```text
User ──< RefreshToken
User ──< PasswordResetToken

Author >──< Book >──< Category
              │
              ├── Publisher (optional)
              ├── BookFormat (PHYSICAL / EBOOK)
              └── Inventory ──> Warehouse
```

## Models

### Auth

| Model | Purpose |
|-------|---------|
| `User` | Account identity, role, password hash |
| `RefreshToken` | Hashed refresh tokens + expiry |
| `PasswordResetToken` | One-time reset tokens |

### Catalog

| Model | Purpose |
|-------|---------|
| `Book` | Title, slug, description, language, cover key, status, rating aggregates |
| `Author` | Name, slug, bio |
| `Category` | Name, slug, description |
| `Publisher` | Name, slug |
| `BookAuthor` | M:N join |
| `BookCategory` | M:N join |
| `BookFormat` | Per-format price, ISBN/SKU, ebook `fileKey`, `previewPages` |

### Inventory

| Model | Purpose |
|-------|---------|
| `Warehouse` | Location stub (`MAIN` seeded) |
| `Inventory` | `onHand`, `lowStockThreshold` per book × warehouse |

## Notes

- Public catalog lists only `PUBLISHED` books.
- Admin list includes drafts/archived.
- Unique constraint: one format type per book (`bookId` + `format`).
- `coverKey` is relative to the covers bucket; `fileKey` is private ebook object key.
- Ratings (`averageRating`, `reviewCount`) are denormalized fields for Phase 1; review entities come later.

## Migrations & seed

```bash
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # prisma/seed.ts
pnpm db:studio    # Prisma Studio
```

Seed creates:

- Admin + sample customer
- One warehouse, one publisher
- Categories: Fiction, Fantasy, Self-Help, Business, Bestsellers
- ~12 published books with physical + ebook formats and stock levels

## Planned schema additions (later phases)

- `Order`, `OrderItem`, `Address`, `Shipment`, `Return`
- `Coupon`, `Campaign`
- `License`, `DownloadGrant`, `ReadingProgress`, `Bookmark`, `Highlight`
- `Review`, `Banner`, `AuditLog`, `Notification`
