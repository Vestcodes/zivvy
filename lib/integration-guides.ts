/**
 * Honest maturity + real-path guides for each /integrations/[slug] page.
 * Maturity is product truth — not marketing aspiration.
 *
 * - native: first-party in zivvy_brand / core platform
 * - addon: paid Zivvy add-on (Polar) wrapping an upstream Frappe app
 * - via-webhooks: customer points Zivvy HMAC webhooks at the other product
 * - via-api: customer builds sync with integrate.zivvy.xyz REST (no OAuth connector UI)
 * - coming-soon: listed for demand / roadmap; not a supported path yet
 */

export type IntegrationMaturity =
  | "native"
  | "addon"
  | "via-webhooks"
  | "via-api"
  | "coming-soon";

export const MATURITY_LABEL: Record<IntegrationMaturity, string> = {
  native: "Native",
  addon: "Add-on",
  "via-webhooks": "Via webhooks",
  "via-api": "Via API",
  "coming-soon": "Coming soon"
};

export const MATURITY_HINT: Record<IntegrationMaturity, string> = {
  native: "Built into Zivvy — configure in Settings, no custom glue required.",
  addon: "Optional paid add-on. Enable in Settings → Add-ons, then configure the linked DocTypes.",
  "via-webhooks":
    "No native OAuth connector. Register a Zivvy webhook subscription whose target_url is the other app (or an intermediary).",
  "via-api":
    "No native OAuth connector. Build the sync yourself against integrate.zivvy.xyz REST (API key + tenant scope).",
  "coming-soon": "Not a supported production path yet — contact us if you need it prioritized."
};

export type IntegrationGuideMeta = {
  maturity: IntegrationMaturity;
  /** One-sentence truth of how it works today */
  realPath: string;
  /** Numbered how-to for the real path */
  setupSteps: string[];
};

export const integrationGuideBySlug: Record<string, IntegrationGuideMeta> = {
  slack: {
    maturity: "via-webhooks",
    realPath:
      "Create a Slack Incoming Webhook, then register it as a Zivvy webhook subscription for the events you care about. There is no Slack OAuth app inside Zivvy.",
    setupSteps: [
      "In Slack, create an Incoming Webhook for the target channel and copy the hooks.slack.com URL.",
      "In Zivvy, open Settings → Developer (or POST /v1/webhooks) and create a subscription with that target_url.",
      "Select events (e.g. sales-invoices.submitted, payment-entries.paid) and store the HMAC secret.",
      "Optionally add a small Slack app or Zap that reformats the JSON payload into Block Kit; verify X-Zivvy-Signature on every delivery."
    ]
  },
  salesforce: {
    maturity: "via-api",
    realPath:
      "Use Zivvy REST (/v1/customers, /v1/opportunities, /v1/sales-orders) plus webhooks. There is no Salesforce AppExchange connector or OAuth UI in Zivvy today.",
    setupSteps: [
      "Create a Zivvy API key (zk_live_) scoped to your tenant.",
      "Map Salesforce Account/Contact fields to Zivvy Customer payloads; use Idempotency-Key on writes.",
      "Subscribe to customers.updated (and related) webhooks to push billing changes back to Salesforce.",
      "Run the sync in your middleware (Zapier, n8n, or custom worker) — Zivvy does not host the Salesforce OAuth dance."
    ]
  },
  hubspot: {
    maturity: "via-api",
    realPath:
      "Sync HubSpot contacts/deals through Zivvy REST and webhooks. No native HubSpot private-app install flow in Zivvy.",
    setupSteps: [
      "Create a HubSpot private app with CRM scopes you need.",
      "Create a Zivvy API key and map HubSpot Contact → /v1/contacts (or Customer) and Deal → /v1/opportunities.",
      "Register Zivvy webhooks for the reverse direction (status changes → HubSpot).",
      "Host the glue in Zapier/n8n/custom code; keep Idempotency-Key on every create."
    ]
  },
  zapier: {
    maturity: "via-webhooks",
    realPath:
      "Use Webhooks by Zapier (Catch Hook) registered in Zivvy, or the private Zivvy Zapier app templates under zapier-templates/. Not a public Zapier directory listing yet.",
    setupSteps: [
      "In Zapier, create a Zap with Webhooks by Zapier → Catch Hook; copy the Catch URL.",
      "Register that URL in Zivvy (Settings → Developer or POST https://integrate.zivvy.xyz/v1/webhooks) with the event list.",
      "Add Code by Zapier using recipes/_shared-filter-code.js to keep only the events you want.",
      "Optional: enrich with Webhooks GET against api.zivvy.xyz using Bearer zk_live_."
    ]
  },
  "google-drive": {
    maturity: "via-api",
    realPath:
      "Attach Drive URLs via /v1 file or Communication APIs, or push file links from a Zap. No Google OAuth file-picker in Zivvy.",
    setupSteps: [
      "Share Drive files with the service account or user that will call Google APIs.",
      "On Zivvy record create/update, call your worker to upload or link the file.",
      "Store the Drive URL on the Zivvy doc (custom field or Communication).",
      "Use webhooks if you need Zivvy → Drive notifications the other way."
    ]
  },
  stripe: {
    maturity: "via-api",
    realPath:
      "Reconcile customer Stripe charges into Zivvy Payment Entries via Stripe webhooks + Zivvy REST. Zivvy’s own seat billing uses Polar, not Stripe.",
    setupSteps: [
      "In Stripe, add an endpoint for charge.succeeded / invoice.paid / charge.refunded.",
      "In your worker, map Stripe customer/metadata to a Zivvy Customer and POST /v1/payment-entries (or Payment Entry via Frappe API).",
      "Never confuse Polar (Zivvy SaaS seats) with Stripe (your customer collections).",
      "Verify Stripe signatures; use Idempotency-Key when writing into Zivvy."
    ]
  },
  polar: {
    maturity: "native",
    realPath:
      "First-party: Polar powers Zivvy Free→Pro/Business seat checkout, seat quantity changes, and subscription webhooks into Zivvy Tenant.",
    setupSteps: [
      "Ops: configure Polar Settings / POLAR_* env and the polar_webhook method on the site.",
      "Tenant admin: open Billing / Pricing in Zivvy and start checkout — Polar Checkout opens with zivvy_tenant metadata.",
      "Polar subscription.* / order.paid webhooks update plan and seat_limit on the tenant.",
      "Customer portal for invoices and seat changes is Polar’s, linked from Billing."
    ]
  },
  plaid: {
    maturity: "via-api",
    realPath:
      "No Plaid Link UI ships in Zivvy. Bank reconciliation today is the Banking (EBICS) stack / API recipes — wire Plaid yourself if you need US ACH Link.",
    setupSteps: [
      "Build or buy a Plaid Link flow outside Zivvy.",
      "On TRANSACTION webhooks, create Bank Transaction / Payment Entry records via Zivvy REST.",
      "Prefer the Banking add-on path for EU EBICS if that matches your region.",
      "Contact support if you need a packaged Plaid connector prioritized."
    ]
  },
  gocardless: {
    maturity: "via-api",
    realPath:
      "No native GoCardless mandate UI. Collect SEPA/Bacs in GoCardless, then POST matching Payment Entries into Zivvy via API/webhooks.",
    setupSteps: [
      "Create the mandate and payment in GoCardless.",
      "On payment_paid events, create a Zivvy Payment Entry against the Sales Invoice.",
      "Store the GoCardless payment id for idempotent retries.",
      "Ask support if you need a packaged connector."
    ]
  },
  shopify: {
    maturity: "addon",
    realPath:
      "Business add-on ecommerce-integrations (upstream Frappe ecommerce_integrations) — Shopify Settings DocType syncs orders/customers/stock.",
    setupSteps: [
      "Upgrade to a plan that allows the Ecommerce Integrations add-on and enable it under Settings → Add-ons.",
      "Open Shopify Settings in Desk / app and connect the store with Admin API credentials.",
      "Map warehouses and item SKUs; enable order and inventory sync.",
      "Reconcile refunds/returns so Zivvy invoices stay aligned with Shopify."
    ]
  },
  amazon: {
    maturity: "addon",
    realPath:
      "Same ecommerce-integrations add-on — Amazon MWS / SP-API settings pull orders and settlements into Zivvy.",
    setupSteps: [
      "Enable the Ecommerce Integrations add-on.",
      "Configure Amazon SP-API / MWS credentials in the ecommerce integrations settings.",
      "Map marketplaces to Company / warehouses.",
      "Import settlements so fees land on the right GL accounts."
    ]
  },
  unicommerce: {
    maturity: "addon",
    realPath:
      "Same ecommerce-integrations add-on — Unicommerce bridge for marketplace orders and inventory.",
    setupSteps: [
      "Enable Ecommerce Integrations.",
      "Enter Unicommerce API credentials and facility mapping.",
      "Sync inventory adjustments and pull marketplace orders.",
      "Monitor failed syncs in the integration logs."
    ]
  },
  quickbooks: {
    maturity: "via-api",
    realPath:
      "No Intuit OAuth connector. Import/export invoices and payments with Zivvy REST or CSV; keep QuickBooks as a parallel ledger only if required.",
    setupSteps: [
      "Decide system of record (prefer Zivvy for ops; QB only if your accountant requires it).",
      "Use /v1/sales-invoices and /v1/payment-entries to push or pull.",
      "Or export reports from Zivvy and import into QuickBooks Online.",
      "Avoid dual-writing without Idempotency-Key."
    ]
  },
  xero: {
    maturity: "via-api",
    realPath:
      "No Xero OAuth app in Zivvy. Reconcile via API/CSV; for DE tax packs prefer the DATEV add-on instead of Xero.",
    setupSteps: [
      "Map Xero contacts to Zivvy Customers/Suppliers.",
      "Sync invoices through REST or scheduled CSV.",
      "German teams: evaluate /addons/erpnext-datev for tax export instead.",
      "Contact support for migration help."
    ]
  },
  datev: {
    maturity: "addon",
    realPath:
      "Add-on erpnext-datev — DATEV Settings + DATEV Export generate German tax-ready files from Zivvy journals.",
    setupSteps: [
      "Enable the DATEV Export add-on on a Pro/Business tenant.",
      "Configure DATEV Settings (consultant number, client number, chart).",
      "Run DATEV Export for the period and download the CSV/files.",
      "Hand files to your Steuerberater; do not edit chart mappings casually."
    ]
  },
  "digital-signer": {
    maturity: "addon",
    realPath:
      "Add-on digital-signer — legally binding PDF/A signatures on quotations, orders, and invoices.",
    setupSteps: [
      "Enable Digital Signer under Add-ons.",
      "Upload/configure the signing certificate per ops runbook.",
      "Sign from the document print/PDF actions where the add-on hooks in.",
      "Archive signed PDFs with the record for audit."
    ]
  },
  "payments-processor": {
    maturity: "addon",
    realPath:
      "Add-on payments-processor — bulk supplier payment files (SEPA/ACH/NACHA) from Payment Entry batches.",
    setupSteps: [
      "Enable Payments Processor.",
      "Configure bank file format and creditor identifiers.",
      "Select Payment Entries and generate the bulk file.",
      "Upload to your bank portal; mark entries cleared on confirmation."
    ]
  },
  twilio: {
    maturity: "via-webhooks",
    realPath:
      "Zivvy emits webhooks; your worker calls Twilio Programmable SMS. No Twilio credential UI in Zivvy.",
    setupSteps: [
      "Create a Twilio Messaging Service and auth token.",
      "Subscribe Zivvy webhooks for the events that should SMS (e.g. sales-invoices.submitted).",
      "In the worker, verify HMAC, then Messages.create to the customer phone.",
      "Respect opt-out and regional SMS rules."
    ]
  },
  postmark: {
    maturity: "via-api",
    realPath:
      "Zivvy’s built-in transactional email path is Resend, not Postmark. To use Postmark, forward events via webhooks to Postmark’s API or ask ops about a custom Email Account.",
    setupSteps: [
      "Prefer Resend (native) for signup/welcome/reset unless you must use Postmark.",
      "If Postmark is required: create a Postmark server token.",
      "Subscribe to Zivvy webhooks and send via Postmark Templates API.",
      "Or configure a custom Frappe Email Account pointing at Postmark SMTP (ops)."
    ]
  },
  github: {
    maturity: "via-webhooks",
    realPath:
      "GitHub Actions/Issues → Zivvy via GitHub webhooks into your worker, which POSTs /v1/support-tickets (or Tasks). Reverse: Zivvy webhooks → GitHub API.",
    setupSteps: [
      "Create a GitHub App or webhook on the repo.",
      "On issues.opened, POST a Zivvy support ticket / task with Idempotency-Key = delivery id.",
      "Optionally subscribe to Zivvy task events and comment back on the GitHub issue.",
      "Store cross-links in both systems."
    ]
  },
  notion: {
    maturity: "via-api",
    realPath:
      "Mirror Projects/Tasks with Notion’s API from a worker. No Notion OAuth inside Zivvy.",
    setupSteps: [
      "Create a Notion integration and share the target database.",
      "On Zivvy task webhooks, upsert Notion pages.",
      "Optional reverse sync: Notion webhook → PATCH Zivvy task.",
      "Keep Zivvy as system of record for assignees and due dates."
    ]
  },
  airtable: {
    maturity: "via-api",
    realPath:
      "Bidirectional item/catalog sync is DIY via Airtable API + Zivvy /v1/items. No Airtable connector UI.",
    setupSteps: [
      "Create an Airtable personal access token with base access.",
      "Map fields to Item / Item Price.",
      "Schedule sync or use Airtable automations → Zivvy webhook worker.",
      "Use Idempotency-Key derived from Airtable record id."
    ]
  },
  "google-sheets": {
    maturity: "via-webhooks",
    realPath:
      "Typical path: Zivvy webhooks → Zapier/n8n → Google Sheets, or Sheets → Zap → Zivvy REST. No native Sheets add-on.",
    setupSteps: [
      "Create a sheet with headers matching the fields you need.",
      "Zapier: Catch Hook from Zivvy → Create Spreadsheet Row.",
      "Or schedule a script that pulls /v1 list endpoints into Sheets.",
      "Avoid editing the same cells from two writers without a clear source of truth."
    ]
  },
  segment: {
    maturity: "via-webhooks",
    realPath:
      "Forward Zivvy webhook events into Segment track()/identify() from your worker. Zivvy does not embed the Segment SDK for ERP events.",
    setupSteps: [
      "Create a Segment source (HTTP API).",
      "Subscribe to the Zivvy events you want in the product analytics model.",
      "Map event names to Segment track() calls; attach userId = Zivvy user email where appropriate.",
      "Keep PII scrubbing rules aligned with your privacy policy."
    ]
  },
  posthog: {
    maturity: "native",
    realPath:
      "First-party product analytics: PostHog project key + region in Zivvy Settings (marketing site + optional Desk). ERP→PostHog event mirrors still use webhooks if you need custom funnels.",
    setupSteps: [
      "In Zivvy / ops PostHog Settings, set project API key and US/EU host.",
      "Enable website capture; optionally enable Desk capture with consent.",
      "For ERP domain events (invoice paid, etc.), add a webhook worker that captures into PostHog.",
      "Do not put the project key in public mobile clients."
    ]
  },
  "rest-api": {
    maturity: "native",
    realPath:
      "First-party OpenAPI at integrate.zivvy.xyz — Bearer API keys, tenant-scoped by the key owner’s zivvy_tenant.",
    setupSteps: [
      "Create an API key in Settings → Developer.",
      "Call https://integrate.zivvy.xyz/v1/... with Authorization: Bearer zk_live_…",
      "Send Idempotency-Key on POSTs that must not double-create.",
      "Read OpenAPI at https://integrate.zivvy.xyz/docs."
    ]
  },
  webhooks: {
    maturity: "native",
    realPath:
      "First-party HMAC-signed webhook subscriptions (100+ event verbs) with retries. Core integration primitive for every via-webhooks guide.",
    setupSteps: [
      "POST /v1/webhooks with url, events[], optional secret and label.",
      "Verify X-Zivvy-Signature: sha256=<hmac> on every delivery.",
      "Return 2xx quickly; do heavy work async.",
      "Use GET /v1/webhooks and DELETE /v1/webhooks/:id to manage subscriptions."
    ]
  }
};

export function guideForIntegration(slug: string): IntegrationGuideMeta | null {
  return integrationGuideBySlug[slug] ?? null;
}
