# Deploying zivvy-web to Railway

Backend (Frappe/ERPNext/zivvy_brand) already lives on Railway at
`https://zivvy.xyz`. This document deploys the **Next.js frontend** to Railway
too. Both services will run on the same Railway workspace.

## 0. Preflight

- Railway CLI installed: `brew install railway` or `npm i -g @railway/cli`
- Signed in: `railway login`
- Node 22 + pnpm 11 locally (same as production build).

## 1. Create the Railway service

From the `zivvy-web/` directory:

```bash
cd /Users/shrey/Desktop/work/zivvy-web
railway init
```

Pick the existing Zivvy workspace when prompted. Give the service a name like
`zivvy-web`.

## 2. Set environment variables

In Railway → Service → Variables, add:

| Key | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_FRAPPE_ORIGIN` | `https://zivvy.xyz` | Backend origin |
| `FRAPPE_ORIGIN` | `https://zivvy.xyz` | Server-side (RSC) — matches public |
| `NEXT_PUBLIC_ZIVVY_DEV_MOCK` | `0` | **NEVER set to 1 in production** |
| `NODE_ENV` | `production` | Nixpacks sets this automatically |

Do NOT set `NEXT_PUBLIC_ZIVVY_DEV_MOCK=1` in Railway. That flag bypasses auth.

Railway automatically injects `PORT` — the `pnpm start` script uses it
(`next start -p ${PORT:-3000}`).

## 3. Custom domain

In Railway → Service → Settings → Networking → Custom Domain, add:

- `zivvy.xyz` — will need to be moved from the Frappe service (see step 5).
- OR a subdomain like `app.zivvy.xyz` — cleaner rollout, no DNS switching.

If keeping `zivvy.xyz` on the Frappe service today, use `app.zivvy.xyz` for now
and switch later once the frontend feels ready.

## 4. Deploy

```bash
railway up
```

Railway reads `nixpacks.toml` + `railway.json`, installs Node 22 + pnpm 11,
runs `pnpm install`, `pnpm build`, then `pnpm start`. First build takes
2–4 minutes; subsequent builds ~30–60s.

Watch logs: `railway logs --service zivvy-web`.

## 5. Cookie / session flow

**Because** `zivvy-web` on `app.zivvy.xyz` and the Frappe backend on
`zivvy.xyz` share the same registrable domain (`.zivvy.xyz`), the Frappe
`sid` cookie needs `Domain=.zivvy.xyz` to flow between them.

Two options:

### Option A — same origin (recommended)

Keep `zivvy.xyz` pointing at the Frappe service; add rewrites to the Frappe
Nginx / Traefik that proxy `/` to the Next.js service. Then `sid` never crosses
origins.

### Option B — subdomain + cookie widening

- Add `app.zivvy.xyz` to the Next.js service.
- On the Frappe service, set `cookie_domain = ".zivvy.xyz"` in `site_config.json`
  so `sid` is scoped to the apex.
- Add `allow_cors = ["https://app.zivvy.xyz"]` if Next.js needs to hit
  `/api/method/*` directly (our current rewrites keep everything same-origin,
  so this may not be needed).

Option A is simpler and matches the HANDOFF §7 plan. Option B is faster to
ship if you don't want to touch the Frappe Nginx.

## 6. Backend endpoints still to ship (from HANDOFF §7)

Two `zivvy_brand` methods aren't in prod yet — they're needed by the Next.js
build-time SSG for `/blog` and `/pricing`:

```python
# zivvy_brand/blog/posts.py  (allow_guest=True)
@frappe.whitelist(allow_guest=True)
def list_posts_json():
    posts = frappe.get_all("Blog Post", filters={"published": 1}, ...)
    return posts

# zivvy_brand/billing/pricing.py  (allow_guest=True)
@frappe.whitelist(allow_guest=True)
def get_public_plans():
    from zivvy_brand.gating.tiers import feature_matrix
    return feature_matrix()
```

Both must be `allow_guest=True` so build-time SSG can fetch them without a
session. Deploy those to the Frappe service on Railway alongside this
frontend.

## 7. Polar webhook (unchanged)

The Polar webhook currently points at
`https://zivvy.xyz/api/method/zivvy_brand.billing.webhooks.polar_webhook`.
That stays on the Frappe service — do NOT move it through the Next.js layer.
Webhooks must not hit `/api` on Next (rewrite adds latency + Vercel-style
body limits).

## 8. Rollback

```bash
railway rollback --service zivvy-web
```

Or in Railway UI → Deployments → click a previous deployment → Rollback.

## 9. Local parity

Before every deploy:

```bash
cd /Users/shrey/Desktop/work/zivvy-web
pnpm build        # smoke-test the production build
NEXT_PUBLIC_ZIVVY_DEV_MOCK=0 pnpm start   # run production locally
```

Hit `http://localhost:3000` in a browser you're NOT signed in as anything
else to catch any auth-gate regressions.

## 10. Quick checklist before first prod push

- [ ] `.env.local` has DEV_MOCK=0 (or delete the line)
- [ ] `railway login` completed
- [ ] Custom domain set (`app.zivvy.xyz` or `zivvy.xyz`)
- [ ] Two whitelisted endpoints (`list_posts_json`, `get_public_plans`) shipped
      to the Frappe service
- [ ] Polar `success_url` updated to point at the Next.js app if you want the
      post-checkout return page to be the new `/billing/success`
- [ ] `railway up` from `zivvy-web/` completes successfully
- [ ] `curl -sS https://app.zivvy.xyz/` returns the marketing home
- [ ] Signed-in browser can hit `/apps`, `/dashboard`, `/sales/invoices` and
      see real data (same sid works because same-domain).
