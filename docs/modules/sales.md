# Sales Module Spec

Sales is the gold-standard Zivvy module. Every later module should match this
level of product planning before implementation. The goal is not to expose ERPNext
Sales DocTypes; the goal is to let an operator move revenue work forward without
learning ERP internals.

## Product Intent

Help a founder, sales operator, or finance operator move from customer context to
quote, order, invoice, payment, and follow-up in one workspace.

## Product Principle

The user should always know:

- Who the customer is.
- What money is expected.
- What has been promised.
- What is blocking the next step.
- What action Zivvy recommends.

Raw ERPNext terminology can appear only in admin/developer inspection surfaces.

## Target Users

| User | Goal | Main Fear |
| --- | --- | --- |
| Founder | Know who owes money and what needs action | Cash leakage and operational confusion |
| Sales operator | Create quotes, follow up, and close work | Losing customer context |
| Finance operator | Send invoices, collect payment, reconcile status | Incorrect postings or duplicate invoices |
| Customer success operator | Understand account history before responding | Missing commitments or open issues |

## Primary Job

Move a customer from quote to paid invoice without leaving the workspace.

## Success Metric

A demo user can complete:

```text
customer -> quote -> order -> invoice -> payment -> webhook event
```

without seeing a raw DocType screen, unexplained permission error, stale state,
or failed integration that lacks a retry path.

## Scope

### Must Have

- Sales home with revenue status and next actions.
- Customers list and customer detail.
- Quote, order, invoice, and payment flows.
- Search, filters, saved views, sort, pagination.
- Import/export for customers and invoices.
- Activity timeline across customer, quote, order, invoice, payment, emails, and webhooks.
- Product-level permissions mapped to ERP roles.
- Event emission for important sales lifecycle changes.
- Integration health and delivery logs.
- Mobile review and quick actions.

### Should Have

- Customer duplicate detection.
- Invoice PDF preview and email preview.
- Payment link creation.
- AI customer summary and overdue explanation.
- Bulk owner assignment and tagging.
- Saved automation suggestions.

### Could Have

- Deal pipeline board.
- Quote template designer.
- Customer portal preview.
- Revenue forecast.
- Churn or payment-risk score.

### Not For First Release

- Full CPQ.
- Complex commission accounting.
- Deep territory management.
- Fully custom invoice layout builder.

## Core Routes

| Route | Purpose | Primary CTA |
| --- | --- | --- |
| `/sales` | Module home and revenue command center | Create invoice |
| `/sales/customers` | Customer list, search, import, bulk actions | Add customer |
| `/sales/customers/:id` | Customer record with timeline and related revenue work | Create invoice |
| `/sales/quotations` | Quotes needing approval, follow-up, or conversion | Create quote |
| `/sales/quotations/:id` | Quote preview, approval, send, convert | Send quote |
| `/sales/orders` | Sales orders and fulfillment state | Create order |
| `/sales/orders/:id` | Order commitments, fulfillment, invoice creation | Create invoice |
| `/sales/invoices` | Invoice list, collection state, payment follow-up | Send invoice |
| `/sales/invoices/:id` | Invoice detail, send, pay, PDF, timeline | Create payment link |

## ERP Kernel Mapping

| Zivvy Concept | ERPNext DocType | Zivvy UX Name |
| --- | --- | --- |
| Customer | Customer | Customer |
| Quote | Quotation | Quote |
| Order | Sales Order | Order |
| Invoice | Sales Invoice | Invoice |
| Payment | Payment Entry | Payment |
| Item | Item | Product or service |
| Price | Item Price | Price |
| Tax | Sales Taxes and Charges Template | Tax setup |

## Architecture Boundary

- `apps/web` renders the Sales UX and calls typed Zivvy APIs or clients only.
- `apps/api` owns public/internal Sales contracts, rate limits, auth, validation, and integration orchestration.
- `apps/erp-kernel` owns ERPNext document mutations, migrations, and DocType-specific behavior.
- `packages/schemas` owns request/response validation.
- `packages/events` owns lifecycle event names and envelope shape.
- `packages/module-registry` owns route, feature, integration, and smoke-test metadata.

No new Sales screen should call Frappe directly from the browser.

## Screen Specs

### Sales Home

Purpose: answer "what needs revenue attention today?"

Required content:

- Revenue summary: open quotes, booked orders, unpaid invoices, overdue invoices, paid this month.
- Attention queue: overdue invoices, quotes with no follow-up, failed email/webhook delivery, customers with missing billing info.
- Recent activity: quote sent, invoice viewed, payment received, integration sync failed.
- Integration health: Stripe, email provider, CRM sync, webhooks.
- Suggested next action: one contextual recommendation.

States:

- Empty: create customer, import CSV, connect HubSpot/Salesforce, create sample invoice.
- Loading: skeleton cards and table rows.
- Error: explain source, allow retry, link to logs if integration-related.
- Mobile: cards collapse into a prioritized action list.

### Customers List

Purpose: find, compare, and act on accounts.

Required controls:

- Search by name, email, phone, company, tax ID, invoice number.
- Filters: owner, status, balance, unpaid, overdue, last activity, source, tag.
- Saved views: All, Unpaid, Overdue, Recently active, No activity, Imported.
- Sort: name, balance, last activity, created, unpaid amount.
- Pagination with stable cursor behavior.
- Bulk actions: assign owner, add tag, export, archive, merge candidates.
- Row actions: view, create quote, create invoice, send email.

Validation:

- Long company names must wrap cleanly.
- Unicode names, emails, and addresses must be preserved.
- Duplicate customer candidates should be surfaced before creation.

### Customer Detail

Purpose: make one customer understandable and actionable.

Header:

- Customer name, status, owner, balance, unpaid amount, last activity.
- Primary CTA based on state: Create quote, Create invoice, Send reminder, Record payment.
- Secondary actions: edit, archive, export, merge, view ERP audit.

Tabs:

- Overview: business details, billing details, contact details, risk/health.
- Activity: timeline across ERP, email, payment, integration, and webhook events.
- Quotes: active, accepted, expired.
- Orders: status and fulfillment summary.
- Invoices: unpaid, overdue, paid.
- Files: PDFs, attachments, imported files.
- Automations: reminders, payment follow-ups, sync rules.

### Quote Flow

Purpose: create a clear commercial proposal and convert it without re-entry.

Expected behavior:

- Quote can be created from customer detail or quote list.
- Product/service picker supports search, quantity, unit price, tax, discount.
- Draft autosaves or clearly warns before navigation.
- Send action previews recipient, email body, PDF, and delivery method.
- Accepted quote can become an order or invoice.

### Order Flow

Purpose: track customer commitment before invoicing.

Expected behavior:

- Order shows promised items/services, fulfillment status, linked quote, linked invoices.
- Partial fulfillment is visible without requiring raw ERPNext navigation.
- Invoice creation from order carries customer, items, taxes, discounts, and terms.

### Invoice Flow

Purpose: send an invoice, collect payment, and preserve auditability.

Required actions:

- Create invoice.
- Save draft.
- Submit/post invoice.
- Send email.
- Download PDF.
- Create payment link.
- Record payment.
- Void/cancel with permission and reason.

Required states:

- Draft, submitted, sent, viewed, partially paid, paid, overdue, cancelled, failed.

Safety:

- Submitting/posting requires confirmation.
- Cancellation requires reason.
- Payment recording validates amount, date, method, and duplicate payment risk.
- Any irreversible financial action writes an audit event.

## CRUD Matrix

| Resource | Create | Read | Update | Delete/Archive | Import | Export | Share |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customer | Required | Required | Required | Archive first | CSV, CRM | CSV | Link, email |
| Quote | Required | Required | Required before send | Cancel/expire | Future | PDF/CSV | Email/PDF |
| Order | Required | Required | Limited after submit | Cancel with reason | Future | CSV/PDF | Link/PDF |
| Invoice | Required | Required | Draft only after submit | Cancel with reason | CSV | PDF/CSV | Email/payment link |
| Payment | Record | Required | Correction flow | Reverse with reason | Bank/Stripe | CSV | Audit only |

## Forms

All Sales forms must support:

- Required-field validation.
- Invalid email, phone, tax ID, currency, and date handling.
- Very long values and short values.
- Unicode, diacritics, and emoji in safe text fields.
- HTML and script input escaped on render.
- Duplicate detection where likely.
- Rapid-click submit protection.
- Refresh/back-button safety on long forms.
- Browser autofill and password-manager compatibility.

## Permissions

| Role | Allowed | Blocked |
| --- | --- | --- |
| Sales Viewer | Read customers, quotes, orders, invoices | Create, edit, financial posting |
| Sales Operator | Create/edit customers, quotes, draft invoices | Cancel posted invoices, manage settings |
| Sales Manager | Approve discounts, assign owners, export, bulk actions | System integration secrets |
| Finance Operator | Submit invoices, record payments, reconcile | Change sales settings |
| Admin | Full module configuration | None except tenant isolation |

Permission errors must say what was blocked and who can approve it.

## Events

All events use the shared event envelope and must include tenant, actor, resource,
source, and occurred-at timestamp.

Required events:

- `customers.created`
- `customers.updated`
- `quotations.created`
- `quotations.submitted`
- `sales-orders.created`
- `sales-orders.submitted`
- `sales-invoices.created`
- `sales-invoices.submitted`
- `sales-invoices.paid`
- `payment-entries.created`
- `payment-entries.failed`

Delivery requirements:

- Durable outbox before webhook delivery.
- Idempotency key per business action.
- Retry with exponential backoff.
- Delivery log visible from invoice/customer detail and developer settings.

## Integrations

| Integration | Jobs | Required UX |
| --- | --- | --- |
| HubSpot | Import/sync companies, contacts, deals | Mapping, dry run, conflict handling, sync log |
| Salesforce | Import/sync accounts and opportunities | Field mapping, owner mapping, duplicate review |
| Stripe | Payment links and payment status | Connect state, test link, webhook health, retry |
| Slack | Deal/invoice notifications | Channel picker, preview, failure log |
| Google Workspace | Email/calendar context | Account owner, scopes, disconnect, delivery state |
| Webhooks | External automation | Secret rotation, retries, idempotency, replay |

Every integration must expose connection state, scopes, credential owner, last sync,
last error, retry, disable, and disconnect.

## AI Capabilities

Good AI actions:

- Summarize customer relationship.
- Draft quote follow-up.
- Explain why invoice is overdue.
- Detect duplicate customers.
- Recommend next action.
- Suggest automation rules.
- Generate a first-draft quote from customer notes.

Hard rules:

- AI cannot submit invoices, record payments, cancel invoices, or mutate financial records without explicit user confirmation.
- AI suggestions must show source context.
- AI-generated customer messages must be editable before sending.

## Accessibility

Required:

- Full keyboard navigation across lists, dialogs, menus, and tabs.
- Visible focus states.
- Dialog focus trap and focus return.
- Screen-reader labels for status badges and financial values.
- Contrast-compliant status colors.
- Touch targets at least 44px on mobile.
- Tables have accessible names and sortable column state.

## Mobile

Mobile priorities:

- Review revenue health.
- Search customer.
- View customer detail.
- Send invoice reminder.
- Record quick note.
- Approve quote or invoice action.
- Create simple customer.

Desktop-first:

- Complex imports.
- Bulk edits.
- Field mapping.
- Financial settings.

## Performance

Targets:

- Sales home should render meaningful content in under 2 seconds on a normal business dataset.
- Customer and invoice lists use cursor pagination.
- Large list filters use API-backed queries, not client-side filtering after full load.
- Dashboards use read models or cached aggregates.
- Activity timeline loads newest events first and paginates older history.
- Integration logs paginate and avoid blocking primary detail views.

## Analytics

Track:

- Customer created.
- Quote sent.
- Quote converted.
- Invoice created.
- Invoice sent.
- Payment link created.
- Payment recorded.
- Invoice overdue reminder sent.
- Integration connected.
- Integration sync failed.
- Webhook delivery failed.

Analytics must not include secrets, raw tokens, or sensitive payment details.

## QA Checklist

Functional:

- Create customer.
- Edit customer.
- Search/filter/sort customers.
- Create quote from customer.
- Send quote.
- Convert quote to order.
- Create invoice from order.
- Submit invoice.
- Send invoice.
- Create payment link.
- Record payment.
- Export customers and invoices.
- Archive customer.
- Verify permissions by role.

Edge cases:

- Duplicate customer.
- Missing billing email.
- Invalid tax ID.
- Very long customer name.
- Unicode address.
- Negative quantity.
- Zero-value invoice.
- Rapid submit clicks.
- Browser refresh during invoice draft.
- Integration disconnect during send.
- Webhook endpoint timeout.

UX states:

- Empty.
- Loading.
- Error.
- Offline or degraded integration.
- Permission denied.
- Mobile portrait.
- Tablet.
- Keyboard only.

Security:

- Tenant isolation for every query.
- No direct browser access to integration secrets.
- No token leakage in console or network payloads.
- XSS escaping in notes, names, addresses, email previews.
- IDOR attempts against customer, invoice, payment IDs.

## Launch Gate

Sales is launch-ready only when:

- `pnpm build`, `pnpm check`, and Sales smoke tests pass.
- Demo user can complete the primary job in under 10 minutes.
- No primary workflow exposes a raw DocType screen.
- No irreversible financial action lacks confirmation and audit trail.
- Webhook/payment/email failures are visible and retryable.
- Customer and invoice lists remain usable with at least 10,000 records.
- Mobile review and quick actions are usable.

## First Implementation Slice

1. Replace generic `/sales` with Sales Home.
2. Build customer list/detail around Zivvy contracts.
3. Wrap invoice list/detail behind API contracts.
4. Add Sales event emission and delivery logs.
5. Add Stripe payment-link happy path.
6. Add HubSpot import dry run.
7. Add AI customer summary as read-only assistant action.
8. Ship Playwright smoke covering primary job.
