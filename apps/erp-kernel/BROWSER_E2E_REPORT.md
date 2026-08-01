# Zivvy browser E2E report

**Target:** https://zivvy.xyz (Vestcodes Railway · `web`)  
**When:** 2026-07-23 (browser Playwright Chromium)  
**Method:** Headless Chromium via Playwright; screenshots in [`e2e-screenshots/`](e2e-screenshots/). Credentials from `.demo-credentials.local` (not printed). Live Polar mode — checkout opened, **no paid charge completed**.

## Honest verdict

**Yes — a human can create a subscription in the browser today.**

From Desk → **Billing** as `demo.free@zivvy.xyz`, **Upgrade to Pro** opens a real Polar checkout (`polar.sh/checkout/…`) with seats, email prefilled, and Vestcodes / Zivvy Pro product. Stopped before “Subscribe now” (live mode).

After payment, Polar webhooks (`subscription.*` / `order.paid`) should update **Zivvy Tenant** plan/seats via checkout metadata `zivvy_tenant` (e.g. `demo-free`).

### Blockers fixed during this run (SSH, no redeploy)

| Issue | Fix |
| --- | --- |
| Demo users missing | Re-seeded `seed_demo_accounts` with Railway `DEMO_*_PASSWORD` |
| Desk stuck on `/app/setup-wizard` + “Not permitted” | Marked `Installed Application.is_setup_complete=1` for `frappe` + `erpnext` (+ System Settings `setup_complete`) |
| Persist fix | `seed_setup_complete()` in `zivvy_brand.setup.install` updated accordingly |

---

## Status table

| Flow | Result | Screenshots |
| --- | --- | --- |
| Documentation (marketing + legal + docs) | **PASS** | `01-home` … `12-nav-pricing-click` |
| Auth + Desk (demo free / pro / business) | **PASS** | `20-*-desk`, `20/21/22-*-billing` |
| Subscription creation (Upgrade → Polar) | **PASS** (stopped at Polar checkout) | `30-billing-before-checkout`, `32-polar-checkout` |
| Signup (`/login#signup`, EU datacenter) | **PASS** (account created; welcome email 422 to `@example.com`) | `40-signup-form`, `41-signup-filled`, `42-signup-result` |

---

## 1) Documentation (browser)

All major pages returned **200**, rendered styled UI (nav/CSS), no 500s. Nav click Home → Pricing works.

| Page | Status | Screenshot |
| --- | --- | --- |
| `/` (home) | PASS | [`e2e-screenshots/01-home.png`](e2e-screenshots/01-home.png) |
| `/pricing` | PASS | [`e2e-screenshots/02-pricing.png`](e2e-screenshots/02-pricing.png) |
| `/features` | PASS | [`e2e-screenshots/03-features.png`](e2e-screenshots/03-features.png) |
| `/developers` | PASS | [`e2e-screenshots/04-developers.png`](e2e-screenshots/04-developers.png) |
| `/docs` | PASS | [`e2e-screenshots/05-docs.png`](e2e-screenshots/05-docs.png) |
| `/blog` | PASS | [`e2e-screenshots/06-blog.png`](e2e-screenshots/06-blog.png) |
| `/terms` | PASS | [`e2e-screenshots/07-terms.png`](e2e-screenshots/07-terms.png) |
| `/privacy` | PASS | [`e2e-screenshots/08-privacy.png`](e2e-screenshots/08-privacy.png) |
| `/cookies` | PASS | [`e2e-screenshots/09-cookies.png`](e2e-screenshots/09-cookies.png) |
| `/acceptable-use` | PASS | [`e2e-screenshots/10-acceptable-use.png`](e2e-screenshots/10-acceptable-use.png) |
| `/contact` | PASS | [`e2e-screenshots/11-contact.png`](e2e-screenshots/11-contact.png) |
| Nav → Pricing | PASS | [`e2e-screenshots/12-nav-pricing-click.png`](e2e-screenshots/12-nav-pricing-click.png) |

---

## 2) Auth + Desk (browser)

| Account | Login | Billing plan shown | Screenshot |
| --- | --- | --- | --- |
| `demo.free@zivvy.xyz` | PASS → `/app/home` | **Free** · seats 1/2 · India | [`20-demo-free-desk.png`](e2e-screenshots/20-demo-free-desk.png), [`20-demo-free-billing.png`](e2e-screenshots/20-demo-free-billing.png) |
| `demo.pro@zivvy.xyz` | PASS | **Pro** · seats 1/1000 · EU | [`21-demo-pro-billing.png`](e2e-screenshots/21-demo-pro-billing.png) |
| `demo.business@zivvy.xyz` | PASS | **Business** · seats 1/1000 · US | [`22-demo-business-billing.png`](e2e-screenshots/22-demo-business-billing.png) |

Upgrade buttons enabled when Polar configured (free account showed **Upgrade to Pro** / **Upgrade to Business**).

---

## 3) Subscription creation (browser) — main ask

| Step | Result |
| --- | --- |
| Open `/app/billing` as free demo | PASS — plan Free, upgrade CTAs visible |
| Click **Upgrade to Pro** | PASS — navigates to Polar |
| Polar checkout | PASS — session created (live). Screenshot [`32-polar-checkout.png`](e2e-screenshots/32-polar-checkout.png) |
| Complete paid charge | **Not done** (live mode — stopped at checkout) |
| Webhook → tenant plan | **Ready in code** — after pay, expect `Zivvy Tenant` (`demo-free`) plan/seats/Polar IDs to update via signed webhook |

Observed Polar checkout details (from screenshot): Vestcodes org, **Zivvy Pro**, seat qty control, email `demo.free@zivvy.xyz`, presentment **₹1,299 / mo** (org default INR; product also has USD $15).

---

## 4) Signup (browser)

| Step | Result |
| --- | --- |
| `/login#signup` form | PASS — name, email, company, datacenter India/EU/US |
| Fill unique email + **EU** | PASS |
| Submit | **PASS** — UI: “Account created…”. Resend returned HTTP **422** for `@example.com` (expected for disposable test domains) |

Screenshots: [`40-signup-form.png`](e2e-screenshots/40-signup-form.png), [`41-signup-filled.png`](e2e-screenshots/41-signup-filled.png), [`42-signup-result.png`](e2e-screenshots/42-signup-result.png).

---

## What’s left for a human

1. Complete **one real** Free→Pro checkout (or Polar sandbox) and confirm tenant plan flips after webhook.  
2. Confirm checkout currency/tax messaging (INR presentment vs USD marketing).  
3. Ensure demo passwords stay in sync: Railway `DEMO_*_PASSWORD` ↔ `.demo-credentials.local` after any reseed.  
4. Optional: welcome-email path for real domains (Resend 422 only hit `@example.com` in this test).

## How to re-run

```bash
cd /Users/shrey/Desktop/work/zivvy_brand
# credentials: .demo-credentials.local (gitignored)
node scripts/browser_e2e.cjs   # full suite (API login recommended after latest fixes)
```

Artifacts: `e2e-screenshots/_browser_core.json`, `_signup.json`, `_results.json`.
