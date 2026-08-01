# Arcade product tours

Zivvy product-tour embeds are configured in [`lib/arcade-tours.ts`](../lib/arcade-tours.ts).

## Status (2026-07-26)

| Step | Status |
| --- | --- |
| `demo@zivvy.xyz` Business tenant `demo-arcade` | Seeded on production |
| Brand Kit | Arcade plan allows **1** kit — existing `actimi.com` kit enriched with zivvy.xyz sources (create Zivvy kit after deleting Actimi or upgrading) |
| Video generation | **Blocked** — Arcade insufficient credits (120s needed 200; 15s needed 50) |
| `/product-tour` UI + SEO | Wired — falls back to self-hosted mp4 until `arcadeEmbedUrl` / `arcadeViewUrl` are set |

## Regenerate when credits exist

Using Arcade MCP (or Arcade UI):

1. `list_brand_kits` — use a **ready** kit (preferably domain `zivvy.xyz`).
2. For each row in `arcade-tours.ts`, `create_video` with a concrete prompt + up to 3 `websiteUrls`.
3. Poll `get_generation_status` until `succeeded`.
4. Paste `viewUrl` (and publish embed URL) into `arcadeViewUrl` / `arcadeEmbedUrl`.
5. Redeploy zivvy-web.

### Suggested websiteUrls

| Tour | URLs |
| --- | --- |
| Full | `https://zivvy.xyz`, `/product-tour`, `/pricing` |
| CRM & Sales | `/`, `/use-cases/crm-automation`, `/product-tour` |
| Stock | `/`, `/solutions/distribution`, `/product-tour` |
| Accounting | `/`, `/industries/finance`, `/pricing` |
| HR & Projects | `/`, `/solutions/hr-teams`, `/product-tour` |
| Manufacturing | `/`, `/solutions/manufacturing`, `/product-tour` |
| Banking | `/`, `/addons`, `/integrations/plaid` |
| Integrations | `/integrations`, `/integrations/webhooks`, `/integrations/rest-api` |

## Demo login for screen capture

- Email: `demo@zivvy.xyz`
- Plan: Business (`zivvy_demo_plan`)
- Tenant: `demo-arcade` / company `Demo Arcade`
- Password: `DEMO_ARCADE_PASSWORD` or site_config `demo_password_arcade`
- Re-seed: `bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts`
