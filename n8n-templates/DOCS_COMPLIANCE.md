# Docs compliance checklist

Checked while authoring these templates (2026-07-25).

## n8n

| Doc | Applied |
|-----|---------|
| [Export / import](https://docs.n8n.io/build/manage-workflows/export-and-import/) | Workflows are plain JSON; no credential secrets; credential stubs by name/id only |
| [Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) | `typeVersion: 2`, `httpMethod: POST`, `rawBody: true`, Production URL after publish, `responseMode: onReceived` for fast 2xx |
| [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) | `typeVersion: 4.2`, Header Auth Bearer, timeout 10s, `neverError` on enrich |
| [IF](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/) | `typeVersion: 2.2` condition groups |
| [Code](https://docs.n8n.io/code/code-node/) | `typeVersion: 2`, `require('crypto')` for HMAC |
| [Stop and Error](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/) | Invalid signature path |
| Community pattern ([Slack verify template #2009](https://n8n.io/workflows/2009)) | Separate verify → branch → error; adapted to Zivvy header |

## Zivvy

| Source | Applied |
|--------|---------|
| `zivvy_brand/api/webhooks.py` `_deliver_single` | `X-Zivvy-Signature: sha256=<hmac(body)>` |
| Same file `EVENT_MAP` / `DOCTYPE_TO_SLUG` | Only real verbs + slugs |
| `emit_event` payload shape | `{ event, resource, data{name,doctype,…}, timestamp }` |
| Marketing webhooks page | Event catalog inspiration; **signature snippet diverges** — templates follow code |
| `api.zivvy.xyz` / `integrate.zivvy.xyz` | Enrich via `GET /v1/:resource/:id` + Bearer `zk_live_` |

## Intentionally not used

- Marketing `t=…, v1=…` signature format (not emitted by current backend)
- Events like `*.paid` / `*.approved` / `*.converted` until backend emits them
