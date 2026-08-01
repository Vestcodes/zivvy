# Zivvy smoke report — multi-tenant (Phase 1)

**Verified 2026-07-23** on Vestcodes Railway / `zivvy.xyz` (SSH sync, no image redeploy).

## Tenancy model
- **Phase 1:** company-per-tenant on site `zivvy.xyz` (`Zivvy Tenant` → Company + User Permissions + `zivvy_tenant` on global masters)
- **Phase 2:** site-per-tenant — not built (see TENANCY.md / DEPLOY.md)

## Production state
| Check | Result |
| --- | --- |
| DocType `Zivvy Tenant` | Present |
| Tenants | `sarwagya`, `demo-free`, `demo-pro`, `demo-business` each with own Company |
| `User.zivvy_tenant` | Present |
| Warehouse Type `Transit` | Seeded (needed for Company create) |
| `/app` for demo.free | HTTP 200 Desk |
| Billing `get_my_plan` | Per-tenant: free→`demo-free`, pro→`demo-pro` |
| Company list | Free sees only Demo Free; Pro only Demo Pro |
| Customer create + list | Isolated — Free cannot see Pro customers and vice versa |
| Customer stamp | `zivvy_tenant` set on insert; backfill from owner |

## Isolation notes
ERPNext **Customer** has no Company link, so Company User Permissions alone do **not** filter Customers. Phase 1 adds read-only Link `zivvy_tenant` on Customer/Lead/Opportunity/Contact/Address/Supplier/Item plus PQC/`has_permission` hooks.

## Deploy notes
- Synced via SSH into `apps/zivvy_brand` as `frappe`; `chown frappe`; clear-cache; supervisord gunicorn restart.
- Avoid full Railway image redeploy when possible.
- Do not leave root-owned log files under the bench.

Passwords: never printed — Railway `DEMO_*_PASSWORD` / `.demo-credentials.local` only.
