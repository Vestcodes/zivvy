# Docs compliance — Zapier templates

Checked 2026-07-25.

## Zapier

| Doc | Applied |
|-----|---------|
| [CLI overview](https://docs.zapier.com/integrations/build-cli/overview) | `integration/` Platform CLI app shape (`index.js`, triggers, creates, auth) |
| [Hook trigger](https://docs.zapier.com/integrations/build/cli-hook-trigger) | `type: 'hook'`, `performSubscribe` / `performUnsubscribe` / `perform` returns **array**, `performList` for editor samples |
| [API Key auth](https://docs.zapier.com/integrations/build/apikeyauth) | Custom fields + test call to `/v1/webhooks/events` |
| [Return types](https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#return-types) | Hook `perform` always returns `[row]` |
| [Webhooks by Zapier](https://help.zapier.com/hc/en-us/articles/8496288691469) | Catch Hook recipes for any plan |
| [Code by Zapier](https://help.zapier.com/hc/en-us/articles/8496257774221) | Shared filter / HMAC scripts |

## Zivvy

| Source | Applied |
|--------|---------|
| `POST https://integrate.zivvy.xyz/v1/webhooks` OpenAPI `CreateWebhookDto` | `url`, `events[]`, optional `secret`, `label` |
| Auth | Bearer `zk_live_` + `X-API-Key` dual header |
| `webhooks.py` EVENT_MAP | Real verbs only |
| Payload | `{ event, resource, data, timestamp }` |

## Parity with n8n-templates

Same 10 areas and event lists as `n8n-templates/manifest.json`.
