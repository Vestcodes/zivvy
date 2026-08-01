# zivvy-web — Handoff

Last updated: 2026-07-23 (Phase 2 in place)
Scope: Phase 1 foundation + Phase 2 app shell, dashboard, AutoList/AutoForm, and one hand-crafted hero screen (Sales Invoice).

**Latest changes at the top — see §17 for Phase 2 additions.**

---

## 1. What this is

`zivvy-web` is the customer-facing Next.js 15 application that talks to the Zivvy Frappe/ERPNext backend at `https://zivvy.xyz`. Frappe/ERPNext stays as the backend; this frontend renders marketing, auth, and billing today, and will grow to cover the dashboard, list views, and hero screens in phases 2–4.

- **Repo**: `/Users/shrey/Desktop/work/zivvy-web` (sibling of `erpnext` and `zivvy_brand`)
- **Runtime**: Next.js 15.1.6, React 19, TypeScript strict, Tailwind v4, shadcn (new-york)
- **Backend**: unchanged — Frappe on Railway at `https://zivvy.xyz`
- **Deploy target**: Vercel, same-origin edge-proxy to Railway (see §7)

---

## 2. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router, RSC) | SSG for marketing, SSR for auth-gated pages, edge-proxy for API |
| UI kit | shadcn (`new-york`) — strictly | User-mandated. All primitives via `pnpm dlx shadcn@4.13.0 add …` |
| Styling | Tailwind v4 (`@theme inline`) + OKLCH tokens | Native Tailwind v4 color format; brand tokens work in light + dark |
| Fonts | Sora (display), IBM Plex Sans (body), IBM Plex Mono (numeric) via `next/font/google` | Self-hosted, matches banking/ design system |
| Icons | `lucide-react` | shadcn default |
| Backend RPC | Hand-rolled thin client in `lib/frappe-client.ts` | frappe-react-sdk installed but not wired yet — pulls SWR |
| Session | Frappe `sid` cookie, HTTP-only, forwarded via same-origin rewrites | Zero CORS complexity |

Locked to `shadcn@4.13.0` (see `package.json`) — the latest `shadcn` CLI (`5.x`) errors on `pnpm add` inside the workflow. If we ever need `5.x`, revisit the pnpm setup.

---

## 3. Local dev

```bash
cd /Users/shrey/Desktop/work/zivvy-web
pnpm install
pnpm dev            # http://localhost:3000
```

Port `3000` is baked into `package.json` scripts and referenced throughout. If it collides with a squatting Docker container, kill the container rather than switching ports.

### Environment

`.env.local` (already present):

```
NEXT_PUBLIC_FRAPPE_ORIGIN=https://zivvy.xyz
```

For local Frappe testing later:

```
NEXT_PUBLIC_FRAPPE_ORIGIN=http://localhost:8000
FRAPPE_ORIGIN=http://localhost:8000    # server-side (bootinfo fetch)
```

### pnpm quirks

pnpm 11's `verify-deps-before-run` treats the `sharp` ignored-build warning as a fatal error inside `pnpm dev`. Two fixes are in the repo already:
- `.npmrc` sets `verify-deps-before-run=false` and `strict-dep-builds=false`
- `pnpm-workspace.yaml` allows `sharp` via `onlyBuiltDependencies`

If dev ever fails again with `runDepsStatusCheck`, run `./node_modules/.bin/next dev -p 3000` directly.

---

## 4. Routes shipped

### Public (SSG / ISR)

| Path | Type | Notes |
| --- | --- | --- |
| `/` | SSG | Home — Hero + Features + Pricing preview + Footer |
| `/features` | SSG | Feature grid grouped by tier |
| `/pricing` | SSG | Plans + compare table + FAQ |
| `/contact` | SSG (shell) + client form | Form posts to `zivvy_brand.analytics.contact.submit_contact` |
| `/terms`, `/privacy`, `/cookies`, `/acceptable-use` | SSG | Legal shell; placeholder copy (canonical text lives in `zivvy_brand/www/`) |
| `/sitemap.xml` | Generated | `app/sitemap.ts` |
| `/robots.txt` | Generated | `app/robots.ts` |
| `/llms.txt`, `/ai.txt` | Static | `public/*.txt` |

### Auth (SSR shell + client)

| Path | Notes |
| --- | --- |
| `/login` | Two-column layout; `#signup` hash toggles to signup tab |
| `/login#signup` | Same page, signup tab active |
| `/billing` | Server-gated — redirects to `/login?redirect-to=/billing` when guest |
| `/billing/success` | Post-checkout polling (`get_my_plan` up to 6× at 1.8s intervals) |

### Rewrites (never rendered by Next)

`next.config.mjs` proxies these to Railway (`https://zivvy.xyz`):

```
/api/:path*
/method/:path*
/assets/:path*
/files/:path*
/private/files/:path*
/socket.io/:path*
/app/:path*
/desk/:path*
```

Same-origin at the browser → `sid` cookie flows without CORS.

---

## 5. File map

```
zivvy-web/
├─ app/
│  ├─ layout.tsx                      # RSC — fetches bootinfo, wraps in <BootProvider>
│  ├─ globals.css                     # Tailwind v4 @theme inline + OKLCH tokens
│  ├─ page.tsx                        # Home
│  ├─ features/page.tsx
│  ├─ pricing/page.tsx
│  ├─ contact/page.tsx
│  ├─ terms/page.tsx
│  ├─ privacy/page.tsx
│  ├─ cookies/page.tsx
│  ├─ acceptable-use/page.tsx
│  ├─ login/page.tsx                  # RSC shell, hosts <AuthPanel />
│  ├─ billing/page.tsx                # Auth-gated; renders <PlanCard /> + <ManagePlan />
│  ├─ billing/success/page.tsx        # Client <BillingSuccess /> polls get_my_plan
│  ├─ sitemap.ts / robots.ts
├─ components/
│  ├─ ui/                             # shadcn — DO NOT hand-roll; always `shadcn add`
│  ├─ site/                           # header, footer, hero, features, pricing-*, logo, contact-form, legal-shell
│  ├─ auth/                           # auth-panel, signin-form, signup-form
│  ├─ billing/                        # plan-card, manage-plan, billing-success
│  ├─ boot-provider.tsx               # React context + useZivvyBoot/useTier/useEntitlement
│  └─ upgrade-required.tsx            # First-class 403 state for tier-gated features
├─ lib/
│  ├─ utils.ts                        # shadcn `cn(...)`
│  ├─ frappe-client.ts                # frappeCall, frappeLogin, frappeSignup, magic-link, reset-password, logout
│  ├─ billing-client.ts               # getMyPlan, createCheckout, createPortalSession
│  ├─ boot-types.ts                   # Bootinfo + ZivvyBoot + tierAtLeast helpers
│  └─ boot-server.ts                  # RSC-only bootinfo fetch (forwards cookies)
├─ public/
│  ├─ llms.txt
│  └─ ai.txt
├─ next.config.mjs                    # Frappe rewrites
├─ postcss.config.mjs                 # Tailwind v4
├─ tsconfig.json                      # strict; paths @/*
├─ components.json                    # shadcn config (new-york, neutral base)
├─ .env.local                         # NEXT_PUBLIC_FRAPPE_ORIGIN
├─ .npmrc                             # pnpm 11 quirks fixed
└─ pnpm-workspace.yaml                # sharp allowed to build
```

---

## 6. Backend integration contract

### Endpoints consumed today

| RPC | Where | Notes |
| --- | --- | --- |
| `POST /api/method/login` | signin-form | Stock Frappe. Sets `sid` cookie. |
| `POST /api/method/zivvy_brand.auth.signup.sign_up` | signup-form | Requires `email`, `full_name`, `zivvy_datacenter`; optional `company_name`, `redirect_to` |
| `POST /api/method/frappe.www.login.send_login_link` | signin-form | Magic-link email (routed through Resend HTTP by hooks) |
| `POST /api/method/frappe.core.doctype.user.user.reset_password` | (wired but no UI yet) | Password reset stub in `lib/frappe-client.ts` |
| `POST /api/method/frappe.auth.get_logged_user` | (wired) | Session check |
| `POST /api/method/logout` | (wired) | Logout |
| `POST /api/method/frappe.boot.get_bootinfo` | `boot-server.ts` (RSC) | Reads `bootinfo.zivvy`; forwards cookies |
| `POST /api/method/zivvy_brand.billing.api.get_my_plan` | billing-success poll | Post-checkout confirmation |
| `POST /api/method/zivvy_brand.billing.api.create_checkout` | manage-plan | Returns `{url}` — client redirects |
| `POST /api/method/zivvy_brand.billing.api.create_portal_session` | manage-plan | Returns `{url}` for Polar portal |
| `POST /api/method/zivvy_brand.analytics.contact.submit_contact` | contact-form | Guest-callable |

### Boot payload shape

Types in `lib/boot-types.ts`. Read via `useZivvyBoot()`; server-side via `fetchBootinfo()`. Frontend uses this ONLY for UX (hide/disable/CTA). Real gating is enforced by Frappe backend hooks in five stacked layers per audit.

### Never assume

Per audit tenancy-contract:
- Do not filter lists by `zivvy_tenant` client-side — server does it.
- Do not send `X-Tenant` headers — server doesn't honor them.
- Do not set `doc.zivvy_tenant` on writes — server stamps on insert.
- Do not treat `bootinfo.zivvy.tenant.plan` as authoritative for writes — Polar webhooks are the source of truth.

---

## 7. Deployment plan (not yet cut over)

Same-origin edge-proxy on Vercel. Zero backend rewrite required.

Minimum backend changes still to ship before DNS cutover:
1. New whitelisted JSON endpoints — `zivvy_brand.blog.posts.list_posts_json` and `zivvy_brand.billing.pricing.get_public_plans` (both `allow_guest=True`) for build-time SSG reads.
2. Add `api.zivvy.xyz` Railway custom domain; move Polar webhook URL to it.
3. Update Polar `success_url` to `https://zivvy.xyz/billing/success` (Next.js) — currently `/app/billing` (Desk).

DNS cutover (still to do):
- `ALIAS @` → `cname.vercel-dns.com`
- `CNAME www` → `cname.vercel-dns.com`
- `CNAME api` → Railway target
- Rollback: revert two DNS rows.

---

## 8. Design decisions locked in

- **shadcn strictly.** Every UI primitive goes through `pnpm dlx shadcn@4.13.0 add <name> --yes --overwrite`. No hand-rolled Radix. Currently added: `button, card, input, label, dialog, badge, separator, sonner, dropdown-menu, sheet, textarea, tabs, select, progress`.
- **OKLCH tokens** in `app/globals.css`. Brand: `--brand: oklch(0.62 0.22 275)` (indigo #5D53FF), `--brand-2: oklch(0.79 0.15 190)` (mint #20D4BB), `--midnight: oklch(0.18 0.05 265)`. Gradient CTA `linear-gradient(132deg, var(--brand), … , var(--brand-2))`.
- **Fonts** via `next/font/google` (Sora / IBM Plex Sans / IBM Plex Mono). Body defaults to Plex Sans; `.font-display` = Sora with tighter tracking; `.tabular-nums` / `.font-mono` = Plex Mono.
- **Auth session bridge** = plain Frappe `sid` cookie via same-origin rewrites. No NextAuth, no token exchange.
- **Server-side boot fetch** happens once at the root layout for every request — cheap because Frappe boot is fast and edge-cached. Guest returns `GUEST_BOOT` sentinel; layout never crashes.

---

## 9. Known gaps (next-session pickup)

- **`/blog` and `/blog/[slug]`** not built yet — need the new `list_posts_json` endpoint first (§7).
- **Password reset UI** — client function exists but no page yet.
- **Post-signup landing** — signup currently toasts a message and stays put; wire a "Check your email" state.
- **Blog list must be ISR** (`revalidate=300`).
- **App shell for `/dashboard`** — Phase 2 territory (sidebar, awesomebar, breadcrumbs, `<AutoList />`, `<AutoForm />`).
- **Dark-mode brand palette for marketing** — Zivvy CSS in `zivvy_brand/public/css/*` has no dark ramp; the OKLCH tokens here do. Reconcile if we ever port zivvy_brand marketing surfaces verbatim.
- **Brand-mark color reconciliation** — indigo `#5D53FF` (CSS) vs purple `#AF33F2` (SVG logo/favicon in erpnext repo). Currently we render a text-based Z mark in the gradient; when the real SVG is dropped in, reconcile the palettes.
- **Client Scripts on doctypes** — Phase 2 concern; publish an AutoForm-safe DocType allowlist and route the rest to Desk via `/app/*` rewrites.
- **CSRF handling on writes** — `frappe-client.ts` reads `csrf_token` cookie and sends `X-Frappe-CSRF-Token`; only relevant post-login. Verified via curl once we have a real session.

---

## 10. Verified this session

| Route | Visual check | Notes |
| --- | --- | --- |
| `/` | ✓ | Hero, gradient logo tile, feature cards, pricing preview |
| `/pricing` | ✓ | H1 fixed to avoid duplicate intro after `<PricingPreview showIntro={false} />` |
| `/features` | ✓ | Tier-grouped grid |
| `/contact` | ✓ | Gradient contact tiles, shadcn form with Sonner toast |
| `/terms` | ✓ | Legal shell renders |
| `/login` | ✓ | Sign-in tab, indigo gradient CTA |
| `/login#signup` | ✓ | Signup tab, datacenter select, terms/privacy links |
| `/billing` | ✓ | Redirects guests to `/login?redirect-to=/billing` |
| `/billing/success` | ✓ | Client polling renders, spinner + attempt counter |
| `/sitemap.xml` | ✓ | 9 URLs, weekly/monthly/yearly priorities |
| `/robots.txt` | ✓ | Disallows `/app/`, `/api/`, `/private/`, `/desk/` |
| `/llms.txt` | ✓ | Served from `public/` |

---

## 11. Continue from here

1. Ship the two backend endpoints listed in §7 in `zivvy_brand`.
2. Add `/blog` and `/blog/[slug]` (ISR) once endpoints are live.
3. Wire the "check your email" post-signup screen.
4. Password reset page (UI is the missing piece; `frappeResetPassword` client already exists).
5. Start Phase 2: `FrappeBootProvider` already exists — build the authenticated app shell at `/dashboard` next (sidebar + module switcher + awesomebar).
6. Then `<AutoList />` + `<AutoForm />` metadata layer.

Everything under `components/ui/*` came from shadcn CLI — if you edit those files, do it carefully; the next `shadcn add --overwrite` will wipe unrelated changes. Prefer wrapping shadcn primitives in your own components under `components/site/`, `components/auth/`, `components/billing/`, etc.

---

## 17. Phase 2 additions (2026-07-23)

Phase 2 landed the authenticated app shell + generic AutoList/AutoForm layer + one hand-crafted hero (Sales Invoice detail). Theme was also swapped twice at the user's request; current palette is magenta primary / cyan accent, Outfit + Fira Code fonts.

### 17.1 Theme (current)

- **Primary:** `#ff00c8` (hot magenta). Full palette in `app/globals.css`.
- **Accent:** `#00ffcc` (cyan-mint).
- **Fonts:** Outfit (sans, via `next/font/google` `--font-outfit`), Fira Code (mono, `--font-fira-code`). Display class re-uses Outfit with tighter tracking + `font-weight: 600`.
- **Sidebar:** Light lavender (`#f0f0ff`) in light mode, dark navy (`#0c0c1d`) in dark mode.
- Old `--brand` / `--brand-2` / `--midnight` tokens removed — all references migrated.
- `--primary-light` / `--primary-dark` / `--primary-ring` are **auto-derived** from `--primary` via `color-mix(in oklab, …)`. Swap primary and gradients/rings adapt automatically.
- `bg-primary-gradient` utility (in `globals.css`) is the tile background. Used by logo, icon tiles, hero cards, avatars.
- `shadow-brand` utility retained as a `--primary`-tinted shadow (legacy name, redefined).

### 17.2 New shadcn primitives added

`pnpm dlx shadcn@4.13.0 add sidebar command breadcrumb avatar tooltip scroll-area skeleton table textarea tabs select progress` — locked to `4.13.0` because `5.x` errors on pnpm 11's internal `runDepsStatusCheck`.

### 17.3 Button variants

`components/ui/button.tsx` gains `variant="polished"` — currently `bg-primary text-primary-foreground shadow-md hover:brightness-110 hover:shadow-lg transition-[filter,box-shadow]`. Started life with the user's gradient + ring + inset-shadow spec; simplified after two theme swaps because primary is now vibrant enough on its own. Bring back the gradient version by swapping the class to `bg-primary-gradient ring-1 ring-inset ring-primary-ring/60`.

### 17.4 SelectTrigger normalized

Was `w-fit ... py-2` — now `w-full ... py-1` to match `Input` (both `h-9`, both stretch inside their form container). Verified via JS: both 36px height, both stretch to parent width.

### 17.5 Dev-only mock boot

`.env.local` gains `NEXT_PUBLIC_ZIVVY_DEV_MOCK=1`. When set, `lib/boot-server.ts` always returns `MOCK_BOOT` (defined in `lib/mock-boot.ts`) instead of trying to hit real Frappe. Mock user is "Alex Rivera / you@acme.co", tenant "Acme Co" on Pro tier with 3/10 seats. This is the ONLY reason the authenticated `(app)/*` routes render at all locally — turn it off before production.

### 17.6 Authenticated route group `(app)/*`

- **`app/(app)/layout.tsx`** — RSC. Fetches boot; redirects to `/login?redirect-to=/dashboard` when guest. Wraps children in `<TooltipProvider>` + `<SidebarProvider>` + `<AppSidebar />` + `<SidebarInset>` + `<AppTopbar />` + content slot.
- **`components/app/app-sidebar.tsx`** — the sidebar. Renders sections from `sidebar-nav.ts`. Reads `bootinfo.zivvy.blocked_modules` + tier to grey-out + lock-icon gated items; clicking a gated row routes to `/billing`.
- **`components/app/sidebar-nav.ts`** — the canonical nav structure. 6 sections (Workspace, Sales, Purchases, Stock, Finance, Manufacturing, Setup) × 20 items. Edit here to change the sidebar.
- **`components/app/user-menu.tsx`** — bottom-of-sidebar user menu. Avatar initials (uses `full_name` split), name/email, dropdown → Settings / Billing / Help / Log out (calls `frappeLogout()` then bounces to `/login`).
- **`components/app/app-topbar.tsx`** — sticky top bar. `SidebarTrigger` (collapses on desktop, opens sheet on mobile) → separator → segment-derived breadcrumbs → `AwesomebarTrigger` → tier badge → tenant company name → notification bell.
- **`components/app/awesomebar.tsx`** — Cmd/Ctrl+K palette (`cmdk` under `command.tsx`). Groups: Quick actions (New invoice/customer/PO/item), Jump to (Dashboard/Billing/Help/Settings), plus every sidebar section flattened.

### 17.7 Dashboard `/dashboard`

Hand-crafted, persona-aware layout in `app/(app)/dashboard/page.tsx`.

- `components/dashboard/dashboard-hero.tsx` — greeting (Good morning/afternoon/evening based on `new Date().getHours()`), full name from `bootinfo.user.full_name`, company from `bootinfo.zivvy.tenant.company`, primary CTAs (New customer + polished New invoice).
- `components/dashboard/dashboard-kpis.tsx` — 4 KPI tiles (Revenue this month, Outstanding invoices, Stock alerts, New leads), each with delta indicator, tabular-nums value in Fira Code. Mocked values today.
- `components/dashboard/dashboard-attention.tsx` — "Needs your attention" list. Overdue invoices, low stock, arrivals. Each item is a link to its detail. Severity → color (destructive / chart-2 / muted).
- `components/dashboard/dashboard-activity.tsx` — recent activity feed. Payment received, order shipped, new lead, invoice sent.

All dashboard data is currently mocked in the component files. To wire real data:
1. Convert each widget to a server component.
2. Add server fetch helpers to `lib/frappe-meta.ts` (e.g. `reportviewGet` with aggregation filters).
3. Replace the mock arrays.

### 17.8 AutoList — metadata-driven list view

- **Route**: `app/(app)/[module]/[doctype]/page.tsx` — takes URL slug pair, maps to Frappe DocType via `lib/doctype-slugs.ts`.
- **Component**: `components/auto/auto-list.tsx` — RSC. Fetches `getDoctypeMeta(doctype)` then `reportviewGet(...)`. Renders shadcn `<Table>` with columns from `listViewFields(meta)` (respects `in_list_view=1`, falls back to a heuristic).
- **Cells**: `components/auto/field-cell.tsx` — per-fieldtype renderer for `Currency`, `Float`, `Percent`, `Int`, `Date`, `Datetime`, `Check`, `Select`, `Link`, `Data` (Tier-1 coverage from audit).
- **Empty/auth/error states**: `auto-list-empty.tsx` + `auto-list-skeleton.tsx` — polished "Sign in to load…" and "Doctype metadata not available" cards with retry + sign-in CTAs.
- **Slug map**: `lib/doctype-slugs.ts` — extend for any new doctype URL. Currently maps 17 slugs.

### 17.9 AutoForm — metadata-driven form

- **Route**: `app/(app)/[module]/[doctype]/[name]/page.tsx` — third URL segment is the record name, or `new` for create mode.
- **Server component**: `components/auto/auto-form.tsx` — fetches meta + doc via `getDoc()`. Groups fields via `groupFieldsForForm(meta)` (Section/Column/Tab breaks respected; `Table`, `Table MultiSelect`, `HTML` deferred).
- **Client component**: `components/auto/auto-form-client.tsx` — state + save/submit/cancel actions via `frappeCall("frappe.client.insert" | "save" | "submit" | "cancel")`. Toggle Edit / Discard / Save; docstatus badge (Draft / Submitted / Cancelled); if `is_submittable` → Submit button when Draft, Cancel button when Submitted.
- **Field widgets**: `components/auto/field-input.tsx` (edit) + `components/auto/field-view.tsx` (read). Covers Data / Link / Select / Currency / Float / Int / Percent / Date / Datetime / Check / Text / Small Text / Long Text.

### 17.10 Hero screen — Sales Invoice

Route `app/(app)/sales/invoices/[id]/page.tsx` wins over the generic `[module]/[doctype]/[name]` for `/sales/invoices/*` (Next.js explicit-segment precedence). This is the pattern for adding more hand-crafted heroes: build `app/(app)/<module>/<slug>/[id]/page.tsx` and it takes over for that specific slug.

`components/sales/invoice-hero.tsx` — the hand-crafted layout: split view (customer + items + notes on the left, totals + activity + shortcuts on the right), magenta gradient initials tile, `font-mono tabular-nums` on all money + dates, status badge palette per invoice.status, "N days late" callout when overdue.

Uses `lib/mock-invoice.ts` for now — three seeded invoices (INV-1024 Riven Analytics overdue, INV-1031 Northline Ops overdue, INV-1033 Solstice unpaid) plus a generic fallback. **To wire real data**: replace `getMockInvoice(name)` call with `getDoc("Sales Invoice", name)` from `lib/frappe-meta.ts`, then map the Frappe shape onto the `Invoice` interface (child table `items` comes from `doc.items[]`, totals from doc, activity from a separate `frappe.desk.form.docinfo` call).

### 17.11 File map delta (new files)

```
app/(app)/
├─ layout.tsx                              # RSC auth + shell
├─ dashboard/page.tsx                      # hand-crafted hero
├─ [module]/[doctype]/page.tsx             # AutoList route
├─ [module]/[doctype]/[name]/page.tsx      # AutoForm route
└─ sales/invoices/[id]/page.tsx            # Sales Invoice hero override

components/
├─ app/                                    # NEW — app shell
│  ├─ app-sidebar.tsx
│  ├─ app-topbar.tsx
│  ├─ awesomebar.tsx
│  ├─ user-menu.tsx
│  └─ sidebar-nav.ts
├─ auto/                                   # NEW — metadata layer
│  ├─ auto-list.tsx
│  ├─ auto-list-empty.tsx
│  ├─ auto-list-skeleton.tsx
│  ├─ auto-form.tsx
│  ├─ auto-form-client.tsx
│  ├─ field-cell.tsx
│  ├─ field-view.tsx
│  └─ field-input.tsx
├─ dashboard/                              # NEW
│  ├─ dashboard-hero.tsx
│  ├─ dashboard-kpis.tsx
│  ├─ dashboard-attention.tsx
│  └─ dashboard-activity.tsx
└─ sales/                                  # NEW — hero overrides
   └─ invoice-hero.tsx

lib/
├─ frappe-meta.ts                          # NEW — getdoctype, reportview.get, getdoc, groupFieldsForForm
├─ doctype-slugs.ts                        # NEW — URL slug ↔ DocType name map
├─ mock-boot.ts                            # NEW — dev preview boot payload
└─ mock-invoice.ts                         # NEW — hero-screen preview data
```

### 17.12 Verified in browser this session (Phase 2)

| Route | State |
|---|---|
| `/` | Homepage magenta primary CTAs + Outfit hero + italic accent |
| `/pricing`, `/features`, `/contact`, `/login`, `/login#signup` | Migrated to new theme cleanly |
| `/dashboard` | Full shell + hero + KPI + KPIs + attention + activity |
| `/sales/invoices` (guest) | Metadata-unavailable fallback with retry + sign in |
| `/sales/invoices/INV-1024` | Full hero — badge, "12 days late", customer card, action row, "Record payment" polished |
| Sidebar (via JS trigger) | 20 nav items + user menu rendering |
| Input vs Select in signup | Both 36px × 368px, matching |

### 17.13 Continue-from-here (Phase 3+)

- Wire real data in dashboard widgets (currently mock arrays).
- Extend `Sales Invoice hero` to fall back to real `getDoc` when logged in (`lib/mock-invoice.ts` is dev-preview only).
- Build the remaining hero overrides in `components/<module>/`: Customer 360, Purchase Order, Item detail.
- AutoList: server-side filter + sort UI (currently only search input placeholder).
- AutoForm: child table (`Table`, `Table MultiSelect`) inline editor, plus workflow action buttons for doctypes with a bound workflow.
- Wire `frappe.desk.search.search_link` for Link field autocomplete in `field-input.tsx`.
- Add Attach / Attach Image via `POST /api/method/upload_file`.
- Turn off `NEXT_PUBLIC_ZIVVY_DEV_MOCK` before merging to production; add an auth guard log.
- Password reset UI + post-signup "Check your email" screen (still in the Phase 1 gaps).
- Blog list (`/blog`) + slug (`/blog/[slug]`) once `list_posts_json` endpoint ships in `zivvy_brand`.
- DNS cutover to Vercel per §7.

### 17.14 Known warts (fix before launch)

- Deps advisory on `next@15.1.6` (CVE-2025-66478). Bump to a patched 15.x when convenient — component code should be compatible.
- Every `pnpm dlx shadcn@4.13.0 add` overwrites `components/ui/button.tsx` including our polished variant. Whenever we add new primitives, immediately re-add polished. Same for any other custom variants we bolt onto shadcn base components.
- `.env.local` currently commits `NEXT_PUBLIC_ZIVVY_DEV_MOCK=1` — this is a **dev-preview only** flag. Do not deploy it. Vercel env should NOT define it.
- Some feature-gated sidebar rows still route to `/billing` on click; those pages don't exist yet in Next (they're the metadata routes). Once AutoList grows real data, they become useful; today they'll show the empty state.
- Dashboard data is all mocked. Replace the top-of-file arrays with real fetches when wiring live.
- Sidebar in mobile is a Sheet; on very narrow viewports the topbar's tenant/plan chips get pushed off. Acceptable for now, revisit for actual mobile break.

### 17.15 Bootinfo mock cheat-sheet

If you need different dev-preview state, edit `lib/mock-boot.ts`. Change `tier`, `blocked_modules`, `seats_used`, `subscription_status`, etc. Sidebar gates + upgrade CTAs + billing page all react to it.

---

## 18. Phase 2b — module reorg + Odoo-style launcher (2026-07-23)

Multiple product decisions from the user this session:
1. `/apps` becomes the true home — full-screen launcher grid, no sidebar. Just top bar (logo + Cmd+K + tenant + tier + avatar).
2. Every module route (`/sales/*`, `/hr/*`, `/finance/*`, `/pos/*`, `/assets/*`, `/support/*`, `/manufacturing/*`, …) shows only **that module's** sidebar with a "← All apps" back arrow at the top and module title + subtitle beneath it.
3. Theme swapped twice — landed on user-provided magenta primary (`#ff00c8`) / cyan accent (`#00ffcc`) / Outfit body / Fira Code mono. Removed Instrument Serif; `.font-display` now uses Outfit heavier weight + tighter tracking.
4. Odoo-style app launcher with 47 colorful gradient tiles in 11 categories, matching the docs' vocabulary plus the ERPNext-real modules the docs skip (Assets, Subcontracting, Maintenance) plus HR.
5. **Next.js bumped from 15.1.6 → 16.2.11** to fix CVE-2025-66478. Turbopack is now the default dev bundler; boot is <400ms. Tsconfig was auto-migrated by Next (jsx=react-jsx, plus new `.next/dev/types/**` include). No source-code changes needed.
6. `.env.local` `NEXT_PUBLIC_ZIVVY_DEV_MOCK` **flipped to 0** — auth-gated routes now correctly redirect guests to `/login?redirect-to=<original>`. Keep this off; only flip to 1 for local visual preview when unable to sign in.

### 18.1 Category taxonomy (11 categories, 47 tiles)

| Category | Tiles |
|---|---|
| **Workspace** | Dashboard, Messages |
| **Sales & CRM** | CRM, Customers, Quotations, Sales orders, Invoices, Deliveries, Point of Sale |
| **Procurement** | Suppliers, Purchase orders, Purchase invoices, RFQs |
| **Stock** | Items, Warehouses, Stock entries, Reorder, Barcode |
| **Accounting** | Accounting, Payments, Journal entries, Reports |
| **People (HR)** | Employees, Time off, Attendance, Payroll, Expenses, Onboarding — served by hrms app |
| **Manufacturing** | BOMs, Work orders, Job cards, Subcontracting, Quality |
| **Assets** | Assets, Maintenance, Movements |
| **Projects** | Projects, Tasks, Timesheets |
| **Support** | Tickets, Issues, Warranty, SLAs |
| **Setup** | Team, Billing, Settings, Help |

Every launcher tile links to a route that resolves via [`lib/doctype-slugs.ts`](lib/doctype-slugs.ts) → real Frappe doctype (37 slug→doctype mappings today). Missing slugs → AutoList's "Doctype metadata not available" empty state (retry + sign-in CTAs).

### 18.2 Module sidebars — data in [`components/app/sidebar-nav.ts`](components/app/sidebar-nav.ts)

`MODULE_NAVS` is now a keyed record. The `AppSidebar` component reads `usePathname()` and calls `navForPath(pathname)` to pick which nav to render. `ALIAS` handles `/billing` and `/help` → Setup sidebar; `/messages` → Workspace sidebar.

13 module navs: dashboard, sales, crm, pos, purchases, stock, finance, hr, projects, manufacturing, quality, assets, support, settings.

### 18.3 Launcher split from shell

- `app/(launcher)/layout.tsx` — auth check + `TooltipProvider` + `LauncherTopbar` + full-width `<main>`. No sidebar.
- `app/(launcher)/apps/page.tsx` — hosts `<AppLauncher />`.
- `components/app/launcher-topbar.tsx` — logo + tenant chip + Cmd+K + tier badge + avatar dropdown.
- `components/app/app-launcher.tsx` — reads `bootinfo.zivvy` for tier + `blocked_modules`, renders tiles with lock badge and `/billing` route when locked.
- `app/(app)/apps/page.tsx` — **deleted** (moved to launcher group).

Route group precedence: nothing routes to both `(launcher)/apps` and `(app)/apps` — Next.js resolves them by folder segments only, not by group.

### 18.4 Single-segment routes

Added for modules whose primary landing page is at `/<slug>` instead of `/<module>/<doctype>`:

- `app/(app)/assets/page.tsx` → `<AutoList doctype="Asset" basePath="/assets" title="Assets" />`
- `app/(app)/projects/page.tsx` → `<AutoList doctype="Project" basePath="/projects" title="Projects" />`
- `app/(app)/quality/page.tsx` → `<AutoList doctype="Quality Inspection" basePath="/quality" title="Quality inspections" />`

### 18.5 Verified routes

16 routes confirmed HTTP 200 with DEV_MOCK on (session mocked). With DEV_MOCK off, `/apps`, `/dashboard`, and every `(app)/*` route correctly 307 → `/login?redirect-to=<original>`. Public routes (`/`, `/pricing`, `/features`, `/contact`, `/login`, legal, `/sitemap.xml`, `/robots.txt`) continue to return 200.

### 18.6 Real-Frappe test harness

DEV_MOCK is off. To test AutoList / AutoForm against production `zivvy.xyz` from localhost:

1. Sign in at https://zivvy.xyz/login in the same browser.
2. Open DevTools → Application → Cookies → `https://zivvy.xyz`. Copy the value of `sid`.
3. Same DevTools panel → Cookies → `http://localhost:3000`. Add a cookie: `Name=sid`, `Value=<paste from step 2>`, `Path=/`, no domain restriction.
4. Reload http://localhost:3000/dashboard. Server-side `boot-server.ts` reads the sid, forwards it to Frappe via the `next.config.mjs` rewrites, and `bootinfo.zivvy` populates with real tenant data.
5. AutoList (e.g. `/sales/invoices`, `/stock/items`) should render live rows. AutoForm should show real record data.

Localhost cookies flow through Next.js rewrites as `Cookie:` headers, so as long as `sid` is on the localhost:3000 domain, the proxy delivers it to zivvy.xyz. Same-origin trickery — no CORS involved.

**Do not commit your sid cookie anywhere.** It's a full session credential.

### 18.7 Warts / not fixed

- **`shadcn add` still overwrites `button.tsx`** — the `polished` variant needs re-adding after every CLI touch. Consider a wrapper `PolishedButton` in `components/app/` that always applies the styling regardless of what shadcn does.
- **Next 16 changed tsconfig auto-migration** — added `.next/dev/types/**` to `include`. This is fine, just noting it.
- **Turbopack is default** in Next 16 dev — much faster (310ms boot vs 4.7s on Webpack). If you hit any Turbopack-specific bug, drop back with `next dev --webpack`.
- HR / POS / Assets / Support doctypes will only show real data when `hrms` (for HR) is installed on the site — POS / Assets / Support / Subcontracting are ERPNext core and should work immediately once signed in.
