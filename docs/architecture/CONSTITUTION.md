# Zivvy Architecture Constitution

This document defines the rules that should prevent Zivvy from becoming a
thin, fragile ERPNext skin. These rules are deployment-blocking once CI is
fully wired.

## Product Identity

Zivvy is a modern business operations platform. ERPNext/Frappe provides ERP
depth, but it does not define the product experience.

## Non-Negotiable Rules

1. **No raw DocType UX as the product.**
   - Every ERPNext capability must be exposed through a Zivvy module spec.
   - Users see Zivvy language, not ERPNext internals, unless they are in an
     explicit admin/developer context.

2. **No direct Frappe calls from product UI for new features.**
   - New product surfaces call `apps/api` or typed Zivvy clients.
   - Existing direct calls are legacy and must be wrapped during module work.

3. **Every module starts with UX.**
   - A module requires a target user, primary job, primary CTA, empty state,
     core routes, permissions, events, integrations, AI opportunities, and
     smoke tests before implementation.

4. **Every integration is observable and reversible.**
   - Required: connection state, credential owner, scopes, field mapping, test
     sync, logs, retries, idempotency, rate-limit handling, disable/disconnect.

5. **Every public API has a schema, docs, examples, and tests.**
   - API behavior must be represented in shared schemas and developer docs.

6. **Every important business event uses the event envelope.**
   - Events flow through a durable outbox/queue before webhooks or integrations.
   - Webhook delivery must be retryable and idempotent.

7. **The ERP kernel is replaceable by contract.**
   - `apps/erp-kernel` owns deep ERP behavior.
   - Product code depends on Zivvy contracts, not Frappe implementation details.

8. **Performance-sensitive screens use read models.**
   - Dashboards, global search, analytics, and large lists must not query large
     ERP tables synchronously on every page load.

9. **Permissions are product-level first, ERP-level second.**
   - Zivvy roles define user intent.
   - ERP/Frappe roles are an implementation mapping.

10. **No module ships without launch QA.**
    - Required checks: create/read/update/delete, search, filter, sort,
      pagination, import/export where applicable, permissions, empty/loading/
      error states, mobile, keyboard navigation, and core integration events.

## Architecture Layers

```text
apps/web
  Zivvy UX, app shell, marketing, onboarding, modules

apps/api
  Public API, integration gateway, stable contracts, rate limits

apps/docs
  Developer docs generated from contracts and curated guides

apps/erp-kernel
  ERPNext/Frappe overlay: ERP records, deep domain workflows, migrations

packages/*
  Shared contracts: UI, schemas, events, registry, API client
```

## Definition Of Done For A Module

- Module spec exists in `@zivvy/module-registry`.
- UX walkthrough exists in `docs/modules`.
- Backend contract exists or legacy Frappe access is explicitly marked.
- Events are listed and envelope-compatible.
- Integrations are listed with sync behavior.
- Smoke tests are listed before implementation.
- Empty, loading, error, and mobile states are designed.
- No new raw DocType page is introduced as primary UX.

## Current Strategic Choice

Expose all ERPNext apps, but expose them as Zivvy-designed modules. The goal is
ERPNext breadth with Zivvy quality.
