# Zivvy multi-tenancy (Phase 1)

**Model:** company-per-tenant isolation on a single Railway site (`zivvy.xyz`).

**Not yet:** site-per-tenant benches (Phase 2).

## Control plane

| DocType | Role |
| --- | --- |
| **Zivvy Tenant** | One row per customer org: `slug`, `status`, `plan`, `seat_limit`, `seats_used`, `company`, `owner_user`, Polar IDs, `datacenter` |
| **User.zivvy_tenant** | Link from each Desk user to their tenant |
| **Company** | One ERPNext Company per tenant (Business plan may add more *within* the tenant later) |

Plan gating reads **`Zivvy Tenant.plan`** for the logged-in user (not only the site-wide `Zivvy Subscription` Single). The Single remains an ops/legacy fallback.

## Signup flow

1. Validate email, password path, required datacenter (`india` / `eu` / `us`).
2. Create enabled **System User** with Free Desk roles (Sales / Purchase / Item — not System Manager).
3. Create **Zivvy Tenant** + unique `slug` (from company name or email local-part).
4. Create dedicated **Company** (currency/country from datacenter preference).
5. Bind user → tenant; **User Permission** `Company` + user default `company`.
6. Redirect after login → `/app`.

Optional signup field: **Company** (`company_name`).

## Session / routing

Resolution order for `frappe.local.zivvy_tenant`:

1. Host subdomain `slug.zivvy.xyz` (when wildcard DNS is live)
2. Else `User.zivvy_tenant` for the session user

Desk `bootinfo.zivvy.tenant` exposes slug/plan/company for UI. Billing + Polar checkout metadata include `zivvy_tenant`.

Seat caps count **enabled System Users in that tenant only**.

## Isolation checklist

| Surface | Enforcement |
| --- | --- |
| Customer / Lead / Item / Contact / … | Custom field `zivvy_tenant` + `permission_query_conditions` / `has_permission` (ERPNext Customer has **no** Company field) |
| Sales Order / Invoice / company-linked docs | User Permission on Company with `applicable_for` per DocType (never `apply_to_all_doctypes` — that blocked Customer when `represents_company` is NULL) |
| Company list / form | `permission_query_conditions` + `has_permission` |
| User list | Same-tenant only (ops System Manager / Administrator see all) |
| Zivvy Tenant | Own tenant only (ops see all) |

Ops account (founder `sarwagyasingh69@gmail.com` + Administrator) retains **System Manager** and can see all tenants.

## Demo / migrate

| Email | Tenant | Plan |
| --- | --- | --- |
| `sarwagyasingh69@gmail.com` | Sarwagya | business (ops) |
| `demo.free@zivvy.xyz` | Demo Free | free |
| `demo.pro@zivvy.xyz` | Demo Pro | pro |
| `demo.business@zivvy.xyz` | Demo Business | business |

```bash
bench --site zivvy.xyz migrate
bench --site zivvy.xyz execute zivvy_brand.tenancy.migrate_existing.migrate_existing_tenants
bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts
```

## Phase 2 (documented, not built)

Full **site-per-tenant** (separate Frappe site / DB schema per customer) on multi-bench or multi-site Railway. Requires wildcard site routing, per-tenant `site_config`, and provisioning automation beyond Company isolation.

## Smoke notes

See [SMOKE_REPORT.md](SMOKE_REPORT.md) — verify two tenants cannot see each other's Customer; `/app` works; Billing shows per-tenant plan.
