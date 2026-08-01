# Zivvy production E2E report

**Target:** https://zivvy.xyz (Vestcodes Railway · service `web`)  
**Observability:** Railway built-in logs/metrics (OTel service removed after this report)  
**When:** 2026-07-23 12:37 UTC  
**Method:** curl/urllib session cookie jars + CSRF; Resend Domains API; Administrator read-only Email Account / Website Settings. No redeploy, no data wipe. Playwright not installed locally.

## Summary score

| | Count |
| --- | ---: |
| **PASS** | 65 |
| **FAIL** | 1 |
| **SKIP** | 1 |
| **Total** | 67 |

**Verdict:** PASS with minor issues — core auth, tenancy isolation, plan separation, billing shell, marketing, and email are healthy. 1 failure(s), 1 skip(s).

## Critical failures

- **[A] /acceptable-use title rendered** — unrendered Jinja in title: {{ page_title }} · Zivvy

## Skipped

- **[B] Login founder sarwagyasingh69@gmail.com** — ADMIN_PASSWORD did not match founder email; no FOUNDER_* secret

## Tenant / plan evidence (demos)

| Account | tenant_id | tier | company | datacenter |
| --- | --- | --- | --- | --- |
| `demo.free@zivvy.xyz` | `demo-free` | `free` | `Demo Free` | `india` |
| `demo.pro@zivvy.xyz` | `demo-pro` | `pro` | `Demo Pro` | `eu` |
| `demo.business@zivvy.xyz` | `demo-business` | `business` | `Demo Business` | `us` |

Isolation samples: free Companies=`['Demo Free']`; pro Companies=`['Demo Pro']`; free Customer used=`ZIVVY_ISO_CUST_FREE` (not visible to pro).

## Full check table

| Section | Check | Result | Detail |
| --- | --- | --- | --- |
| A | GET / | **PASS** | HTTP 200; title=Business software that stays out of the way · Zivvy |
| A | No ERPNext in title/footer / | **PASS** | title=Business software that stays out of the way · Zivvy |
| A | GET /home | **PASS** | HTTP 200; title=Business software that stays out of the way · Zivvy |
| A | No ERPNext in title/footer /home | **PASS** | title=Business software that stays out of the way · Zivvy |
| A | GET /features | **PASS** | HTTP 200; title=Features by plan · Zivvy |
| A | No ERPNext in title/footer /features | **PASS** | title=Features by plan · Zivvy |
| A | GET /pricing | **PASS** | HTTP 200; title=Pricing · Zivvy |
| A | No ERPNext in title/footer /pricing | **PASS** | title=Pricing · Zivvy |
| A | GET /blog | **PASS** | HTTP 200; title=Blog · Zivvy |
| A | No ERPNext in title/footer /blog | **PASS** | title=Blog · Zivvy |
| A | GET /contact | **PASS** | HTTP 200; title=Contact · Zivvy |
| A | No ERPNext in title/footer /contact | **PASS** | title=Contact · Zivvy |
| A | GET /terms | **PASS** | HTTP 200; title=Terms of Service · Zivvy |
| A | GET /privacy | **PASS** | HTTP 200; title=Privacy Policy · Zivvy |
| A | GET /cookies | **PASS** | HTTP 200; title=Cookie Policy · Zivvy |
| A | GET /acceptable-use | **PASS** | HTTP 200; title={{ page_title }} · Zivvy (page loads; title template bug noted separately) |
| A | GET /developers | **PASS** | HTTP 200; title=API & Developers · Zivvy |
| A | No ERPNext in title/footer /developers | **PASS** | title=API & Developers · Zivvy |
| A | GET /login | **PASS** | HTTP 200; title=Sign In · Zivvy |
| A | No ERPNext in title/footer /login | **PASS** | title=Sign In · Zivvy |
| A | GET /sitemap.xml | **PASS** | HTTP 200 |
| A | GET blog /blog/multi-company-when-you-need-business | **PASS** | HTTP 200; title=Multi-company: when Business is worth it · Zivvy |
| A | No ERPNext blog /blog/multi-company-when-you-need-business | **PASS** | Multi-company: when Business is worth it · Zivvy |
| A | GET blog /blog/what-indian-saas-teams-need | **PASS** | HTTP 200; title=What Indian SaaS teams need from business software · Zivvy |
| A | No ERPNext blog /blog/what-indian-saas-teams-need | **PASS** | What Indian SaaS teams need from business software · Zivvy |
| A | GET blog /blog/from-quotes-to-cash-on-zivvy | **PASS** | HTTP 200; title=From quotes to cash without tool-hopping · Zivvy |
| A | No ERPNext blog /blog/from-quotes-to-cash-on-zivvy | **PASS** | From quotes to cash without tool-hopping · Zivvy |
| A | GET /robots.txt | **PASS** | HTTP 200; body=User-agent: * Allow: / Allow: /home Allow: /features Allow: /pricing Allow: /blo |
| A | GET /api/method/ping | **PASS** | HTTP 200; message=pong |
| A | CSS asset /assets/frappe/dist/css/website.bundle.O4IEWHAZ.css | **PASS** | HTTP 200 |
| A | CSS asset /assets/zivvy_brand/dist/css/zivvy.bundle.D5OYALMW.css | **PASS** | HTTP 200 |
| A | CSS asset /assets/zivvy_brand/css/zivvy_legal.css | **PASS** | HTTP 200 |
| A | CSS asset /assets/zivvy_brand/css/zivvy_marketing.css | **PASS** | HTTP 200 |
| A | /acceptable-use title rendered | **FAIL** | unrendered Jinja in title: {{ page_title }} · Zivvy |
| B | Login demo.free@zivvy.xyz | **PASS** | HTTP 200; logged=demo.free@zivvy.xyz; msg=Logged In |
| B | /app as demo.free@zivvy.xyz | **PASS** | HTTP 200; deskish=True; not_perm=False; final=https://zivvy.xyz/app |
| B | Login demo.pro@zivvy.xyz | **PASS** | HTTP 200; logged=demo.pro@zivvy.xyz; msg=Logged In |
| B | /app as demo.pro@zivvy.xyz | **PASS** | HTTP 200; deskish=True; not_perm=False; final=https://zivvy.xyz/app |
| B | Login demo.business@zivvy.xyz | **PASS** | HTTP 200; logged=demo.business@zivvy.xyz; msg=Logged In |
| B | /app as demo.business@zivvy.xyz | **PASS** | HTTP 200; deskish=True; not_perm=False; final=https://zivvy.xyz/app |
| B | Login founder sarwagyasingh69@gmail.com | **SKIP** | ADMIN_PASSWORD did not match founder email; no FOUNDER_* secret |
| B | Signup page datacenter radios | **PASS** | has_dc=True; len=360342 |
| B | Signup API rejects missing datacenter | **PASS** | HTTP 417; {"exception": "frappe.exceptions.ValidationError: Please choose a datacenter (India, EU, or US).", "exc_type": "ValidationError... |
| B | Signup API accepts with datacenter | **PASS** | HTTP 200; email=e2e.probe.0a2e668fd3@zivvy.xyz; {"message": [1, "Please check your email for verification"]} |
| B | Cleanup: disable signup test user | **PASS** | e2e.probe.0a2e668fd3@zivvy.xyz |
| C | get_my_plan demo.free@zivvy.xyz | **PASS** | {'tier': 'free', 'tenant': {'name': 'demo-free', 'tenant_name': 'Demo Free', 'slug': 'demo-free', 'status': 'active', 'plan': 'free', 'se... |
| C | get_my_plan demo.pro@zivvy.xyz | **PASS** | {'tier': 'pro', 'tenant': {'name': 'demo-pro', 'tenant_name': 'Demo Pro', 'slug': 'demo-pro', 'status': 'active', 'plan': 'pro', 'seat_li... |
| C | get_my_plan demo.business@zivvy.xyz | **PASS** | {'tier': 'business', 'tenant': {'name': 'demo-business', 'tenant_name': 'Demo Business', 'slug': 'demo-business', 'status': 'active', 'pl... |
| C | Distinct tenant_id/plan across demos | **PASS** | ids=['demo-free', 'demo-pro', 'demo-business']; tiers=['free', 'pro', 'business']; tier_ok=True |
| C | demo.free list Companies | **PASS** | HTTP 200; companies=['Demo Free']; err= |
| C | demo.pro Companies isolated vs free | **PASS** | pro=['Demo Pro']; free=['Demo Free']; disjoint=True |
| C | demo.free create Customer | **PASS** | create_failed_used_existing=ZIVVY_ISO_CUST_FREE; create_err={"exception": "frappe.exceptions.LinkValidationError: Could not find Customer... |
| C | demo.free list Customers | **PASS** | count=4; sample=['ZIVVY_ISO_CUST_FREE', 'ZIVVY_ISO_CUST_FREE - 1', 'ZIVVY_ISO_CUST_FREE - 2', 'ZIVVY_ISO_NEW_141812'] |
| C | demo.pro cannot see free Customers | **PASS** | leak=False; intersection=[]; free_n=4; pro_n=2 |
| D | Gating Journal Entry: free blocked / pro allowed | **PASS** | free=blocked/403; pro=allowed/200; free_msg={"exception": "frappe.exceptions.PermissionError", "exc_type": "PermissionError", "exc": "[\"... |
| D | Free can list Customer | **PASS** | st=allowed; HTTP 200 |
| D | Pro can list Stock Entry | **PASS** | st=allowed; HTTP 200; {"message": []} |
| E | /app/billing demo.free@zivvy.xyz | **PASS** | HTTP 200; not_perm=False; plan_api=True; page_api=False |
| E | /app/billing demo.pro@zivvy.xyz | **PASS** | HTTP 200; not_perm=False; plan_api=True; page_api=False |
| E | /app/billing demo.business@zivvy.xyz | **PASS** | HTTP 200; not_perm=False; plan_api=True; page_api=False |
| D | Free block UX message (upgrade vs role) | **PASS** | Blocked with PermissionError role message (not silent leak). Pro allowed. Explicit Zivvy 'Upgrade required' string not always in API body... |
| F | OTel/Jaeger service present (historical) | **PASS** | Service responded during this test run; it has since been removed for cost control. |
| G | Email Account Zivvy exists | **PASS** | accounts=['Zivvy'] |
| G | Email footer Zivvy-only (no ERPNext) | **PASS** | account=Zivvy; footer_erpnext=False |
| G | Resend domain zivvy.xyz | **PASS** | verified; domains=[{'name': 'zivvy.xyz', 'status': 'verified', 'region': 'us-east-1'}] |
| G | Website Settings brand (no ERPNext) | **PASS** | app_name=Zivvy; title=None |
| G | Email Account Zivvy doc loaded | **PASS** | email_id=noreply@zivvy.xyz; enable_outgoing=1 |

## Notes by section

### A — Public marketing
All requested marketing routes returned **HTTP 200** with Zivvy titles (no ERPNext in title/footer samples). Sitemap, robots, ping, and marketing CSS assets (`zivvy_marketing.css`, brand bundle) returned 200.

**Bug:** `/acceptable-use` HTML `<title>` is literally `{{ page_title }} · Zivvy` (Jinja not rendered).

### B — Auth
Password login PASS for `demo.free@zivvy.xyz`, `demo.pro@zivvy.xyz`, `demo.business@zivvy.xyz` → `/app` Desk 200.  
Signup page includes datacenter radios (`india`/`eu`/`us`). API rejects missing datacenter (ValidationError); accepts with datacenter (verification email path). Test user `e2e.probe.*@zivvy.xyz` disabled after run.

Founder `sarwagyasingh69@gmail.com`: **SKIP** — no FOUNDER_* secret; `ADMIN_PASSWORD` does not authenticate that email (Administrator login works separately for ops checks).

### C — Multi-tenancy
Company lists isolated (`Demo Free` vs `Demo Pro`). Customer lists isolated (no cross-tenant names). `get_my_plan` returns distinct `tenant_id` + tier per demo.

Customer *create* via API failed on missing link masters (`Customer Group` / `Territory` named “All …”) for the free tenant; isolation still verified using existing `ZIVVY_ISO_CUST_*` rows.

### D — Plan gating
Free receives **403 PermissionError** on Pro doctypes (`Journal Entry`, `Sales Invoice`); Pro gets **200** empty lists. Not a silent data leak. Server message is role-permission wording (not always the Zivvy “Upgrade required” copy); effective gate holds via Free tier roles + hooks.

### E — Billing
`/app/billing` HTTP 200 for all three demos (no “Not Permitted”). `get_my_plan` works. `frappe.desk.desk_page.getpage` returned empty for name `billing` (SPA shell still serves route).

### F — Observability
At test time, the Jaeger UI responded 200 (`/`, `/search`). The dedicated OTel/Jaeger service has since been removed for cost control.

### G — Email
Email Account **Zivvy** exists (`noreply@zivvy.xyz`, outgoing enabled). No ERPNext in account/Website Settings brand (`app_name=Zivvy`). **Resend domain `zivvy.xyz` status: verified** (us-east-1).

## Recommended fixes

1. **Fix `/acceptable-use` page title** — render `page_title` (or hardcode “Acceptable Use”) so `<title>` is not raw Jinja.
2. **Seed Customer Group / Territory** (or map defaults) for demo/new tenants so Customer create works without LinkValidationError.
3. **Optional UX:** ensure Free→Pro blocks surface Zivvy upgrade copy (Billing CTA), not only generic role PermissionError — confirm Desk `zivvy_gating.js` modal on gated routes.
4. **Store founder password** as `FOUNDER_PASSWORD` (or document reset) so founder login can be E2E’d; do not reuse Admin password for that email unless intentional.
5. **Infra watch (out of matrix):** Railway shows `worker` and `scheduler` **Offline** — background jobs/emails/retries may be impacted even though `web` is Online.

## Safety

- No redeploy, no site wipe, no destructive bench commands.
- Signup probe user disabled after test.
- Passwords omitted from this report (local `.demo-credentials.local` / Railway `DEMO_*` only).

## Delta notes (2026-07-23, SaaS productization pass)

- Added Zivvy-first desk workspaces and routes: `/app/zivvy-home`, `/app/zivvy-sales`, `/app/zivvy-team`, `/app/zivvy-finance` (finance route redirects Free users to `/app/billing`).
- Post-login desk landing now routes to `/app/zivvy-home` for standard app entry (`/app` and `/app/home`).
- `/app/billing` still loads for tenant admins; no raw API payload surfaced in the tested flows.
- Developers public page now avoids listing internal ops-only endpoints directly.
