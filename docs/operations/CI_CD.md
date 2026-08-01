# Zivvy CI/CD

This monorepo treats build health as the release gate. Deployment is optional and
secret-gated so forks and local branches can run CI without production access.

## Workflows

| Workflow | File | Purpose |
| --- | --- | --- |
| CI | `.github/workflows/ci.yml` | Installs, builds, then runs `pnpm check`. |
| Deploy | `.github/workflows/deploy.yml` | Deploys web/API to Vercel and ERP kernel to Railway when secrets are present. |
| Performance | `.github/workflows/performance.yml` | Runs Lighthouse budgets against production Next build. |
| Google Indexing | `.github/workflows/google-indexing.yml` | Submits changed sitemap URLs after web changes. |

## Required CI Order

Run build before check:

```bash
pnpm build
pnpm check
```

Do not run `pnpm build` and `pnpm check` in parallel. Next.js writes `.next/types`
during build/typegen; parallel tasks can race and create false missing-type errors.

## Required GitHub Secrets

### Vercel Web

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_WEB`

### Vercel API

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_API`

### Railway ERP Kernel

- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ERP_KERNEL`

### Google Indexing

- `GOOGLE_SA_CREDENTIALS`

## Required Runtime Env

Set these in the hosting provider, not in GitHub Actions:

- `NEXT_PUBLIC_FRAPPE_ORIGIN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true` if Vercel Analytics should load.
- `NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS=true` if Speed Insights should load.

## Deployment Model

Web:

- Source: `apps/web`
- Platform: Vercel
- Command: Vercel prebuilt deploy from workflow.

API:

- Source: `apps/api`
- Platform: Vercel
- Command: Vercel prebuilt deploy from workflow.

ERP kernel:

- Source: `apps/erp-kernel`
- Platform: Railway
- Command: `railway up --detach --service "$RAILWAY_SERVICE_ERP_KERNEL"`.

## Release Gate

A production merge must satisfy:

- `pnpm build`
- `pnpm check`
- No hardcoded secrets.
- No direct browser-to-Frappe code added for new module UX.
- Lighthouse budget reviewed for public pages.
