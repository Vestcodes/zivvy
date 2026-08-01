# Zivvy ↔ n8n templates

Importable n8n workflows for each main Zivvy area. Built against **current n8n docs** and **production** Zivvy webhook signing (not marketing-only snippets).

## Workflows

| # | Area | File | Subscribe events |
|---|------|------|------------------|
| 01 | CRM | `workflows/01-crm-lead-created.json` | `leads.created` |
| 02 | Sales | `workflows/02-sales-order-submitted.json` | `sales-orders.submitted` |
| 03 | Billing | `workflows/03-billing-invoice-lifecycle.json` | `sales-invoices.*`, `payment-entries.submitted` |
| 04 | Purchasing | `workflows/04-purchasing-po-submitted.json` | `purchase-orders.submitted`, `purchase-receipts.submitted` |
| 05 | Stock | `workflows/05-stock-movement.json` | `stock-entries.submitted`, `items.created`, `delivery-notes.submitted` |
| 06 | Banking | `workflows/06-banking-transaction.json` | `bank-transactions.created/updated` |
| 07 | HR | `workflows/07-hr-leave-and-expense.json` | leave / expense / employee create+update+submit |
| 08 | Projects | `workflows/08-projects-tasks.json` | tasks, timesheets, projects |
| 09 | Manufacturing | `workflows/09-manufacturing-work-order.json` | work orders, BOMs, job cards |
| 10 | Support | `workflows/10-support-ticket.json` | `support-tickets.*`, `issues.*` |

Regenerate: `node scripts/generate-workflows.mjs`

## Import (n8n)

Per [Export and import](https://docs.n8n.io/build/manage-workflows/export-and-import/):

1. n8n Editor → **⋯** → **Import from File**
2. Pick a `workflows/*.json`
3. **Publish** the workflow (required for the Production Webhook URL)
4. Open **Zivvy Webhook** node → copy **Production URL**

## Configure

### n8n variables

| Variable | Purpose |
|----------|---------|
| `ZIVVY_WEBHOOK_SECRET` | Same secret as the Zivvy webhook |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook (optional but used by templates) |

### n8n credential

Create **Header Auth** named `Zivvy API (Bearer zk_live_…)`:

- Header name: `Authorization`
- Header value: `Bearer zk_live_YOUR_KEY`

([HTTP Request credentials](https://docs.n8n.io/integrations/builtin/credentials/httprequest/))

### Zivvy

1. Settings → Developer → create API key (`zk_live_…`)
2. Create webhook → Production n8n URL
3. Subscribe to the events listed in that workflow’s yellow sticky (or `resource.*`)

## Shared flow (every template)

```
Webhook (POST, rawBody) 
  → Code: verify HMAC 
  → IF signature ok 
      → IF event match → Build Slack text → POST Slack
                     ↘ Enrich GET /v1/:resource/:name (best-effort)
      ↘ Stop and Error (bad signature)
```

Aligned with:

- [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) — `rawBody`, Production URL after publish, ack via `responseMode: onReceived`
- [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) — Bearer via Header Auth
- [Code node](https://docs.n8n.io/code/code-node/) — `crypto.createHmac`
- [IF node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/)

## Signature (production truth)

From `zivvy_brand/api/webhooks.py`:

```
X-Zivvy-Signature: sha256=<hex>
signed payload     = raw JSON body bytes
algorithm          = HMAC-SHA256(secret, body)
```

The marketing page’s Stripe-style `t=…, v1=…` + timestamp envelope is **not** what production sends today. These templates verify the real header.

Smoke-test locally:

```bash
node scripts/verify-hmac.mjs
```

## Event verbs that actually emit

Production `EVENT_MAP` only emits:

`created` · `updated` · `deleted` · `submitted` · `cancelled`

Templates do **not** subscribe to fictional verbs like `leads.converted` / `leave-applications.approved` / `sales-invoices.paid` until the backend emits them. For “approved”, use `*.updated` and filter on `data.status`.

## Make one work end-to-end

1. Import `01-crm-lead-created.json`
2. Set `ZIVVY_WEBHOOK_SECRET` + Slack URL + API credential
3. Publish → copy Production URL
4. In Zivvy, webhook on that URL for `leads.created`
5. Create a Lead in Zivvy → Slack message within seconds
6. Check n8n **Executions** if silent (signature / event filter / Slack URL)
