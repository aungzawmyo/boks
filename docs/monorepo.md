# Monorepo

## Tooling

| Tool | Role |
|------|------|
| **pnpm** workspaces | Package linking (`apps/*`, `packages/*`) |
| **Turborepo** | Task orchestration (`dev`, `build`, `lint`) |
| **TypeScript** | Shared language; base config in `tsconfig.base.json` |

Config: [`pnpm-workspace.yaml`](../pnpm-workspace.yaml), [`turbo.json`](../turbo.json), [`package.json`](../package.json).

## Workspace map

```text
apps/api          @boks/api
apps/admin        @boks/admin
apps/mobile       @boks/mobile
packages/api-client       @boks/api-client
packages/shared-types     @boks/shared-types
packages/validation       @boks/validation
packages/configuration    @boks/configuration
packages/design-tokens    @boks/design-tokens
```

## Dependency direction

```text
mobile ──► api-client ──► shared-types
                     └──► validation
admin  ──► api-client ──► …

api ──► validation, shared-types, configuration
mobile ──► design-tokens
```

Apps must **not** import each other. Shared code belongs in `packages/`.

## Building packages

Packages emit `dist/` via `tsc`. After changing shared source:

```bash
pnpm --filter @boks/configuration build
pnpm --filter @boks/design-tokens build
pnpm --filter @boks/validation build
pnpm --filter @boks/shared-types build
pnpm --filter @boks/api-client build
```

Admin uses Next `transpilePackages` for workspace libs. Mobile Metro watches the repo root (`apps/mobile/metro.config.js`).

## Adding a new package

1. Create `packages/<name>/package.json` with `"name": "@boks/<name>"`.
2. Add `src/index.ts` + `tsconfig.json` extending `../../tsconfig.base.json`.
3. Run `pnpm install` from root.
4. Depend via `"@boks/<name>": "workspace:*"`.

## Adding an API module

1. Create Nest module under `apps/api/src/<feature>/`.
2. Register in `AppModule`.
3. Extend `@boks/api-client` and `@boks/shared-types` if clients need it.
4. Add Zod schemas to `@boks/validation` when inputs are shared.

## Naming conventions

| Area | Convention |
|------|------------|
| Packages | `@boks/<kebab-case>` |
| Nest modules | `<Feature>Module` |
| DB models | Prisma PascalCase singular |
| HTTP paths | kebab-ish REST (`/admin/books`) |
| Mobile routes | Expo Router file-based |

## Versioning

Root version `0.1.0` tracks Phase 1. Consider Changesets or app-level semver once multiple packages publish independently (currently all private workspaces).

## What not to put in the monorepo

- Production secrets
- Large binary datasets (use object storage)
- Generated `node_modules`, `.next`, `.expo`, `dist` (gitignored)
