# Zivvy Integration Architecture

Integrations are a first-class product surface, not one-off scripts.

## Connection Lifecycle

```text
Discover app
  -> connect credentials
  -> choose workspace
  -> select sync direction
  -> map fields
  -> run test sync
  -> activate
  -> monitor health
  -> retry failures
  -> disable/disconnect safely
```

## Required Concepts

- Provider: external app, such as Slack or Shopify.
- Connection: one tenant's authenticated link to a provider.
- Scope: what the connection can access.
- Mapping: how external fields map to Zivvy concepts.
- Sync run: one scheduled/manual sync attempt.
- Webhook delivery: inbound or outbound event notification.
- Integration log: visible audit trail for users and support.

## Runtime Flow

```text
inbound webhook / scheduled sync
  -> validate signature or credentials
  -> normalize payload
  -> idempotency check
  -> write raw integration event
  -> transform to Zivvy schema
  -> call API or ERP kernel adapter
  -> emit Zivvy event
  -> update sync log
  -> retry or surface failure
```

## Build vs Buy

Use native integrations for critical money and workflow systems:

- Stripe / Polar
- Plaid / GoCardless
- Shopify / Amazon / Unicommerce
- Google Workspace / Microsoft 365
- Slack / Teams
- HubSpot / Salesforce

Use an embedded integration platform for breadth:

- Nango for OAuth, token refresh, sync scaffolding, and provider templates.
- Pipedream for long-tail actions, triggers, and agent tools.
- Merge or Apideck when a unified API is cheaper than maintaining many provider
  models, especially accounting/CRM/HRIS/file storage.

## Integration Quality Bar

No integration ships without:

- connection status
- credential owner
- scopes
- sync direction
- field mapping
- test sync
- logs
- retries
- idempotency
- disconnect
- user-visible failure explanation
- internal support trace

## UI Requirements

Every integration card must show:

- connected/disconnected/degraded state
- last sync
- next sync
- failed runs
- affected records
- manage button
- disconnect button

Every integration detail page must show:

- overview
- credentials/scopes
- field mapping
- sync runs
- webhook events
- logs
- settings
