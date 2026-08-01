# Polar dashboard checklist — https://zivvy.xyz

Copy-paste ops checklist for production Polar billing. Secrets stay in the server env or Desk **Polar Settings** — never commit them.

## 1. Create org

1. Open [https://polar.sh](https://polar.sh) and sign in.
2. Create (or select) an organization for **Vestcodes / Zivvy**.
3. Optional: note **Organization ID** and slug → Polar Settings / `POLAR_ORGANIZATION_ID` / `POLAR_ORGANIZATION_SLUG`.

## 2. Create seat-based products

In Polar → **Products**, create **monthly** and **annual** seat-based products.

**Annual formula:** `round(monthly × 0.8)` per seat / month, billed yearly (20% off).

| Product | Price | Notes |
| --- | --- | --- |
| **Zivvy Pro** | **$18 / seat / month** | Monthly seat-based |
| **Zivvy Business** | **$30 / seat / month** | Monthly seat-based |
| **Zivvy Pro Annual** | **$168 / seat / year** ($14/mo equiv) | Yearly seat-based |
| **Zivvy Business Annual** | **$288 / seat / year** ($24/mo equiv) | Yearly seat-based |

Enable seat-based pricing in Polar if prompted (org Features).

Copy each **Product ID**.

### Optional API bootstrap

If `POLAR_ACCESS_TOKEN` is already on the server (scopes include `products:read` + `products:write`):

```bash
bench --site zivvy.xyz execute zivvy_brand.billing.setup_polar.setup_polar_products
# or Desk: zivvy_brand.billing.api.setup_polar_products
```

This creates/reuses products named exactly `Zivvy Pro` / `Zivvy Business` / annual variants and fills empty Polar Settings product ID fields.

## 3. Access token

Polar → Settings → **Access Tokens** (Organization Access Token).

Recommended scopes:

- `checkouts:write`
- `customer_sessions:write`
- `subscriptions:read`
- `products:read`
- `products:write` (only if using `setup_polar_products`)

Paste into server env (preferred) or Desk → **Polar Settings** → Access Token:

```bash
export POLAR_ACCESS_TOKEN="polar_oat_…"
```

## 4. Webhook (production)

Polar → Settings → **Webhooks** → Add endpoint:

```
https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook
```

Subscribe at least to:

- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `subscription.revoked`
- `order.paid`

Copy the **signing secret** → `POLAR_WEBHOOK_SECRET` or Polar Settings → Webhook Secret.

## 5. Paste IDs / URLs on the server

Env (see repo `.env.example`) or Desk → **Polar Settings**:

| Setting | Production value |
| --- | --- |
| Pro Product ID | from Polar Products |
| Business Product ID | from Polar Products |
| Success URL | `https://zivvy.xyz/app/billing` |
| Cancel / Return URL | `https://zivvy.xyz/pricing` |
| Use Sandbox | **off** for live |

```bash
export POLAR_PRO_PRODUCT_ID="…"
export POLAR_BUSINESS_PRODUCT_ID="…"
export POLAR_WEBHOOK_SECRET="…"
export POLAR_SUCCESS_URL="https://zivvy.xyz/app/billing"
export POLAR_CANCEL_URL="https://zivvy.xyz/pricing"
export POLAR_USE_SANDBOX=0
```

## 6. Test checkout

1. `bench --site zivvy.xyz clear-cache`
2. Sign in as a Desk user for the tenant → [https://zivvy.xyz/app/billing](https://zivvy.xyz/app/billing)
3. Upgrade to Pro (sandbox first if testing with `POLAR_USE_SANDBOX=1` + sandbox products)
4. Confirm webhook updates **Zivvy Tenant** plan + seats (and Polar IDs). Site `Zivvy Subscription` is ops fallback only.
5. Cancel path should land on [https://zivvy.xyz/pricing](https://zivvy.xyz/pricing)
6. **Manage billing** opens Polar customer portal

### Production note (2026-07)

Zivvy Pro / Business seat products and Railway product IDs are live. Keep the **Zivvy production** webhook endpoint at `https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook` with subscription + `order.paid` events. Do not reuse mini-EMS webhook URLs.

## Sandbox vs live

| Mode | API | Flag |
| --- | --- | --- |
| Sandbox | `https://sandbox-api.polar.sh/v1` | `POLAR_USE_SANDBOX=1` or Polar Settings check |
| Live | `https://api.polar.sh/v1` | `POLAR_USE_SANDBOX=0` (production) |

Use separate products/tokens for sandbox vs live.

## 7. Paid add-ons (2026-07)

Four monthly + four annual fixed-price products live on org **Vestcodes**
(`e80453a0-44aa-4026-9002-22778c174e9d`), each with `metadata.addon_slug`.

Polar requires **one recurring interval per product**, so annual SKUs are
separate products (`* Annual`). Desk `polar_product_id` = **monthly** product
(used by checkout). `polar_annual_price_id` stores the annual USD price id.

### Apply IDs on Desk

```bash
bench --site zivvy.xyz execute zivvy_brand.billing.setup_addon_polar_ids.apply_addon_polar_ids
```

Or paste manually in `/app/zivvy-addon`.

### Add-ons webhook

```
https://api.zivvy.xyz/api/method/zivvy_brand.billing.addons_polar.handle_webhook
```

Events: `subscription.created`, `subscription.updated`, `subscription.canceled`,
`subscription.uncanceled`, `checkout.updated`.

Store the endpoint signing secret as **`POLAR_ADDONS_WEBHOOK_SECRET`** on Railway
(falls back to `POLAR_WEBHOOK_SECRET` if unset — prefer a dedicated secret so the
seat-billing webhook stays untouched).

### Required org setting

**Settings → Subscriptions → Allow multiple subscriptions = ON**

Without this, a customer who already has Pro/Business cannot also subscribe to
an add-on.

### Checkout return URLs

Set per-checkout in `zivvy_brand.api.addons.subscribe`:

- Success: `https://zivvy.xyz/settings/addons?polar_success=1`
- Cancel: `https://zivvy.xyz/settings/addons?polar_cancelled=1`
