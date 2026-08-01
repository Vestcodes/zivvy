# Zivvy Brand

**Zivvy by Vestcodes** — Frappe overlay app for product branding, marketing site, SaaS legal pages, Polar.sh seat billing, PostHog analytics, and plan-based feature gating.

**Production:** [https://zivvy.xyz](https://zivvy.xyz) · Contact: contact@vestcodes.com · Entity: Vestcodes Co, India

This app does **not** rename the `erpnext` Python package. It overlays brand, legal, billing, and gating when installed on a site (after `erpnext`).

Deploy runbook: [`DEPLOY.md`](DEPLOY.md) · Polar checklist: [`scripts/setup_polar.md`](scripts/setup_polar.md)

## Brand

| Token | Value |
| --- | --- |
| Product | Zivvy |
| Lockup | Zivvy · by Vestcodes |
| Legal entity | Vestcodes Co |
| Contact | contact@vestcodes.com |
| Primary domain | https://zivvy.xyz |
| www | Prefer redirect to apex |
| Governing law | India |
| Primary | `#4F46E5` |
| Accent | `#7C3AED` |
| Surfaces | `#FFFFFF` / `#F8FAFC` |
| Text | `#0F172A` |
| Fonts | Sora + IBM Plex Sans |

## Requirements

- Frappe + ERPNext already available in the bench
- Install **after** `erpnext` so website/login overrides and hooks win

## Install (bench)

From your bench root (sibling of `apps/`):

```bash
bench get-app /path/to/zivvy_brand
# or symlink/copy into apps/zivvy_brand

bench --site zivvy.xyz install-app zivvy_brand
bench build --app zivvy_brand
bench --site zivvy.xyz migrate
bench --site zivvy.xyz clear-cache
```

Verify `apps.txt` order:

```
frappe
erpnext
zivvy_brand
```

On install/migrate the app seeds Website home → `home`, app name **Zivvy**, Polar checkout URL defaults for zivvy.xyz, and Vestcodes/Zivvy help links.

## Marketing site

Brand-first SaaS marketing (Sora + IBM Plex Sans, indigo/violet). Homepage is `/home` (also set as Website `home_page` on install). Canonical host: **https://zivvy.xyz**.

| Page | URL |
| --- | --- |
| Landing | https://zivvy.xyz/home (site root via Website Settings) |
| Features | https://zivvy.xyz/features |
| Pricing | https://zivvy.xyz/pricing |
| Contact | https://zivvy.xyz/contact |
| Blog index | https://zivvy.xyz/blog |
| Blog post | https://zivvy.xyz/blog/&lt;slug&gt; |

Shared chrome: `templates/marketing/` (nav + footer). No ERPNext product branding on marketing pages.

### Blog

Lightweight seeded posts in `zivvy_brand/blog/posts.py` (3 sample articles). Route rule maps `/blog/<slug>` → `blog_post`.

## Legal routes

| Page | URL |
| --- | --- |
| Terms of Service | https://zivvy.xyz/terms |
| Privacy Policy | https://zivvy.xyz/privacy |
| Cookie Policy | https://zivvy.xyz/cookies |
| Acceptable Use | https://zivvy.xyz/acceptable-use |

Linked from marketing footer, login footnote, portal footer, Website Settings powered-by, and mail footer.

Cookie banner: lightweight consent on website/login/desk (`zivvy_cookie_banner.js`), preference in `localStorage` key `zivvy_cookie_consent` (`all` vs `essential`). Cookie domain note for production: `.zivvy.xyz`.

## Plans (locked)

| Tier | Price | Annual (20% off) | Code |
| --- | --- | --- | --- |
| Free | $0 | — | `free` |
| Pro | $18 / user / month | $14/mo equiv ($168/year) | `pro` |
| Business | $30 / user / month | $24/mo equiv ($288/year) | `business` |

Feature matrix and DocType/module gates live in `zivvy_brand/gating/tiers.py`.

## Polar billing setup

Billing uses **[Polar](https://polar.sh/)** (not Stripe) with seat-based monthly and annual products.

**Copy-paste dashboard checklist:** [`scripts/setup_polar.md`](scripts/setup_polar.md)

### Quick path

1. Create org on [polar.sh](https://polar.sh) → Products: **Zivvy Pro** ($18/seat/mo), **Zivvy Business** ($30/seat/mo), plus Annual SKUs at 20% off.
2. Create Access Token + Webhook pointing to:

```
https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook
```

Events: `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.canceled`, `subscription.revoked`, `order.paid`.

3. Paste IDs/secrets into Polar Settings or env (see `.env.example`).
4. Test checkout from https://zivvy.xyz/app/billing

```bash
export POLAR_ACCESS_TOKEN="polar_oat_…"
export POLAR_PRO_PRODUCT_ID="…"
export POLAR_BUSINESS_PRODUCT_ID="…"
export POLAR_PRO_ANNUAL_PRODUCT_ID="…"
export POLAR_BUSINESS_ANNUAL_PRODUCT_ID="…"
export POLAR_WEBHOOK_SECRET="…"
export POLAR_SUCCESS_URL="https://zivvy.xyz/app/billing"
export POLAR_CANCEL_URL="https://zivvy.xyz/pricing"
export POLAR_USE_SANDBOX=0          # live api.polar.sh
# optional
export POLAR_ORGANIZATION_ID="…"
export POLAR_ORGANIZATION_SLUG="…"
```

**Do not hardcode secrets in the repo.**

Optional idempotent product create (when token is configured):

```bash
bench --site zivvy.xyz execute zivvy_brand.billing.setup_polar.setup_polar_products
```

### Desk surfaces

| Surface | Purpose |
| --- | --- |
| https://zivvy.xyz/app/billing | Current plan, seats, Upgrade, Manage billing |
| **Polar Settings** (Single) | Token, product IDs, webhook secret, sandbox flag, URLs |
| **Zivvy Subscription** (Single) | Synced tier, seats, Polar IDs (updated by webhooks) |
| **Zivvy Settings** (Single) | PostHog enable flag, project API key, US/EU/custom host, desk toggle |

Checkout seat quantity defaults to the current count of enabled System Users (minimum 1).

Without credentials, Billing shows a clear setup warning; checkout/portal APIs raise friendly errors instead of crashing.

## Feature gating

1. **Canonical map** — `zivvy_brand/gating/tiers.py` (`MODULE_MIN_TIER`, `DOCTYPE_MIN_TIER`).
2. **Bootinfo** — `frappe.boot.zivvy` exposes tier, seats, blocked modules/doctypes, priority support flag (Business).
3. **Server** — `has_permission` hooks deny gated DocTypes below plan; `User.validate` soft-enforces Free’s **2-user** seat cap (and paid seat allowance when synced); multi-company requires Business.
4. **Desk UI** — `zivvy_gating.js` guards Form/List routes, patches `frappe.new_doc`, shows an upgrade modal, and links to Billing / Pricing.

Free keeps CRM basics, Items, Sales Order / Purchase Order, and portal-oriented usage. Pro unlocks Accounting, Stock, HR, Projects, basic Manufacturing, banking reconciliation. Business adds advanced Manufacturing, Quality, Assets, Subscriptions, integrations/EDI-class modules, multi-company, and priority support badge.

## PostHog analytics

Config-driven (no hardcoded secrets). Prefer **Zivvy Settings** or env:

```bash
export POSTHOG_ENABLE=1
export POSTHOG_PROJECT_API_KEY="phc_…"
export POSTHOG_HOST="https://us.i.posthog.com"   # or https://eu.i.posthog.com
export POSTHOG_ENABLE_DESK=0                     # optional Desk injection
```

Behaviour:

1. `zivvy_posthog.js` loads on website (and Desk if enabled).
2. The PostHog snippet initializes **only after** cookie consent `choice === "all"`.
3. Essential-only never loads PostHog.
4. Marketing CTAs emit events via `data-zivvy-event` (`cta_start_free`, `cta_see_pricing`, `cta_upgrade`, `pricing_view`, `contact_form_submit`).

## Develop

```bash
bench build --app zivvy_brand
bench --site zivvy.xyz clear-cache
bench --site zivvy.xyz migrate
```

SCSS: `zivvy_brand/public/scss/zivvy.bundle.scss`  
Marketing CSS: `zivvy_brand/public/css/zivvy_marketing.css`  
Legal CSS: `zivvy_brand/public/css/zivvy_legal.css`

## License

MIT — Vestcodes
