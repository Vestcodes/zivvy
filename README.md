# Zivvy Monorepo

This repository is the Zivvy product platform. It combines the customer web app,
public integration API, developer docs, and the ERPNext/Frappe kernel wrapper
behind one workspace so module UX, contracts, events, permissions, and
integrations evolve together.

## Apps

- `apps/web` - Next.js product app and marketing site.
- `apps/api` - NestJS public API and integration gateway.
- `apps/docs` - Developer documentation content and verification scripts.
- `apps/erp-kernel` - Frappe/ERPNext overlay app. This remains the ERP kernel,
  not the product UX.

## Packages

- `packages/ui` - Zivvy design-system primitives and tokens.
- `packages/schemas` - Shared runtime/domain schemas.
- `packages/events` - Event names, payload contracts, and helpers.
- `packages/module-registry` - Canonical module/app registry and UX specs.
- `packages/api-client` - Typed client for Zivvy public/internal APIs.
- `packages/config` - Shared TypeScript config package.

## Core Rule

Expose ERPNext breadth through Zivvy modules. Do not expose raw ERPNext DocType
screens as the product experience.

## Common Commands

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm web
pnpm api
pnpm docs:verify
```
