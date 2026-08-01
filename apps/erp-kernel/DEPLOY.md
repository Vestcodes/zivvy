# Deploy Zivvy on https://zivvy.xyz

Production runbook for **Zivvy by Vestcodes** (Frappe + ERPNext + `zivvy_brand` overlay).

## Railway (canonical host)

| | |
| --- | --- |
| **Organization** | **Vestcodes** only (`contact@vestcodes.co`) — never Actimi, never Ovok |
| **Project** | `zivvy` |
| **Project ID** | `caac48aa-d4a4-4d0a-966a-570713c417cb` |
| **Dashboard** | https://railway.com/project/caac48aa-d4a4-4d0a-966a-570713c417cb |

### Services (Vestcodes / `zivvy`)

| Service | Role |
| --- | --- |
| **web** | Frappe/Gunicorn (+ worker/schedule via supervisord in container) |
| **worker** / **scheduler** | Reserved for scale-out (same image later); v1 runs jobs inside `web` — keep at **0 replicas** |
| **Postgres** | Primary DB (`*.railway.internal`) for prototype cutovers (`DB_TYPE=postgres`) |
| **Redis** | Cache + queue (+ socketio URL) |

### Resource limits (replica caps)

Applied via Railway Replica Limits (cgroup ceilings). Actual usage is typically lower; caps prevent runaway bills.

| Service | Memory cap | vCPU cap | Notes |
| --- | --- | --- | --- |
| **web** | **1.5 GB** | **1.0** | Safe Frappe floor (~0.6–0.8 GB observed idle with supervisord) |
| **Postgres** | **768 MB** | **0.5** | Enough for single-site Frappe prototype; do not starve |
| **Redis** | **256 MB** | **0.25** | Idle ~15 MB |
| **worker** / **scheduler** | — | — | **0 replicas** (jobs run in `web` supervisord) |

Unused Railway **MySQL** (mysql:9.4) was **removed**.

### Cost Control

The standalone OTel/Jaeger service has been removed from Railway to reduce baseline spend.

| Control | Where | Setting |
| --- | --- | --- |
| **Monthly usage alerts + hard stop** | Railway dashboard → **Workspace (Vestcodes)** → **Usage** → **Set Usage Limits** | Set Compute **Custom email alert** at ~50% of your monthly budget and Compute **Hard limit** at 100%. Railway also auto-reminds at 75%, 90%, and 100% of hard limit. |
| **Optional 80% heads-up** | Same Usage page (manually adjust threshold) or external finance reminder | Railway Usage Limits currently support one custom alert threshold per usage type; use either 50% or 80% there, and cover the other threshold in your finance/ops reminders. |
| **Replica guardrails** | Service settings → Deploy → Replica Limits | Keep existing caps: `web` 1.5 GB / 1 vCPU, DB 768 MB / 0.5 vCPU, `Redis` 256 MB / 0.25 vCPU. |
| **Idle worker controls** | Project service list / scaling | Keep `worker` and `scheduler` at **0 replicas** until dedicated background traffic justifies scale-out. |

Quick setup flow (Vestcodes only):

1. Open [Railway Workspace Usage](https://railway.com/workspace/usage) and switch to **Vestcodes** in the account/workspace picker.
2. Click **Set Usage Limits**.
3. Under **Compute Usage**, enter your monthly budget plan as:
   - **Custom email alert:** 50% of monthly budget (soft alert)
   - **Hard limit:** 100% of monthly budget (cost stop)
4. Save changes. Railway sends additional automatic reminders at 75% and 90% before 100%.

### Future multi-region (not deployed yet)

Signup stores `User.zivvy_datacenter` = `india` | `eu` | `us` as a **data residency preference**. Production today is a **single** Railway region (Southeast Asia). Do **not** spin up three projects until routing/DNS is ready; preference is for compliance + future pin.

### Multi-tenant SaaS (Phase 1 — company-per-tenant)

Zivvy isolates customers on **one** site (`zivvy.xyz`) via **Zivvy Tenant → Company + User Permissions**. Plan / seats / Polar IDs live on the **Tenant**, not only the site-wide `Zivvy Subscription` Single.

Full details: [`TENANCY.md`](TENANCY.md).

| Phase | Model | Status |
| --- | --- | --- |
| **1** | Company-per-tenant on shared bench | **Implemented** |
| **2** | Site-per-tenant (separate Frappe site/DB) | Documented only |

```bash
# After syncing the app — migrate DocType + seed founder/demos into tenants
railway ssh -s web -- bash -lc \
  'cd /home/frappe/frappe-bench && bench --site zivvy.xyz migrate && \
   bench --site zivvy.xyz execute zivvy_brand.tenancy.migrate_existing.migrate_existing_tenants'
```

### Wildcard DNS (tenant subdomains)

Optional UX: `slug.zivvy.xyz` resolves tenant context (session user link still works without DNS).

| Type | Name | Value |
| --- | --- | --- |
| **CNAME** | `*` | Same Railway edge host as apex traffic (confirm with `railway domain status`) |

Also add `*.zivvy.xyz` as a Railway custom domain on service **web** (port 8000) so TLS is issued for subdomains.

```bash
# Example (confirm current Railway edge host first)
railway domain add '*.zivvy.xyz' --service web   # if CLI supports wildcard
vercel dns add zivvy.xyz '*' CNAME <railway-edge>.up.railway.app --scope vestcodes
```

Host parsing is implemented even when wildcard is not live yet (`zivvy_brand.tenancy.context.parse_subdomain_slug`).

CLI (from this repo):

```bash
railway whoami   # must be contact@vestcodes.co
railway link --project caac48aa-d4a4-4d0a-966a-570713c417cb
railway status   # Workspace: Vestcodes
```

### Deploy config in this repo

| Path | Purpose |
| --- | --- |
| [`deploy/Dockerfile`](deploy/Dockerfile) | `frappe/erpnext` + backend apps + `zivvy_brand` + supervisord |
| [`deploy/zivvy-apps.sh`](deploy/zivvy-apps.sh) | Backend-only clone/install list: banking, hrms, payments, ecommerce_integrations (+ zivvy_brand). No product SPAs. |
| [`deploy/entrypoint.sh`](deploy/entrypoint.sh) | Wire DB/Redis, bootstrap empty `sites` volume, auto-create site, ensure backend apps install + asset symlinks |
| [`deploy/railway-setup.sh`](deploy/railway-setup.sh) | `bench new-site` + install backend apps (as user `frappe`) |
| [`deploy/run-gunicorn.sh`](deploy/run-gunicorn.sh) | Gunicorn launcher — **must** export `SITES_PATH=sites` (Frappe defaults to `.`) |
| [`deploy/nginx.conf.template`](deploy/nginx.conf.template) | Public `$PORT` → `/assets` + `/files` from disk, else gunicorn; websocket upgrade; sets `X-Frappe-Site-Name` |
| [`deploy/docker-compose.yml`](deploy/docker-compose.yml) | Local parity |
| [`railway.toml`](railway.toml) | Dockerfile builder + healthcheck `/api/method/ping` |

### Deploy policy

**Do not push Railway/production until `zivvy-web` UX is validated locally against this Frappe backend.**
This image is API/auth/billing only; customer UI is Next.js.

### Bootstrap status (production)

| Check | Status |
| --- | --- |
| Site `zivvy.xyz` on volume | **Present** (`sites/zivvy.xyz`, apps: frappe + erpnext + zivvy_brand + banking) |
| Auto-create on boot | `AUTO_CREATE_SITE=1` — skips create when `site_config.json` exists; still migrate + ensure home |
| `SITES_PATH` | **`sites`** (Railway var + `/run-gunicorn.sh`) — without this, Gunicorn raises `zivvy.xyz does not exist` |
| Host aliases | nginx `X-Frappe-Site-Name: zivvy.xyz` + `sites/currentsite.txt` + `default_site` — apex and `*.up.railway.app` both serve the site |
| Website home | `home` (Zivvy marketing) via `zivvy_brand` install/migrate |
| Static CSS/JS | nginx serves `/assets` + `/files` from `sites/`; entrypoint links app `public/` + runs `bench build` when `assets.json` lacks `zivvy.bundle`; bench-root `assets` → `sites/assets` (Frappe reads cwd-relative `assets/assets.json`) |
| DNS → Railway | Vercel ALIAS/CNAME (see below); cert valid on apex |

**Root cause of `"zivvy.xyz does not exist"`:** `frappe.app` reads `SITES_PATH` at import (default `"."`), so it looked for `./zivvy.xyz` instead of `./sites/zivvy.xyz`. Entrypoint also keeps a symlink `frappe-bench/zivvy.xyz → sites/zivvy.xyz` and creates `/home/frappe/logs`.

**First boot (automatic):** if `sites/<SITE_NAME>/site_config.json` is missing and credentials are set, the entrypoint creates the site, installs apps, then starts Gunicorn on `0.0.0.0:$PORT`. While site create runs, a temporary HTTP stub answers **only** `/api/method/ping` with `pong` (so Railway healthchecks pass). **`/` is never rewritten to ping** — during setup it returns a short HTML “setting up” page (503); after Gunicorn starts it serves the Zivvy website home.

Set `DB_TYPE=postgres` for all prototype deployments.

`FORCE_RECREATE_SITE=1` wipes and recreates the site on boot — leave **`0`** except for a deliberate one-shot rebuild.

```bash
# Required before first healthy deploy (set once; keep ADMIN_PASSWORD for Desk login)
railway variable set --service web ADMIN_PASSWORD='…strong…' AUTO_CREATE_SITE=1
railway up --service web -d

# Optional: after site exists, you can set AUTO_CREATE_SITE=0 (re-create stays off if site_config exists)
# Manual re-bootstrap: railway ssh -s web -- /railway-setup.sh
```

### Railway env vars (`web`)

Set via CLI / dashboard (secrets never committed). Names:

- `ADMIN_PASSWORD` (**required on first boot** — Frappe Administrator password; also used by `railway-setup.sh`)
- `AUTO_CREATE_SITE` — default `1` in entrypoint when unset; set `0` to skip auto `new-site`
- `SITES_PATH` — **`sites`** (required for Gunicorn; also set in `/run-gunicorn.sh`)
- `PORT` — listen port (Railway / Gunicorn bind `0.0.0.0:$PORT`; typically `8000`)
- `POLAR_ACCESS_TOKEN` (secret)
- `POLAR_WEBHOOK_SECRET` (from Polar dashboard webhook)
- `POLAR_PRO_PRODUCT_ID` / `POLAR_BUSINESS_PRODUCT_ID`
- `POLAR_SUCCESS_URL` = `https://zivvy.xyz/app/billing`
- `POLAR_CANCEL_URL` = `https://zivvy.xyz/pricing`
- `POLAR_USE_SANDBOX` = `0`
- `POLAR_ORGANIZATION_ID` / `POLAR_ORGANIZATION_SLUG`
- `SITE_URL` / `FRAPPE_SITE_NAME` / `SITE_NAME`
- `DB_TYPE` = `postgres`
- **Postgres path:** `DB_HOST` / `DB_PORT` / `POSTGRES_USER` / `POSTGRES_PASSWORD` (or `DB_PASSWORD`)
- `REDIS_CACHE` / `REDIS_QUEUE` / `REDIS_SOCKETIO` (linked from **Redis**)
- `POSTHOG_*` placeholders as needed
- `RESEND_API_KEY` — Resend API key (SMTP password); required for signup/welcome/reset mail
- `RESEND_FROM_EMAIL` — default `Zivvy <noreply@zivvy.xyz>` (domain must be verified in Resend)
- `DEMO_FREE_PASSWORD` / `DEMO_PRO_PASSWORD` / `DEMO_BUSINESS_PASSWORD` / `DEMO_ARCADE_PASSWORD` — passwords for smoke-test demo users (never commit)
- `GUNICORN_WORKERS` / `GUNICORN_THREADS` / `GUNICORN_TIMEOUT` (optional)

## Demo accounts (smoke / plan gating)

Three System Users for plan gating smoke, plus a Business Arcade recording user — each on an **isolated Zivvy Tenant + Company**:

| Plan | Email | Tenant slug | Password source |
| --- | --- | --- | --- |
| Free | `demo.free@zivvy.xyz` | `demo-free` | `DEMO_FREE_PASSWORD` (or site_config `demo_password_free`) |
| Pro | `demo.pro@zivvy.xyz` | `demo-pro` | `DEMO_PRO_PASSWORD` (or site_config `demo_password_pro`) |
| Business | `demo.business@zivvy.xyz` | `demo-business` | `DEMO_BUSINESS_PASSWORD` (or site_config `demo_password_business`) |
| Business (Arcade / product tour) | `demo@zivvy.xyz` | `demo-arcade` | `DEMO_ARCADE_PASSWORD` (or site_config `demo_password_arcade`) |

Founder `sarwagyasingh69@gmail.com` → tenant **Sarwagya** (ops System Manager can still see all).

```bash
# Prefer setting passwords in Railway first
railway variable set --service web \
  DEMO_FREE_PASSWORD='…' DEMO_PRO_PASSWORD='…' DEMO_BUSINESS_PASSWORD='…' DEMO_ARCADE_PASSWORD='…'

# Then seed (idempotent) — creates users + tenants/companies
railway ssh -s web -- bash -lc \
  'cd /home/frappe/frappe-bench && bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts'

# Or from a local bench with the app linked:
# ./scripts/seed_demo_accounts.sh zivvy.xyz
```

Seat caps are **per tenant**. Passwords are never committed; if env vars are unset, seed generates them into `site_config.json` keys `demo_password_*` (readable only on the server).

API docs: https://zivvy.xyz/developers · OpenAPI: https://zivvy.xyz/assets/zivvy_brand/openapi.json · Tenancy: [`TENANCY.md`](TENANCY.md)

Smoke (from repo, after passwords are in your shell env — not printed to the report):

```bash
cd scripts && npm i && npx playwright install chromium
DEMO_FREE_PASSWORD=… DEMO_PRO_PASSWORD=… DEMO_BUSINESS_PASSWORD=… npm run smoke
# writes ../SMOKE_REPORT.md
```

## Resend transactional email

Signup / welcome / password-reset mail goes through Frappe **Email Account** → Resend SMTP.

| | |
| --- | --- |
| SMTP host | `smtp.resend.com` |
| Port | `465` (SSL) — or `587` STARTTLS |
| Username | `resend` |
| Password | Resend API key (`RESEND_API_KEY`) |
| From | `RESEND_FROM_EMAIL` (prefer `Zivvy <noreply@zivvy.xyz>`) |

### Setup checklist

1. Create an account at [resend.com](https://resend.com) and generate an API key.
2. **Domains → Add `zivvy.xyz`** and publish the DNS records below (Vercel team **vestcodes**). Free/single-domain Resend plans only allow one domain — `zivvy.xyz` is the production sending domain (`noreply@zivvy.xyz`).
3. Wait until Resend marks the domain **Verified** (often a few minutes after DNS propagates; re-check in the Resend dashboard or `POST /domains/{id}/verify`).
4. Set Railway vars (never commit the key):

```bash
railway variable set --service web RESEND_API_KEY='re_…' \
  RESEND_FROM_EMAIL='Zivvy <noreply@zivvy.xyz>'
```

5. On install/migrate, `zivvy_brand` creates/updates Email Account **Zivvy** as default outgoing. Or run:

```bash
bench --site zivvy.xyz execute zivvy_brand.email.resend.ensure_resend_email_account
bench --site zivvy.xyz execute zivvy_brand.email.resend.send_resend_test_email --kwargs "{'to': 'contact@vestcodes.com'}"
```

Until Resend shows **Verified**, outbound mail from `@zivvy.xyz` may be deferred or fail. Do **not** remove Railway ALIAS/CNAME/`_railway-verify` TXT records when adding Resend rows.

### Resend DNS (`zivvy.xyz`, region `us-east-1`)

Public DNS only — safe to document. Names are relative to `zivvy.xyz` (FQDN: `resend._domainkey.zivvy.xyz`, `send.zivvy.xyz`).

| Purpose | Type | Name | Priority | Value |
| --- | --- | --- | --- | --- |
| DKIM | **TXT** | `resend._domainkey` | — | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx61K0uX6w7GnGVUm5UKvS+eflqZR4kz9PGIGC8bUIfWHuUb350/w8axOXxb5I2WwmxM8K7NQzt3hzZeHxt4PCWa4rhKL4naZQXs75rYDA7nApqnuTRbwIS87hE1LogHUfsfc1mXQCR1rAqs9QtqTLW5DP1MkZSO+GHQfoZgRq4wIDAQAB` |
| Return-path / SPF | **MX** | `send` | **10** | `feedback-smtp.us-east-1.amazonses.com` |
| SPF | **TXT** | `send` | — | `v=spf1 include:amazonses.com ~all` |

Vercel CLI (team **vestcodes**):

```bash
vercel dns add zivvy.xyz resend._domainkey TXT 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx61K0uX6w7GnGVUm5UKvS+eflqZR4kz9PGIGC8bUIfWHuUb350/w8axOXxb5I2WwmxM8K7NQzt3hzZeHxt4PCWa4rhKL4naZQXs75rYDA7nApqnuTRbwIS87hE1LogHUfsfc1mXQCR1rAqs9QtqTLW5DP1MkZSO+GHQfoZgRq4wIDAQAB' --scope vestcodes
# MX: value then priority
vercel dns add zivvy.xyz send MX feedback-smtp.us-east-1.amazonses.com 10 --scope vestcodes
vercel dns add zivvy.xyz send TXT 'v=spf1 include:amazonses.com ~all' --scope vestcodes
vercel dns ls zivvy.xyz --scope vestcodes
```

Resend domain id (for verify API): `557a1216-2434-4504-a577-0e71f17b607b`.

### Website signup (tenant provision)

`zivvy_brand` overrides Frappe `sign_up` so new users are always **enabled** and each signup provisions:

1. **Zivvy Tenant** (slug from company/email)
2. Dedicated **Company**
3. Desk **System User** + Free roles + Company User Permission

You will not see “Please ask your administrator to verify your sign-up”. Users get a welcome email when Resend works, or can use **Forgot Password**. Redirect → `/app`.

**Datacenter (required on `/login#signup`):** India / EU / US → stored as `User.zivvy_datacenter` (`india`|`eu`|`us`). **Company** field optional. Copy explains residency **preference**; traffic may still be single-region today. Shown on Desk → Billing.

### Custom domain DNS (zivvy.xyz → Railway)

**Hosting stays on Railway** — Vercel is DNS-only (nameservers `ns1/ns2.vercel-dns.com`). Do **not** deploy the app to Vercel.

| | |
| --- | --- |
| **Railway org / project** | Vestcodes / `zivvy` (`caac48aa-d4a4-4d0a-966a-570713c417cb`) |
| **Service** | `web` |
| **Railway service domain** | `https://web-production-c1f48.up.railway.app` (regenerates if recreated — confirm with `railway domain list --service web`) |
| **Custom domains** | `zivvy.xyz`, `www.zivvy.xyz` (port **8000**) |
| **DNS provider** | Vercel team **vestcodes** (`vercel dns ls zivvy.xyz`) |

Railway shows a **CNAME** for traffic and a **TXT** for ownership. On Vercel, apex cannot be a literal CNAME (blocked / invalid with SOA/NS) — use **ALIAS** (Vercel’s root flattening). Subdomains use normal **CNAME**.

#### Exact Vercel DNS table (current)

Confirm targets anytime with:

```bash
railway domain status zivvy.xyz --service web
railway domain status www.zivvy.xyz --service web
```

| Type | Name | Value |
| --- | --- | --- |
| **ALIAS** | `@` (apex / blank) | `lzi55xcm.up.railway.app` |
| **CNAME** | `www` | `n5aqz8ce.up.railway.app` |
| **TXT** | `_railway-verify` | `railway-verify=f2335a91df9bd9d787423607013c14b6464c5b1601d4163ff298990db0ab9ec1` |
| **TXT** | `_railway-verify.www` | `railway-verify=43a3ce81431d20a67ff8eeb36e2b9e6fc8e473ad4de80668772b54cd721c1b35` |
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx61K0uX6w7GnGVUm5UKvS+eflqZR4kz9PGIGC8bUIfWHuUb350/w8axOXxb5I2WwmxM8K7NQzt3hzZeHxt4PCWa4rhKL4naZQXs75rYDA7nApqnuTRbwIS87hE1LogHUfsfc1mXQCR1rAqs9QtqTLW5DP1MkZSO+GHQfoZgRq4wIDAQAB` (Resend DKIM) |
| **MX** | `send` | `10 feedback-smtp.us-east-1.amazonses.com` (Resend return-path) |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` (Resend SPF) |

Exact Vercel CLI commands used / to re-apply (team **vestcodes**, DNS-only):

```bash
# Identity + domain inventory
vercel whoami
vercel domains ls --scope vestcodes
vercel dns ls zivvy.xyz --scope vestcodes

# Confirm Railway edge hosts + verify tokens first
cd /path/to/zivvy_brand   # linked to Vestcodes/zivvy service web
railway domain status zivvy.xyz --service web
railway domain status www.zivvy.xyz --service web

# Traffic + ownership (apex MUST be ALIAS, not CNAME — Vercel root flattening)
vercel dns add zivvy.xyz '@' ALIAS lzi55xcm.up.railway.app --scope vestcodes
vercel dns add zivvy.xyz www CNAME n5aqz8ce.up.railway.app --scope vestcodes
vercel dns add zivvy.xyz _railway-verify TXT 'railway-verify=f2335a91df9bd9d787423607013c14b6464c5b1601d4163ff298990db0ab9ec1' --scope vestcodes
vercel dns add zivvy.xyz _railway-verify.www TXT 'railway-verify=43a3ce81431d20a67ff8eeb36e2b9e6fc8e473ad4de80668772b54cd721c1b35' --scope vestcodes

# If a prior A/CNAME pointed apex/www at Vercel hosting, remove by record id:
# vercel dns ls zivvy.xyz --scope vestcodes
# vercel dns rm <rec_…> --scope vestcodes

# Confirm
vercel dns ls zivvy.xyz --scope vestcodes
dig @ns1.vercel-dns.com zivvy.xyz A +short          # expect Railway edge A (ALIAS flatten)
dig @ns1.vercel-dns.com www.zivvy.xyz CNAME +short  # n5aqz8ce.up.railway.app.
```

Verified 2026-07-23: records already present (`rec_a4b5aec…` ALIAS apex → `lzi55xcm…`, `rec_7d39546…` www CNAME → `n5aqz8ce…`, both `_railway-verify` TXT). Authoritative + public dig (`@ns1.vercel-dns.com`, `@8.8.8.8`, `@1.1.1.1`) return apex `A 69.46.46.107` (= `lzi55xcm.up.railway.app`). No conflicting custom A/CNAME to Vercel hosting; system default ALIAS → `cname.vercel-dns-016.com` remains (no id; not removable) but custom Railway ALIAS wins on authoritative answers.

**Notes**

- Vercel may still show a default apex **ALIAS** → `cname.vercel-dns-016.com`. The custom Railway ALIAS must win for apex A answers (check `dig @ns1.vercel-dns.com zivvy.xyz A`).
- Railway CLI may keep `DNS_RECORD_STATUS_REQUIRES_UPDATE` on apex because ALIAS flattens to **A** (no literal CNAME). Trust green cert / `dig` + HTTPS, not only that status string.
- Railway edge hostnames (`*.up.railway.app`) **change whenever the custom domain is deleted/re-added**. Always re-read `railway domain status` and update Vercel ALIAS/CNAME — TXT verify tokens usually stay stable for the same FQDN.
- Prefer apex as canonical; 301 **www → https://zivvy.xyz** once both resolve and www cert is issued.

#### Verify

```bash
# Authoritative DNS (bypass local cache)
dig @ns1.vercel-dns.com zivvy.xyz A +short
dig @ns1.vercel-dns.com www.zivvy.xyz CNAME +short
dig @ns1.vercel-dns.com _railway-verify.zivvy.xyz TXT +short
dig @ns1.vercel-dns.com _railway-verify.www.zivvy.xyz TXT +short

railway domain status zivvy.xyz --service web
railway domain status www.zivvy.xyz --service web

# HTTPS (use --resolve if local dig still shows old Vercel IPs)
APEX=$(dig @ns1.vercel-dns.com +short zivvy.xyz A | head -1)
curl -sS -o /dev/null -w '%{http_code} %{remote_ip}\n' --resolve "zivvy.xyz:443:$APEX" https://zivvy.xyz/
curl -sS --resolve "zivvy.xyz:443:$APEX" https://zivvy.xyz/api/method/ping
```

## Domain

| Host | Role |
| --- | --- |
| **zivvy.xyz** | Primary apex (canonical) |
| **www.zivvy.xyz** | Prefer **301 → https://zivvy.xyz** (or serve the same site cleanly) |

DNS: Vercel ALIAS/CNAME → Railway (table above). Hosting is **not** on Vercel.

Contact: **contact@vestcodes.com** · Entity: **Vestcodes Co, India**

## App install order

On the bench:

```bash
# 1. Platform
bench get-app frappe   # if not already present

# 2. Host ERP package (Python package name stays erpnext)
bench get-app /path/to/erpnext
# or: bench get-app erpnext

# 3. Brand overlay (install AFTER erpnext so website/login/hooks win)
bench get-app /path/to/zivvy_brand

# 4. ALYF Banking (EBICS integration, version-15 branch)
bench get-app --branch version-15 https://github.com/alyf-de/banking.git

# 5. Backend-only apps (see deploy/zivvy-apps.sh)
# Frontend UX is Next.js in ../zivvy-web — do NOT install crm/helpdesk/insights/wiki/webshop SPAs here.
bench get-app --branch version-15 https://github.com/frappe/hrms.git
bench get-app --branch version-15 https://github.com/frappe/payments.git
bench get-app --branch version-15 https://github.com/frappe/ecommerce_integrations.git

bench new-site zivvy.xyz   # if creating fresh
# OR use existing site name matching the domain

bench --site zivvy.xyz install-app erpnext
bench --site zivvy.xyz install-app zivvy_brand
bench --site zivvy.xyz install-app banking
bench --site zivvy.xyz install-app hrms
bench --site zivvy.xyz install-app payments
bench --site zivvy.xyz install-app ecommerce_integrations
```

`sites/apps.txt` (or bench apps) order:

```
frappe
erpnext
zivvy_brand
banking
hrms
payments
ecommerce_integrations
```

`banking` is bundled in the production image and installed on `zivvy.xyz` during bootstrap/migrate.

Supported bank protocol coverage from ALYF Banking: **Germany, Austria, France, Switzerland** via EBICS.

Manual customer setup still required (not automatic):

1. Create an ALYF Banking subscription at [banking.alyf.de](https://banking.alyf.de).
2. In ERPNext Desk, open the Banking module and create the bank connection using bank-issued EBICS details (**Host ID**, **Partner ID**, **User ID**).
3. Complete your bank's EBICS activation/key exchange process (INI/HIA/letter flow depends on the bank) before syncing statements.

## Nginx / SSL / site

```bash
bench setup nginx
# Point server_name to zivvy.xyz (and optionally www with redirect)

bench --site zivvy.xyz set-config host_name https://zivvy.xyz
# Enable Let's Encrypt / certbot (or your SSL terminator) for zivvy.xyz (+ www)

sudo bench setup lets-encrypt zivvy.xyz   # if using bench LE helper
```

Cookie / session domain: use apex **`.zivvy.xyz`** when sharing auth across www↔apex (usually unnecessary if www redirects).

## Migrate, build, cache

```bash
bench --site zivvy.xyz migrate
bench build --app zivvy_brand
bench build --app banking
bench build --app erpnext   # if assets changed
bench --site zivvy.xyz clear-cache
bench restart
```

On install/migrate, `zivvy_brand` seeds:

- System / Website **app name** → Zivvy  
- Website **home_page** → `home`  
- Website **disable_signup** → `0` (public SaaS signup stays enabled)  
- Resend Email Account (when `RESEND_API_KEY` set) → default outgoing SMTP  
- Logos / favicon → Zivvy assets  
- Navbar help → Billing, Pricing, Blog, About → https://zivvy.xyz, Vestcodes  
- Polar Settings URL defaults → success `https://zivvy.xyz/app/billing`, cancel `https://zivvy.xyz/pricing`

## Polar billing

Full checklist: [`scripts/setup_polar.md`](scripts/setup_polar.md)

### Subscription go-live checklist

Use this before taking real money on https://zivvy.xyz:

| Step | Done when |
| --- | --- |
| Org | Polar org **Vestcodes** (`vestcodes`), seat-based pricing enabled |
| Products | Public seat products **Zivvy Pro** ($18/mo), **Zivvy Business** ($30/mo), plus Annual SKUs (20% off) exist |
| Env product IDs | `POLAR_PRO_PRODUCT_ID` / `POLAR_BUSINESS_PRODUCT_ID` match those product IDs |
| Access token | `POLAR_ACCESS_TOKEN` set (live, not sandbox); scopes include `checkouts:write`, `customer_sessions:write`, `subscriptions:read`, `products:read` |
| Webhook endpoint | Polar → Webhooks → **Zivvy production** → `https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook` |
| Webhook events | At least `subscription.created|updated|active|canceled|uncanceled|revoked|past_due`, `order.paid`, `checkout.updated` |
| Webhook secret | Real signing secret in `POLAR_WEBHOOK_SECRET` (or Desk → Polar Settings). **Never** leave `PLACEHOLDER*` |
| Sandbox off | `POLAR_USE_SANDBOX=0` |
| Success / cancel | `POLAR_SUCCESS_URL=https://zivvy.xyz/app/billing`, `POLAR_CANCEL_URL=https://zivvy.xyz/pricing` |
| Desk smoke | Tenant Desk user opens `/app/billing` → Upgrade → Polar checkout with seats + `zivvy_tenant` metadata |
| Webhook smoke | After test checkout, **Zivvy Tenant** plan/seats/Polar IDs update (not only site `Zivvy Subscription` Single) |
| Portal | **Manage billing** opens Polar customer portal |

Optional API product bootstrap (idempotent):

```bash
bench --site zivvy.xyz execute zivvy_brand.billing.setup_polar.setup_polar_products
```

Summary (ops):

1. Create org + seat products on [polar.sh](https://polar.sh) (Pro $18, Business $30, annual −20%) — or use the bootstrap above.
2. Access token + webhook →  
   `https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook`
3. Paste secrets/IDs into env (preferred) or Desk → **Polar Settings**.
4. Live: `POLAR_USE_SANDBOX=0`.
5. Confirm go-live table above; ignore placeholder webhook secrets.

Webhook events: `subscription.created|updated|active|canceled|uncanceled|revoked|past_due`, `order.paid`, `checkout.updated`.

### Polar dashboard steps still required (human)

These cannot be fully automated from the app alone:

1. **Confirm payout / business details** on Polar (org status active, payout account linked) so live charges settle.
2. **Tax / presentment** — Vestcodes default presentment may be INR; Zivvy products include USD seat prices — confirm checkout currency looks correct for your market.
3. **After rotating a webhook secret** in Polar, update `POLAR_WEBHOOK_SECRET` (Railway) **and** restart `web` (or set Desk Polar Settings) so workers pick it up. `--skip-deploys` alone does not refresh a running container.
4. **One real sandbox or $1 live test checkout** as a non-demo tenant; verify tenant plan flips Free → Pro/Business.
5. Keep mini-EMS webhook endpoints separate; do not point Zivvy traffic at those URLs.

## Cursor Polar MCP

Official Polar MCP is a **remote** server (no local npm package for Polar itself). Docs: [Polar over MCP](https://polar.sh/docs/integrate/mcp).

Configured in:

| Scope | Path |
| --- | --- |
| User (all projects) | `~/.cursor/mcp.json` |
| This app | `zivvy_brand/.cursor/mcp.json` |
| ERPNext workspace | `erpnext/.cursor/mcp.json` (merged alongside Ontoly) |

Snippet (production):

```json
"Polar": {
  "url": "https://mcp.polar.sh/mcp/polar-mcp"
}
```

Sandbox (optional): `"url": "https://mcp.polar.sh/mcp/polar-sandbox"`.

### Enable / reload in Cursor

1. **Cursor Settings → Tools & MCP** — confirm **Polar** is listed and enabled.
2. Click **Connect** / authenticate when prompted (browser OAuth into your Polar org). Cursor stores credentials; do **not** put `POLAR_ACCESS_TOKEN` in `mcp.json`.
3. If the server does not appear, reload the window (`Developer: Reload Window`) or restart Cursor.

Fallback for clients that only support stdio: `npx mcp-remote https://mcp.polar.sh/mcp/polar-mcp` (see Polar docs).

### Tokens vs MCP

| Credential | Used for |
| --- | --- |
| Cursor ↔ Polar MCP OAuth | Agent tools against Polar (products, checkouts, etc. via MCP) |
| `POLAR_ACCESS_TOKEN` (org access token) | **Server-side** Zivvy billing API / webhooks — set in process env or Desk **Polar Settings**, never in MCP JSON |

App token scopes (from [`scripts/setup_polar.md`](scripts/setup_polar.md)): `checkouts:write`, `customer_sessions:write`, `subscriptions:read`, `products:read`, and optionally `products:write` for `setup_polar_products`.

`POLAR_ACCESS_TOKEN` is unrelated to enabling Polar MCP in Cursor.

## PostHog (optional)

```bash
export POSTHOG_ENABLE=1
export POSTHOG_PROJECT_API_KEY="phc_…"
export POSTHOG_HOST="https://us.i.posthog.com"   # or eu.i.posthog.com
export POSTHOG_ENABLE_DESK=0
```

Or Desk → **Zivvy Settings**. Snippet loads only after cookie consent = “Accept all”.

## Env template

See [`.env.example`](.env.example) — production URLs already point at **https://zivvy.xyz**.

Load via your process manager / bench site config; **never commit real secrets**.

## Website home

Confirm Desk → **Website Settings**:

- Home Page = `home`
- App Name = Zivvy
- Favicon / splash = Zivvy assets
- **Disable Signup** = unchecked (SaaS public signup; seeded `0` on install/migrate)

## Verify checklist

After deploy, hit (logged out / in as needed):

| URL | Expect |
| --- | --- |
| https://zivvy.xyz/home | Marketing landing |
| https://zivvy.xyz/ | Redirects or shows home |
| https://zivvy.xyz/pricing | Plans |
| https://zivvy.xyz/terms | Legal |
| https://zivvy.xyz/privacy | Legal |
| https://zivvy.xyz/cookies | Cookie policy |
| https://zivvy.xyz/blog | Blog index |
| https://zivvy.xyz/developers | Customer API docs |
| https://zivvy.xyz/docs | Billing & tenancy docs hub |
| https://zivvy.xyz/login | Zivvy-branded login |
| https://zivvy.xyz/login#signup | Email/password signup form (not “Signup Disabled”) |
| https://zivvy.xyz/app | Lands on `zivvy-home` workspace shell |
| https://zivvy.xyz/app/zivvy-home | Zivvy Overview workspace |
| https://zivvy.xyz/app/zivvy-sales | Zivvy Sales/CRM workspace |
| https://zivvy.xyz/app/zivvy-team | Zivvy Team workspace |
| https://zivvy.xyz/app/billing | Desk billing (System Manager / demo) |
| https://www.zivvy.xyz/… | Redirects to apex (preferred) |

Polar: checkout success → `/app/billing`; cancel → `/pricing`; webhook accepts signed events.

## Polar 100% promo codes (ops)

Created via Polar Discounts API (`type=percentage`, `basis_points=10000`, `duration=forever`). Codes are safe to share with recipients; do **not** commit or print `POLAR_ACCESS_TOKEN`.

| Plan | Code | Product |
| --- | --- | --- |
| **Zivvy Pro** | `ZIVVY100PRO` | Pro seat product |
| **Zivvy Business** | `ZIVVY100BIZ` | Business seat product |

### How to redeem

1. Sign up at https://zivvy.xyz/login#signup and open Desk → **Billing**.
2. Start checkout for **Pro** or **Business** (seat qty as needed).
3. On the Polar checkout page, enter the matching promo code in the **discount / promo code** field and apply.
4. Total should be **$0**; complete checkout. Webhook updates the **Zivvy Tenant** plan/seats.

Checkout sessions created by `zivvy_brand.billing` set `allow_discount_codes=true` so the promo field is shown.

## ActimiXYZ partner coupon (Business)

Polar **does not allow the same promo code on two discount rules**. ActimiXYZ is therefore split:

| Period | Effect | Polar discount ID | Code on Polar |
| --- | --- | --- | --- |
| **Business monthly** | Fixed **$5 USD** / **₹429.83** forever → **$30 → $25**/seat/mo | `e9f5f06b-1f3b-4f17-9dcd-c8c240c35fb0` | `ActimiXYZ` |
| **Business annual** | **10%** forever → **$288 → $259.20**/seat/yr | `3d7b40da-3188-46a0-b2ee-8bef51e576de` | _(none — mapped in app)_ |

Replaced old 50% / $15 forever discount `f579ae70-5de5-4303-83e3-438e481637b6` (deleted).

### How to redeem ActimiXYZ

1. Desk → **Billing** → Upgrade to **Business**.
2. Choose **monthly** or **annual**, enter promo **`ActimiXYZ`**, continue.
3. Confirm totals:
   - Monthly USD: **$25**/seat
   - Annual USD: **$259.20**/seat/year (10% off $288)
4. Monthly also works if you leave the Desk promo blank and enter **`ActimiXYZ`** on the Polar checkout promo field. Annual **must** use the Desk promo (or `create_checkout(..., discount_code="ActimiXYZ", billing="annual")`) because Polar cannot attach the same code to the annual discount.

## ActimiTrial — 1-month Business (Polar promo code)

Native Polar discount (no Desk/app mapping). Polar cannot attach a subscription “trialing” status to a promo code; closest option is **100% off once** (first invoice free).

| Field | Value |
| --- | --- |
| **Code** | `ActimiTrial` |
| **Polar discount ID** | `9033b3d4-fb15-48bd-b84c-f1248c2cbd2d` |
| **Type** | Percentage `basis_points=10000` (100%) |
| **Duration** | `once` — first billing period only |
| **Product** | Zivvy Business monthly `ad515a76-fc1e-4f83-ac1b-b709d8797f62` |
| **After** | Normal Business **$30**/seat/mo (no ongoing discount) |

Does **not** apply to Pro or annual. Does **not** change ActimiXYZ.

### How to redeem ActimiTrial

1. Desk → **Billing** → Upgrade to **Business** → **monthly** (leave Desk promo blank).
2. On the Polar checkout page, enter **`ActimiTrial`** in the discount / promo field and apply.
3. Confirm first total is **$0**; complete checkout (payment method still collected for renewals).
4. Next month: full Business price.

### Tenant DB scrub (2026-07-23)

Production scrub (no DB wipe, no `FORCE_RECREATE_SITE`): removed all **Zivvy Tenants**, demo/founder/e2e **Users**, related **Companies**, isolation-test **Customers/Contacts**, and **User Permissions**. Kept **Administrator**, Email Account **Zivvy** (Resend), **Polar Settings**, Website Settings (`disable_signup=0`). Fresh signup provisions a new tenant.

## Manual steps that cannot be automated here

- Polar payout account / business verification for live settlements  
- Confirm checkout presentment currency (org default may differ from USD marketing copy)  
- One real Free→Pro checkout smoke as a non-demo tenant  
- PostHog project API key  
- DNS + TLS certificates (including optional `*.zivvy.xyz`)  
- Resend account + domain DNS verification for `@zivvy.xyz` (API key via `RESEND_API_KEY`)  
- Any cloud firewall / WAF rules for `/api/method/zivvy_brand.billing.webhooks.polar_webhook`  
- Restart `web` after changing Railway secrets if using `--skip-deploys`
