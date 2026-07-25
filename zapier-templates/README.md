# Zivvy ↔ Zapier templates

Same coverage as [`n8n-templates/`](../n8n-templates): **10 main areas**, production event verbs, webhook + REST.

Two ways to use them (Zapier docs–compliant):

| Path | Who it's for | Docs |
|------|--------------|------|
| **A. Catch Hook recipes** (`recipes/`) | Any Zapier plan, no CLI | [Webhooks by Zapier](https://help.zapier.com/hc/en-us/articles/8496288691469) |
| **B. Platform CLI integration** (`integration/`) | Private/public Zivvy app with REST Hooks | [CLI overview](https://docs.zapier.com/integrations/build-cli/overview), [Hook triggers](https://docs.zapier.com/integrations/build/cli-hook-trigger) |

## Areas

| # | Area | Recipe | CLI trigger key |
|---|------|--------|-----------------|
| 01 | CRM | `recipes/01-crm-lead-created.md` | `crm_lead_created` |
| 02 | Sales | `recipes/02-sales-order-submitted.md` | `sales_order_submitted` |
| 03 | Billing & Accounting | `recipes/03-billing-invoice.md` | `billing_invoice` |
| 04 | Purchasing | `recipes/04-purchasing-po.md` | `purchasing_po` |
| 05 | Stock | `recipes/05-stock-movement.md` | `stock_movement` |
| 06 | Banking | `recipes/06-banking-transaction.md` | `banking_transaction` |
| 07 | HR & People | `recipes/07-hr-people.md` | `hr_people` |
| 08 | Projects | `recipes/08-projects-tasks.md` | `projects_tasks` |
| 09 | Manufacturing | `recipes/09-manufacturing.md` | `manufacturing` |
| 10 | Support | `recipes/10-support-ticket.md` | `support_ticket` |

## Path A — Catch Hook (fastest)

1. Open the area `.md` under `recipes/`
2. Create Zap: **Webhooks by Zapier → Catch Hook**
3. Register the Catch URL in Zivvy (`POST https://integrate.zivvy.xyz/v1/webhooks` or Settings → Developer)
4. Add **Code by Zapier** using `_shared-filter-code.js`
5. Add Slack / Sheets / Email action

`zk_live_` key from Settings → Developer. Auth header: `Authorization: Bearer zk_live_…` (also send `X-API-Key` if your gateway requires OpenAPI style).

## Path B — Platform CLI (native triggers)

```bash
cd zapier-templates/integration
npm install
# CLI binary is `zapier` (from devDependency zapier-platform-cli), not `zapier-platform`.
npx zapier login
npx zapier register "Zivvy"
npx zapier validate
npm test
npx zapier push
```

Then in Zapier: use private app **Zivvy** → pick e.g. **New Lead** / **Sales Order Submitted**.

Subscribe/unsubscribe calls:

- `POST https://integrate.zivvy.xyz/v1/webhooks` with `bundle.targetUrl`
- `DELETE https://integrate.zivvy.xyz/v1/webhooks/:id`

Creates included: Lead, Item, Employee, Task.

## Signature notes

Production signs `X-Zivvy-Signature: sha256=<hmac(body)>` (`webhooks.py`).

- **Catch Hook / REST Hook to hooks.zapier.com:** Zapier accepts the POST; URL secrecy is the trust boundary (standard for Zapier webhooks). Optional Code step `_shared-hmac-code.js` can attempt verify if you map headers + rebuild compact JSON.
- **Custom HTTPS endpoint:** verify HMAC like n8n templates.

## Event verbs (real)

`created | updated | deleted | submitted | cancelled` only — no fictional `*.paid` / `*.approved` until the backend emits them.

## Regenerate

```bash
node zapier-templates/scripts/generate.mjs
```
