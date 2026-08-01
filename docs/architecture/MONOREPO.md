# Monorepo Operating Model

## Goal

The monorepo exists to make Zivvy coherent. Shared packages are not decoration;
they are the product contracts that keep the app, API, docs, and ERP kernel
aligned.

## Workspace Layout

```text
apps/
  web/          Next.js product app and marketing site
  api/          NestJS public API and integration gateway
  docs/         Developer docs content and checks
  erp-kernel/   Frappe/ERPNext overlay app

packages/
  ui/               Design-system utilities and tokens
  schemas/          Runtime/domain schemas
  events/           Event names and envelopes
  module-registry/  Product module specs
  api-client/       Typed API client
  config/           Shared configuration
```

## Migration Rules

1. Keep original repos deployable until the monorepo deployment path is proven.
2. New Zivvy contracts are authored in `packages/*`.
3. Existing app code migrates to shared packages gradually.
4. No module cleanup is mixed with unrelated monorepo plumbing.
5. Each module migration is one bounded effort:
   - spec
   - UX shell
   - API contract
   - kernel adapter
   - events
   - tests

## Turborepo Tasks

- `build` compiles apps/packages.
- `typecheck` validates TypeScript and Python syntax for the kernel wrapper.
- `lint` currently maps to type/static checks until dedicated lint configs land.
- `test` runs the best available package-level verification.
- `verify` is for docs and contract checks.

## Deployment Boundary

The monorepo should eventually deploy as:

- `apps/web` to Vercel.
- `apps/api` to Vercel or a long-running Node host if API workloads outgrow
  serverless limits.
- `apps/erp-kernel` to Railway/Frappe infrastructure.
- `apps/docs` either as static docs or embedded into `apps/api` docs output.

## What Not To Do

- Do not import Frappe-specific code into `apps/web`.
- Do not put product copy in the ERP kernel.
- Do not create ad hoc integration code without the integration lifecycle.
- Do not create new module pages without adding the module spec first.
