/**
 * Content for /addons hub and /addons/[slug] detail pages.
 * Kept alongside marketing-content.ts so hub + detail RSCs can import
 * a single source of truth (slugs, prices, code samples, FAQs).
 */

export type AddonBenefit = {
  title: string;
  description: string;
};

export type AddonFaq = {
  question: string;
  answer: string;
};

export type AddonCodeExample = {
  label: string;
  language: "bash" | "http";
  code: string;
};

export type AddonDetail = {
  slug: string;
  name: string;
  category: string;
  hero: string;
  subtitle?: string;
  description: string;
  metaDescription: string;
  price: string;
  priceUsd: number;
  billing: string;
  benefits: AddonBenefit[];
  code: AddonCodeExample;
  faqs: AddonFaq[];
  frappeMethod: string;
};

export const addonDetails: AddonDetail[] = [
  {
    slug: "ecommerce-integrations",
    name: "Ecommerce Integrations",
    category: "Commerce",
    hero: "Sell everywhere. Reconcile in one place.",
    description:
      "Bring orders, inventory, and returns from every storefront into a single ERP ledger — without CSV drops or nightly cron jobs.",
    metaDescription:
      "Sync Shopify, Amazon MWS, and Unicommerce orders straight into Zivvy ERP. One reconciled ledger, no CSV drops.",
    price: "$29 / month",
    priceUsd: 29,
    billing: "Per workspace · billed monthly via Polar",
    benefits: [
      {
        title: "Shopify sync",
        description:
          "Two-way sync for orders, customers, and stock across every Shopify store you connect."
      },
      {
        title: "Amazon MWS",
        description:
          "Pull FBA and MFN orders with settlement fees mapped to the right GL account."
      },
      {
        title: "Unicommerce bridge",
        description:
          "Push inventory adjustments and pull marketplace orders through the Unicommerce API."
      },
      {
        title: "Return-aware reconciliation",
        description:
          "Returns, cancellations, and refunds flow into Zivvy invoices so accounting stays clean."
      }
    ],
    code: {
      label: "Configure a Shopify store",
      language: "bash",
      code: `curl -X POST https://zivvy.xyz/api/method/zivvy.addons.ecommerce.shopify_settings \\
  -H "Authorization: token API_KEY:API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "shop_domain": "acme.myshopify.com",
    "access_token": "shpat_...",
    "sync_orders": true,
    "sync_inventory": true,
    "default_warehouse": "Stores - AC"
  }'`
    },
    faqs: [
      {
        question: "Which Shopify plans work?",
        answer:
          "Basic, Shopify, and Advanced. Shopify Plus works too, but multi-store setups need one workspace connection per store."
      },
      {
        question: "Do you support Amazon SP-API?",
        answer:
          "The Amazon connector currently uses MWS reports. SP-API support ships alongside the marketplace migration; existing MWS keys keep working until Amazon deprecates them."
      },
      {
        question: "How often does sync run?",
        answer:
          "Orders are pulled every 5 minutes. Inventory pushes happen on every stock movement inside Zivvy so listings stay in step."
      },
      {
        question: "Can I turn off individual stores?",
        answer:
          "Yes. Each connection has an active toggle — pause a store during a migration or a big promo without disabling the whole add-on."
      }
    ],
    frappeMethod: "zivvy.addons.subscribe"
  },
  {
    slug: "erpnext-datev",
    name: "DATEV Export",
    category: "Compliance",
    hero: "DATEV export in one click.",
    subtitle: "Deutsche Buchhaltung ohne CSV-Fummelei.",
    description:
      "Export your Zivvy bookings in the exact DATEV shape your Steuerberater expects — HGB-compliant, SKR03 or SKR04, no spreadsheet gymnastics.",
    metaDescription:
      "One-click DATEV export from Zivvy. HGB-compliant, SKR03/SKR04 charts, XML and CSV — send to your Steuerberater without CSV fiddling.",
    price: "€19 / month",
    priceUsd: 21,
    billing: "Per workspace · billed monthly via Polar",
    benefits: [
      {
        title: "HGB compliance",
        description:
          "Journal entries are exported with the fields German tax offices actually validate — Buchungstext, Belegdatum, KOST1/KOST2."
      },
      {
        title: "SKR03 & SKR04",
        description:
          "Ship with both standard German charts of accounts. Map once, export forever."
      },
      {
        title: "XML & CSV export",
        description:
          "Generate DATEV Format 700 (CSV) or the newer XML packages. Attach receipts directly to bookings."
      },
      {
        title: "Steuerberater handoff",
        description:
          "Package a whole month in one archive, complete with a control totals sheet your accountant can reconcile in minutes."
      }
    ],
    code: {
      label: "Trigger a monthly export",
      language: "bash",
      code: `curl -X POST https://zivvy.xyz/api/method/zivvy.addons.datev.exports \\
  -H "Authorization: token API_KEY:API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company": "Acme GmbH",
    "period_from": "2026-06-01",
    "period_to": "2026-06-30",
    "chart": "SKR03",
    "format": "xml"
  }'`
    },
    faqs: [
      {
        question: "Which DATEV formats are supported?",
        answer:
          "DATEV Format 700 (CSV, current recommended profile) and DATEV XF/XML. Both include Konto, Gegenkonto, Buchungstext, and Belegnummer."
      },
      {
        question: "Can I lock a period after export?",
        answer:
          "Yes. Once an export is generated for a period, Zivvy can optionally lock that period's bookings so nothing shifts under your Steuerberater."
      },
      {
        question: "What about USt-Voranmeldung?",
        answer:
          "The export includes the fields your accountant needs to file the pre-notification. We do not submit to ELSTER on your behalf."
      },
      {
        question: "Does this work outside Germany?",
        answer:
          "The formats are German — DATEV is a Germany-specific standard. Austrian and Swiss customers usually adapt SKR03/SKR04 mappings with their advisor."
      }
    ],
    frappeMethod: "zivvy.addons.subscribe"
  },
  {
    slug: "digital-signer",
    name: "Digital Signer",
    category: "Documents",
    hero: "Sign contracts inside your ERP.",
    description:
      "Turn any ERP document into a signable PDF, route it to the right people, and archive the signed original with a verifiable audit trail.",
    metaDescription:
      "Sign contracts, offers, and NDAs from inside Zivvy. PDF signing flow with certificate management and a full audit trail per document.",
    price: "$15 / month",
    priceUsd: 15,
    billing: "Per workspace · billed monthly via Polar",
    benefits: [
      {
        title: "PDF sign flow",
        description:
          "Send quotes, contracts, and NDAs for signature from any Zivvy doctype. Signers get a clean, brandable page."
      },
      {
        title: "Certificate management",
        description:
          "Bring your own qualified certificate (eIDAS) or use the built-in advanced signature. Rotate keys without breaking existing signatures."
      },
      {
        title: "Audit trail",
        description:
          "Every view, sign, and decline is timestamped with IP, geolocation, and hash — attached to the ERP document forever."
      },
      {
        title: "Bulk envelopes",
        description:
          "Send a batch of NDAs or renewal letters in one job. Track completion percentage from a single dashboard."
      }
    ],
    code: {
      label: "Create a signed-document envelope",
      language: "bash",
      code: `curl -X POST https://zivvy.xyz/api/method/zivvy.addons.digital_signer.signed_documents \\
  -H "Authorization: token API_KEY:API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference_doctype": "Sales Order",
    "reference_name": "SO-2026-00042",
    "signers": [
      { "email": "buyer@acme.com", "role": "customer" },
      { "email": "cfo@zivvy.xyz", "role": "internal" }
    ],
    "expires_in_days": 14
  }'`
    },
    faqs: [
      {
        question: "Are the signatures legally binding?",
        answer:
          "Yes for the vast majority of B2B use cases. The add-on produces advanced electronic signatures (AES) by default and qualified signatures (QES) when you attach a compliant certificate."
      },
      {
        question: "Which document types are supported?",
        answer:
          "Any doctype that can render a Print Format — quotations, sales orders, purchase orders, employee NDAs, custom contracts."
      },
      {
        question: "Can I use my own signature provider?",
        answer:
          "The add-on ships with a built-in engine. Enterprise workspaces on the Business plan can plug in DocuSign or Adobe Sign as the signing backend."
      },
      {
        question: "Where are signed PDFs stored?",
        answer:
          "In your Zivvy workspace, pinned to your chosen region. Signed copies are cryptographically hashed so tampering is detectable."
      }
    ],
    frappeMethod: "zivvy.addons.subscribe"
  },
  {
    slug: "payments-processor",
    name: "Payments Processor",
    category: "Finance",
    hero: "Batch payments without the spreadsheet.",
    description:
      "Approve and disburse dozens of vendor and payroll payments at once, straight from Zivvy — SEPA, ACH, or your local rail.",
    metaDescription:
      "Batch SEPA and ACH disbursements from inside Zivvy. Two-eyes approval, per-vendor limits, and one clean bank file per batch.",
    price: "$25 / month",
    priceUsd: 25,
    billing: "Per workspace · billed monthly via Polar",
    benefits: [
      {
        title: "SEPA (EU)",
        description:
          "Generate PAIN.001 XML files ready for your bank. IBAN validation, BIC lookup, and per-country limits included."
      },
      {
        title: "ACH (US)",
        description:
          "Produce NACHA-formatted batches for domestic USD payouts. Prenote flow supported for new vendors."
      },
      {
        title: "Bulk approval",
        description:
          "Two-person approvals, per-vendor caps, and an audit log that regulators actually accept."
      },
      {
        title: "Reconciliation",
        description:
          "Match bank statement lines back to the batch in one click — no more chasing rogue payouts across three systems."
      }
    ],
    code: {
      label: "Create a payment batch",
      language: "bash",
      code: `curl -X POST https://zivvy.xyz/api/method/zivvy.addons.payments.payment_batches \\
  -H "Authorization: token API_KEY:API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rail": "sepa",
    "bank_account": "Deutsche Bank - DE",
    "value_date": "2026-08-01",
    "entries": [
      { "party_type": "Supplier", "party": "Kabel GmbH", "amount": 12500.00 },
      { "party_type": "Supplier", "party": "Metall AG",  "amount":  4230.55 }
    ]
  }'`
    },
    faqs: [
      {
        question: "Which rails are supported today?",
        answer:
          "SEPA Credit Transfer, SEPA Instant, US ACH (NACHA), and India NEFT/RTGS. UK Faster Payments is on the roadmap."
      },
      {
        question: "Do you connect to banks directly?",
        answer:
          "The default flow generates a bank-ready file you upload to your bank portal. Direct APIs are available via the Business plan for banks that support open banking payments."
      },
      {
        question: "How does approval work?",
        answer:
          "Configure two-eyes (or four-eyes) approval per rail, per amount threshold. Approvers get email + in-app notifications with a signed link."
      },
      {
        question: "Can I run payroll through this?",
        answer:
          "Yes. Payroll batches inherit vendor limits and the same audit trail, so employees and suppliers can move through one clean process."
      }
    ],
    frappeMethod: "zivvy.addons.subscribe"
  }
];

export const addonBySlug: Record<string, AddonDetail> = Object.fromEntries(
  addonDetails.map((entry) => [entry.slug, entry])
);
