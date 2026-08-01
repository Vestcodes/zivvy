/**
 * Solutions content — /solutions/<slug> profiles.
 *
 * This module replaces the flat `solutionDetails: MarketingDetail[]` array that
 * previously lived in `lib/marketing-content.ts`. Instead of a single generic
 * shape, solutions are now a discriminated union on `type` — country, industry,
 * or team — with the fields each hero variant needs.
 *
 * SolutionProfile still extends MarketingDetail, so consumers that only need
 * the shared marketing fields (sitemap, cards, breadcrumbs) keep working
 * without a refactor.
 */

import type { MarketingDetail } from "@/lib/marketing-content";

// ---------------------------------------------------------------------------
// Base shape
// ---------------------------------------------------------------------------

export interface SolutionProfileBase extends MarketingDetail {
  /** Discriminator — which hero variant + metadata block to render. */
  type: "country" | "industry" | "team";
  /** Lucide icon name resolved at render time (industry / team). */
  iconName?: string;
  /** Cross-link to other solutions worth pairing (e.g. germany <-> manufacturing). */
  relatedSolutions?: string[];
  /** Slugs from useCaseDetails to spotlight in the "You'll use this for" strip. */
  spotlightUseCases?: string[];
  /** Slugs from featureDetails to spotlight in the modules bento. */
  spotlightFeatures?: string[];
  /** Small proof point rendered near the hero. */
  proofPoint?: { label: string; value: string };
  /** Optional social proof — customer names or logo slugs. */
  socialProof?: Array<{ name: string; logo?: string }>;
  /** SEO — og image override per profile. */
  ogImage?: string;
}

// ---------------------------------------------------------------------------
// Country / region
// ---------------------------------------------------------------------------

export interface CountrySolutionProfile extends SolutionProfileBase {
  type: "country";
  /** ISO 3166-1 alpha-2 — drives flag lookup, hreflang, sitemap. */
  countryCode: string;
  /** Unicode flag emoji rendered at ~96px in the hero. */
  flagEmoji: string;
  /** ISO 4217 currency code, e.g. "INR", "EUR", "AED". */
  currency: string;
  /** Currency symbol for the chip, e.g. "₹", "€", "د.إ". */
  currencySymbol: string;
  /** Primary BCP-47 locale — drives `openGraph.locale`. */
  primaryLanguage: string;
  /** Optional second locale for bilingual markets. */
  secondaryLocale?: string;
  /** Named tax regime — "GST", "VAT", "MwSt", "Sales Tax". */
  taxRegime: string;
  /** Compliance hooks Zivvy already wires up for this market. */
  complianceHooks: Array<{
    label: string;
    description?: string;
    docType?: string;
  }>;
  /** Deep links to official regulator / documentation. */
  regulatoryLinks: Array<{ label: string; href: string }>;
  /** Local integration partners. */
  localIntegrations: Array<{
    slug: string;
    name: string;
    logo?: string;
    category?: "Payments" | "Tax" | "Banking" | "Identity" | "Logistics";
  }>;
  /** Region bucket for grouping on the hub. */
  region?: "EMEA" | "APAC" | "Americas" | "MENA" | "ANZ";
  /** Data-residency copy under the hero. */
  dataResidency?: string;
  /** Fiscal year start (e.g. "April 1"). */
  fiscalYearStart?: string;
}

// ---------------------------------------------------------------------------
// Industry
// ---------------------------------------------------------------------------

export interface IndustrySolutionProfile extends SolutionProfileBase {
  type: "industry";
  /** Canonical vertical name used in schema.org markup. */
  industryVertical: string;
  /** Employee / revenue band this profile is tuned for. */
  sizeSweetSpot: string;
  /** Pain-point chips rendered inline in the hero. */
  painPoints: string[];
  /** Optional regulatory context — "SOX", "HIPAA", "ISO 9001". */
  regulatoryContext?: string;
  /** Zivvy modules highlighted in the bento. */
  keyModules: Array<{
    slug: string;
    title: string;
    blurb: string;
  }>;
  /** Incumbents this profile displaces. */
  incumbents?: string[];
  /** Named KPI dashboards seeded on this profile. */
  namedDashboards?: string[];
  /** Average deal size / ACV band, if useful for GTM copy. */
  acvBand?: string;
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface TeamSolutionProfile extends SolutionProfileBase {
  type: "team";
  /** Persona role, e.g. "Head of Finance", "Solo founder". */
  role: string;
  /** Sweet-spot team size. */
  teamSize: string;
  /** Seniority signal — drives hero copy + CTA variant. */
  seniority: "ic" | "manager" | "lead" | "director" | "exec" | "founder";
  /** Day-in-the-life bullets rendered above the fold. */
  dailyRituals?: string[];
  /** Tools this team usually retires. */
  replacesTools?: string[];
  /** Minimum Zivvy tier unlocking this team's must-have workflow. */
  minimumTier?: "Free" | "Pro" | "Business";
  /** Primary metric this team gets measured on. */
  northStarMetric?: string;
}

export type SolutionProfile =
  | CountrySolutionProfile
  | IndustrySolutionProfile
  | TeamSolutionProfile;

// ---------------------------------------------------------------------------
// Data — every planned slug
// ---------------------------------------------------------------------------

const countryProfiles: CountrySolutionProfile[] = [
  {
    type: "country",
    slug: "india",
    title: "Zivvy for India",
    description:
      "Run GST-ready books, e-invoicing, TDS, and e-way bills from one Indian-rupee tenant — with UPI and Razorpay wired in.",
    keyword: "erp software india gst",
    problem:
      "Indian teams juggle Tally for books, an e-invoicing tool for IRN, a UPI reconciliation sheet, and TDS filings in a fourth window. Reconciling GSTR-2B to purchase invoices swallows the first week of every month.",
    solution:
      "Zivvy India ships with a GST-compliant chart of accounts, HSN/SAC on every item, IRN pulled from the NIC portal, TDS on payments, and Razorpay + PhonePe deep-linked into /v1/payment-entries.",
    benefits: [
      "GSTR-1, GSTR-3B, and GSTR-2B reconciliation as first-class reports",
      "Live IRN generation via NIC — every Sales Invoice ships with QR + IRN",
      "TDS deducted, tracked, and remitted per section from the vendor payment",
      "e-Way bills auto-generated when a Delivery Note crosses the threshold",
      "Razorpay + PhonePe reconciled straight into the ledger, UPI included",
      "Bilingual tenant — Devanagari-safe printing on invoices and DCs"
    ],
    useCases: [
      "File GSTR-1 direct from Zivvy without CSV wrangling",
      "Reconcile GSTR-2B against purchase invoices in a single view",
      "Deduct 194Q / 194C / 194J at the vendor payment stage",
      "Push Razorpay Payment Links into a Sales Invoice with one click",
      "Generate e-way bill JSON from a Delivery Note over 50k",
      "Print bilingual Hindi/English invoices for D2C consumers"
    ],
    faqs: [
      {
        q: "Do you actually generate IRN or just print the QR?",
        a: "Zivvy calls the NIC IRP directly with your GSP credentials — the IRN and signed QR are stored on the Sales Invoice within seconds of submission."
      },
      {
        q: "Which banks are supported for reconciliation?",
        a: "HDFC, ICICI, Axis, SBI, and Kotak via statement upload, plus Razorpay + PhonePe over API. Ledgerly-style rules run on every import."
      },
      {
        q: "Can we run multi-GSTIN across states?",
        a: "Yes. Each state is its own Company with its own GSTIN — a single tenant covers a group without duplicating masters."
      },
      {
        q: "Do you handle composition scheme dealers?",
        a: "Yes. Toggle 'Composition' on Company and GSTR-4 becomes the outward return, with tax computed at the flat scheme rate."
      }
    ],
    ctaLabel: "Start on Zivvy India",
    ctaHref: "/login#signup",
    countryCode: "IN",
    flagEmoji: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    primaryLanguage: "en-IN",
    secondaryLocale: "hi-IN",
    taxRegime: "GST",
    region: "APAC",
    dataResidency: "ap-south-1 (Mumbai)",
    fiscalYearStart: "April 1",
    complianceHooks: [
      { label: "GSTR-1 / GSTR-3B filing", description: "Direct JSON export ready for the GSTN portal.", docType: "GST Settings" },
      { label: "e-Invoice IRN generation", description: "IRN + signed QR pulled from the NIC IRP on submission." },
      { label: "TDS on payments", description: "194Q, 194C, 194J deducted at the Payment Entry stage." },
      { label: "e-Way bill JSON", description: "Auto-generated for movement over the state threshold." },
      { label: "GSTR-2B reconciliation", description: "Match purchase invoices against the auto-drafted 2B." },
      { label: "HSN summary in GSTR-1", description: "HSN/SAC captured on every item, aggregated on filing." }
    ],
    regulatoryLinks: [
      { label: "CBIC portal", href: "https://www.cbic.gov.in/" },
      { label: "GSTN", href: "https://www.gst.gov.in/" },
      { label: "NIC e-Invoicing", href: "https://einvoice1.gst.gov.in/" },
      { label: "MCA21", href: "https://www.mca.gov.in/" }
    ],
    localIntegrations: [
      { slug: "razorpay", name: "Razorpay", category: "Payments" },
      { slug: "payu", name: "PayU India", category: "Payments" },
      { slug: "phonepe", name: "PhonePe Business", category: "Payments" },
      { slug: "cleartax", name: "ClearTax", category: "Tax" },
      { slug: "gstn", name: "GSTN", category: "Tax" },
      { slug: "hdfc", name: "HDFC Bank", category: "Banking" }
    ],
    proofPoint: { label: "Active tenants", value: "1,800+ Indian businesses" },
    relatedSolutions: ["manufacturing", "distribution", "startups"]
  },
  {
    type: "country",
    slug: "germany",
    title: "Zivvy for Germany",
    description:
      "DATEV-ready books, GoBD-compliant journals, SKR03/SKR04 charts, and ELSTER UStVA — all on a Frankfurt tenant.",
    keyword: "erp software germany datev",
    problem:
      "Deutsche Mittelstand teams need SKR03/04 out of the box, GoBD audit trails, and a monthly DATEV export their Steuerberater will accept — most modern SaaS ships with a US chart and hand-waves the rest.",
    solution:
      "Zivvy Deutschland loads SKR03 or SKR04 at company creation, records every posting with the immutable Buchungsjournal GoBD requires, and exports a DATEV Rechnungswesen bundle your Kanzlei drops into the DATEV Belegtransfer.",
    benefits: [
      "SKR03 and SKR04 charts pre-loaded — plus SKR49 for non-profits",
      "GoBD-conform Buchungsjournal with immutable posting IDs",
      "One-click DATEV export via /v1/datev-exports (Buchungssätze + Debitoren/Kreditoren)",
      "ELSTER UStVA and ZM filed straight from the UI",
      "MwSt handled — 19%, 7%, Kleinunternehmer §19, Reverse Charge §13b",
      "Frankfurt data residency and BAFin-friendly retention"
    ],
    useCases: [
      "Send the monthly DATEV bundle to your Steuerberater on the 5th",
      "Generate a GoBD-compliant Verfahrensdokumentation on demand",
      "File UStVA via ELSTER without a middleware",
      "Post EU Reverse-Charge invoices for cross-border services",
      "Reconcile Klarna and Stripe DE payouts against invoices",
      "Print Rechnungen with the §14 UStG fields your prüfer wants"
    ],
    faqs: [
      {
        q: "Is the DATEV export truly the format DATEV expects?",
        a: "Yes. Zivvy emits DATEV Format 7 CSV with the correct Beraternummer, Mandantennummer, and Wirtschaftsjahr headers, plus a paired Belege ZIP."
      },
      {
        q: "How do you handle Kleinunternehmerregelung?",
        a: "Toggle §19 on Company and every invoice suppresses MwSt with the required §19 UStG notice printed on the PDF."
      },
      {
        q: "Where is my data stored?",
        a: "eu-central-1 (Frankfurt). No cross-border transfer, DPA in the DACH template."
      },
      {
        q: "Does GoBD really work with a SaaS?",
        a: "GoBD requires an unchangeable audit trail, not on-prem hosting. Zivvy pins every posting to an immutable Buchungssatz-ID and stores an SHA-256 hash chain — auditors sign off."
      }
    ],
    ctaLabel: "Auf Zivvy Deutschland starten",
    ctaHref: "/login#signup",
    countryCode: "DE",
    flagEmoji: "🇩🇪",
    currency: "EUR",
    currencySymbol: "€",
    primaryLanguage: "de-DE",
    taxRegime: "MwSt",
    region: "EMEA",
    dataResidency: "eu-central-1 (Frankfurt)",
    fiscalYearStart: "January 1",
    complianceHooks: [
      { label: "SKR03 / SKR04 / SKR49 chart of accounts", description: "Loaded automatically on tenant creation." },
      { label: "GoBD Buchungsjournal", description: "Immutable posting IDs with SHA-256 hash chain." },
      { label: "DATEV Rechnungswesen export", description: "Format 7 CSV plus Belege ZIP for the Belegtransfer." },
      { label: "ELSTER UStVA + ZM", description: "Filed via ELSTER-Rich-Client-compatible XML." },
      { label: "Kleinunternehmer §19 UStG", description: "Suppresses VAT with the required legal footer." },
      { label: "Reverse Charge §13b UStG", description: "Automatic on qualifying cross-border services." }
    ],
    regulatoryLinks: [
      { label: "ELSTER", href: "https://www.elster.de/" },
      { label: "BMF (Bundesfinanzministerium)", href: "https://www.bundesfinanzministerium.de/" },
      { label: "DATEV Marketplace", href: "https://www.datev.de/web/de/m/datev-marketplace/" },
      { label: "BAFin", href: "https://www.bafin.de/" }
    ],
    localIntegrations: [
      { slug: "datev", name: "DATEV", category: "Tax" },
      { slug: "klarna", name: "Klarna", category: "Payments" },
      { slug: "stripe", name: "Stripe DE", category: "Payments" },
      { slug: "sofort", name: "Sofort / Klarna Pay Later", category: "Payments" },
      { slug: "gocardless", name: "GoCardless SEPA", category: "Payments" },
      { slug: "commerzbank", name: "Commerzbank", category: "Banking" }
    ],
    proofPoint: { label: "DACH tenants", value: "600+ Steuerberater-approved installs" },
    relatedSolutions: ["manufacturing", "distribution"]
  },
  {
    type: "country",
    slug: "uk",
    title: "Zivvy for the United Kingdom",
    description:
      "MTD-ready VAT, HMRC-compatible bookkeeping, PAYE, and CIS — all from a London tenant on £.",
    keyword: "erp software uk mtd vat",
    problem:
      "UK teams need Making Tax Digital submissions, HMRC PAYE RTI for payroll, and CIS deductions for contractors — held together by four disconnected apps that all disagree on which invoice was paid.",
    solution:
      "Zivvy UK ships an MTD-recognised VAT return, RTI-compliant PAYE, CIS statements on subcontractor payments, and Open Banking reconciliation via TrueLayer.",
    benefits: [
      "HMRC-recognised MTD for VAT — quarterly return in three clicks",
      "PAYE Real-Time Information generated at each payrun",
      "CIS deductions on subcontractor payments with monthly return export",
      "Making Tax Digital for Income Tax (ITSA) — early access",
      "Open Banking via TrueLayer for HSBC, Barclays, Monzo, Starling, Lloyds",
      "GoCardless Bacs Direct Debit for £-mandate customers"
    ],
    useCases: [
      "File the quarterly VAT return through HMRC's MTD API",
      "Generate CIS300 statements at the end of each tax month",
      "Run PAYE with student loan and pension auto-enrolment",
      "Reconcile Starling feeds into your Xero-compatible chart",
      "Handle the domestic reverse charge on construction",
      "Print sales invoices with the UK-required VAT footer"
    ],
    faqs: [
      {
        q: "Are you an HMRC-recognised MTD software provider?",
        a: "Yes. Zivvy passes HMRC's fraud-prevention headers and appears in the recognised software list. VAT returns POST through their production API."
      },
      {
        q: "Can we handle CIS?",
        a: "Yes. Flag a supplier as CIS, choose 20% or 30%, and Zivvy withholds at the Payment Entry then produces the monthly CIS300."
      },
      {
        q: "Where is the tenant hosted?",
        a: "eu-west-2 (London) with a fallback to eu-west-1 (Dublin) — both inside the UK-EU adequacy scope."
      }
    ],
    ctaLabel: "Start on Zivvy UK",
    ctaHref: "/login#signup",
    countryCode: "GB",
    flagEmoji: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    primaryLanguage: "en-GB",
    taxRegime: "VAT (MTD)",
    region: "EMEA",
    dataResidency: "eu-west-2 (London)",
    fiscalYearStart: "April 6",
    complianceHooks: [
      { label: "MTD for VAT", description: "Quarterly return via HMRC's recognised software API." },
      { label: "PAYE RTI", description: "Full Payment Submission on every payrun." },
      { label: "CIS deductions + CIS300", description: "Auto-withhold on subcontractor payments." },
      { label: "Domestic Reverse Charge (Construction)", description: "Applied automatically on qualifying invoices." },
      { label: "Pension auto-enrolment", description: "NEST + Smart Pension exports." },
      { label: "Companies House filing", description: "Confirmation statement CSV export." }
    ],
    regulatoryLinks: [
      { label: "HMRC MTD", href: "https://www.gov.uk/government/collections/making-tax-digital" },
      { label: "Companies House", href: "https://www.gov.uk/government/organisations/companies-house" },
      { label: "The Pensions Regulator", href: "https://www.thepensionsregulator.gov.uk/" }
    ],
    localIntegrations: [
      { slug: "hmrc", name: "HMRC MTD", category: "Tax" },
      { slug: "xero", name: "Xero (import path)", category: "Tax" },
      { slug: "gocardless", name: "GoCardless Bacs", category: "Payments" },
      { slug: "truelayer", name: "TrueLayer", category: "Banking" },
      { slug: "starling", name: "Starling Bank", category: "Banking" },
      { slug: "stripe", name: "Stripe UK", category: "Payments" }
    ],
    proofPoint: { label: "MTD returns filed", value: "12,400+ VAT submissions" },
    relatedSolutions: ["saas", "professional-services", "agencies"]
  },
  {
    type: "country",
    slug: "usa",
    title: "Zivvy for the United States",
    description:
      "State-aware sales tax, ACH via Plaid, 1099 filing, and multi-currency books — from a Virginia tenant on USD.",
    keyword: "erp software usa sales tax",
    problem:
      "US teams juggle Avalara for tax, Bill.com for AP, Gusto for payroll, and a shoebox of 1099-NEC filings — nothing agrees on what's been paid.",
    solution:
      "Zivvy US ships state-by-state sales tax rates via TaxJar, ACH via Plaid + Stripe, W-9/W-8BEN collection at vendor creation, and 1099-NEC/1099-MISC forms ready for the IRS FIRE system.",
    benefits: [
      "Origin- and destination-based sales tax across 50 states + DC",
      "TaxJar-backed nexus tracking as you cross state thresholds",
      "ACH via Plaid Auth + Stripe with same-day settlement",
      "1099-NEC and 1099-MISC generated per vendor, ready for IRS FIRE",
      "Form W-9 / W-8BEN collected at vendor onboarding",
      "Multi-entity roll-ups with intercompany eliminations"
    ],
    useCases: [
      "Charge sales tax that matches the customer's ship-to ZIP",
      "Track nexus as sales cross the economic threshold in each state",
      "Push a vendor payment as an ACH via Plaid + Stripe",
      "Generate every vendor's 1099-NEC at year-end",
      "Reconcile a Mercury or SVB feed into US GAAP books",
      "Consolidate a Delaware C-Corp with its US LLC subsidiaries"
    ],
    faqs: [
      {
        q: "Which sales tax engine do you use?",
        a: "TaxJar by default with an Avalara AvaTax adapter available. Nexus is tracked per state; the sales-tax return is exportable in each state's expected format."
      },
      {
        q: "Can I run payroll?",
        a: "Payroll runs through Gusto or Rippling — Zivvy handles the accounting side (wage journal, tax liability, 941 accrual) and syncs employee records both ways."
      },
      {
        q: "Where is the data hosted?",
        a: "us-east-1 (N. Virginia) with a Californian read replica. SOC 2 Type II and HIPAA-eligible."
      }
    ],
    ctaLabel: "Start on Zivvy US",
    ctaHref: "/login#signup",
    countryCode: "US",
    flagEmoji: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    primaryLanguage: "en-US",
    taxRegime: "State Sales Tax",
    region: "Americas",
    dataResidency: "us-east-1 (N. Virginia)",
    fiscalYearStart: "January 1",
    complianceHooks: [
      { label: "State sales tax (50 + DC)", description: "TaxJar or AvaTax nexus tracking." },
      { label: "1099-NEC / 1099-MISC filing", description: "Generated per vendor for IRS FIRE." },
      { label: "W-9 / W-8BEN collection", description: "At vendor onboarding, stored on Supplier." },
      { label: "ACH via Plaid + Stripe", description: "Same-day and standard rails." },
      { label: "SOC 2 Type II", description: "Annual report available under NDA." },
      { label: "HIPAA eligibility", description: "BAA available on Business tier." }
    ],
    regulatoryLinks: [
      { label: "IRS FIRE system", href: "https://fire.irs.gov/" },
      { label: "SEC EDGAR", href: "https://www.sec.gov/edgar" },
      { label: "State tax portals", href: "https://taxadmin.org/state-tax-agencies" }
    ],
    localIntegrations: [
      { slug: "stripe", name: "Stripe", category: "Payments" },
      { slug: "plaid", name: "Plaid", category: "Banking" },
      { slug: "taxjar", name: "TaxJar", category: "Tax" },
      { slug: "avalara", name: "Avalara", category: "Tax" },
      { slug: "mercury", name: "Mercury", category: "Banking" },
      { slug: "gusto", name: "Gusto", category: "Payments" }
    ],
    proofPoint: { label: "US customers", value: "4,200+ across all 50 states" },
    relatedSolutions: ["saas", "startups", "agencies"]
  },
  {
    type: "country",
    slug: "eu",
    title: "Zivvy for the European Union",
    description:
      "OSS/IOSS VAT, PSD2 Open Banking, SEPA Direct Debit, and eIDAS-signed e-invoicing across 27 member states.",
    keyword: "erp software european union vat",
    problem:
      "Selling across the EU means 27 VAT regimes, OSS thresholds, PSD2 authentication, and the Peppol e-invoicing mandate rolling out country by country. Most tools pick one country and pretend the rest do not exist.",
    solution:
      "Zivvy EU handles OSS/IOSS one-stop-shop returns, connects to PSD2 banks via GoCardless Open Banking, and emits Peppol BIS 3.0 invoices for every mandate market.",
    benefits: [
      "Union OSS quarterly return with per-country VAT breakdown",
      "IOSS for < €150 imports into the EU",
      "Peppol BIS 3.0 e-invoicing for IT, FR, DE, BE mandates",
      "SEPA Direct Debit CORE + B2B via GoCardless",
      "PSD2 Open Banking via Adyen and Klarna Kosma",
      "Multi-currency ledger with EUR-first reporting"
    ],
    useCases: [
      "File the Union OSS return for cross-border B2C sales",
      "Send a Peppol-routed FatturaPA invoice to an Italian customer",
      "Collect SEPA Direct Debit under a signed B2B mandate",
      "Recognise revenue across a multi-country entity structure",
      "Register a UK-EU IOSS number for < €150 fulfilments",
      "Handle the reverse-charge B2B rule per member state"
    ],
    faqs: [
      {
        q: "Does the OSS return actually submit?",
        a: "It submits through the Mitgliedstaat der Identifizierung you choose — Ireland, Germany, and the Netherlands are supported directly today."
      },
      {
        q: "What about the Peppol mandate?",
        a: "Zivvy is a Peppol Access Point via a certified partner. Once you register your ID, every issued invoice can be routed over Peppol."
      },
      {
        q: "How do you handle 27 different VAT rules?",
        a: "Every EU country has a seeded Tax Category and Rule set — reduced, super-reduced, zero, and reverse-charge all mapped."
      }
    ],
    ctaLabel: "Start on Zivvy EU",
    ctaHref: "/login#signup",
    countryCode: "EU",
    flagEmoji: "🇪🇺",
    currency: "EUR",
    currencySymbol: "€",
    primaryLanguage: "en-IE",
    taxRegime: "VAT (OSS)",
    region: "EMEA",
    dataResidency: "eu-central-1 (Frankfurt) + eu-west-1 (Dublin)",
    fiscalYearStart: "January 1",
    complianceHooks: [
      { label: "OSS / IOSS return", description: "Union and Import one-stop-shop returns." },
      { label: "Peppol BIS 3.0 e-invoicing", description: "Certified Access Point for mandate countries." },
      { label: "SEPA Direct Debit", description: "CORE and B2B mandate collection." },
      { label: "PSD2 Strong Customer Auth", description: "SCA-compliant payment flow." },
      { label: "GDPR data-subject flows", description: "Export / erase per Article 15/17." },
      { label: "27-country VAT rate table", description: "Reduced, super-reduced, reverse charge included." }
    ],
    regulatoryLinks: [
      { label: "OSS / IOSS", href: "https://vat-one-stop-shop.ec.europa.eu/" },
      { label: "Peppol", href: "https://peppol.org/" },
      { label: "European Data Protection Board", href: "https://edpb.europa.eu/" }
    ],
    localIntegrations: [
      { slug: "adyen", name: "Adyen", category: "Payments" },
      { slug: "mollie", name: "Mollie", category: "Payments" },
      { slug: "gocardless", name: "GoCardless SEPA", category: "Payments" },
      { slug: "klarna", name: "Klarna Kosma", category: "Banking" },
      { slug: "stripe", name: "Stripe EU", category: "Payments" },
      { slug: "peppol", name: "Peppol Access Point", category: "Tax" }
    ],
    proofPoint: { label: "Cross-border tenants", value: "2,100+ EU-27 sellers" },
    relatedSolutions: ["germany", "saas", "distribution"]
  },
  {
    type: "country",
    slug: "singapore",
    title: "Zivvy for Singapore",
    description:
      "IRAS GST, InvoiceNow (Peppol) e-invoicing, CPF-linked payroll, and MAS-compliant banking — from an SG tenant on SGD.",
    keyword: "erp software singapore iras gst",
    problem:
      "Singapore SMEs need InvoiceNow-registered e-invoicing, IRAS GST F5 returns, CPF-linked payroll, and MAS-approved payment flows — usually three vendors plus a lot of manual Xero patching.",
    solution:
      "Zivvy Singapore is InvoiceNow-registered on the Peppol network, files GST F5 straight to IRAS, and runs a CPF-aware payroll that matches the ministry's contribution tables.",
    benefits: [
      "InvoiceNow (Peppol) e-invoicing routed via IMDA's network",
      "IRAS GST F5 quarterly return with GST F7 correction path",
      "CPF-linked payroll for Ordinary and Additional Wages",
      "PayNow QR on every Sales Invoice via a UEN linkage",
      "MAS-compliant KYC on customer onboarding",
      "Multi-currency ledger with SGD as the base"
    ],
    useCases: [
      "Send a Peppol invoice to a government buyer via InvoiceNow",
      "File GST F5 for the quarter without leaving Zivvy",
      "Run CPF-linked payroll for local and foreign employees",
      "Print PayNow QR codes for every outstanding invoice",
      "Track BAS-equivalent adjustments during the year-end audit"
    ],
    faqs: [
      {
        q: "Are you registered on the InvoiceNow / Peppol network?",
        a: "Yes. Zivvy operates as a Peppol Service Provider approved by IMDA. Registered UENs can send and receive on the network from day one."
      },
      {
        q: "Does GST F5 file through myTax Portal?",
        a: "The return is filed via IRAS API for eligible corporates and exported in the myTax Portal CSV format for the rest."
      }
    ],
    ctaLabel: "Start on Zivvy Singapore",
    ctaHref: "/login#signup",
    countryCode: "SG",
    flagEmoji: "🇸🇬",
    currency: "SGD",
    currencySymbol: "S$",
    primaryLanguage: "en-SG",
    taxRegime: "GST (IRAS)",
    region: "APAC",
    dataResidency: "ap-southeast-1 (Singapore)",
    fiscalYearStart: "Configurable (default January 1)",
    complianceHooks: [
      { label: "IRAS GST F5 / F7 return", description: "Quarterly filing and correction path." },
      { label: "InvoiceNow (Peppol)", description: "IMDA-approved e-invoicing." },
      { label: "CPF contribution table", description: "Auto-computed for OW and AW." },
      { label: "PayNow QR", description: "Embedded on every SGD invoice." },
      { label: "IRAS AIS submission", description: "Employer income reporting." },
      { label: "MAS TRM requirements", description: "For finance-sector installs." }
    ],
    regulatoryLinks: [
      { label: "IRAS", href: "https://www.iras.gov.sg/" },
      { label: "IMDA InvoiceNow", href: "https://www.imda.gov.sg/how-we-can-help/nationwide-e-invoicing-framework" },
      { label: "CPF Board", href: "https://www.cpf.gov.sg/" },
      { label: "MAS", href: "https://www.mas.gov.sg/" }
    ],
    localIntegrations: [
      { slug: "stripe", name: "Stripe SG", category: "Payments" },
      { slug: "paynow", name: "PayNow", category: "Payments" },
      { slug: "dbs", name: "DBS Bank", category: "Banking" },
      { slug: "iras", name: "IRAS", category: "Tax" },
      { slug: "peppol", name: "Peppol Access Point", category: "Tax" }
    ],
    proofPoint: { label: "APAC tenants", value: "700+ across SEA" },
    relatedSolutions: ["saas", "distribution", "startups"]
  },
  {
    type: "country",
    slug: "uae",
    title: "Zivvy for the United Arab Emirates",
    description:
      "FTA VAT, e-invoicing readiness, WPS-compatible payroll, and bilingual Arabic/English printing — from a Dubai tenant on AED.",
    keyword: "erp software uae fta vat",
    problem:
      "UAE companies need FTA VAT filing, WPS-compatible payroll, and Arabic-first invoicing — plus the incoming e-invoicing mandate. Most Western ERPs cannot even print RTL properly.",
    solution:
      "Zivvy UAE is bilingual Arabic/English from the ledger up, files VAT201 through the FTA e-Services portal, and generates WPS-compatible SIF files for MOL upload.",
    benefits: [
      "Bilingual Arabic/English invoices with RTL layout support",
      "VAT201 filing straight through the FTA portal",
      "WPS-compatible SIF payroll file for MOL upload",
      "Ready for the UAE e-invoicing mandate (Phase 1, 2026)",
      "AED as the base ledger currency with multi-currency revaluation",
      "Free-zone and mainland dual-entity support"
    ],
    useCases: [
      "File the quarterly VAT201 return without leaving Zivvy",
      "Generate a WPS SIF file for every payrun",
      "Print RTL Arabic invoices for local B2B customers",
      "Route intra-GCC B2B invoices with the correct zero-rating",
      "Handle designated-zone rules under UAE VAT law"
    ],
    faqs: [
      {
        q: "Are you ready for the UAE e-invoicing mandate?",
        a: "Yes. Zivvy is engaged with the accredited service provider programme — Phase 1 goes live in mid-2026 with a straight-through submission API."
      },
      {
        q: "Does WPS work with any bank?",
        a: "The SIF file is bank-agnostic — Emirates NBD, ADCB, FAB, Mashreq, and Dubai Islamic Bank are all pre-mapped."
      }
    ],
    ctaLabel: "Start on Zivvy UAE",
    ctaHref: "/login#signup",
    countryCode: "AE",
    flagEmoji: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    primaryLanguage: "en-AE",
    secondaryLocale: "ar-AE",
    taxRegime: "FTA VAT",
    region: "MENA",
    dataResidency: "me-central-1 (UAE)",
    fiscalYearStart: "January 1 (configurable to Hijri)",
    complianceHooks: [
      { label: "FTA VAT201", description: "Quarterly return via the e-Services portal." },
      { label: "WPS SIF export", description: "Payroll SIF file for MOL upload." },
      { label: "e-Invoicing mandate", description: "Accredited SP integration, Phase 1 2026." },
      { label: "Emiratisation reporting", description: "MOHRE-format headcount reports." },
      { label: "Designated-zone rules", description: "Free-zone vs mainland VAT handling." },
      { label: "Arabic-first printing", description: "RTL layout for invoices, DCs, POs." }
    ],
    regulatoryLinks: [
      { label: "Federal Tax Authority", href: "https://tax.gov.ae/" },
      { label: "MOHRE (WPS)", href: "https://www.mohre.gov.ae/" }
    ],
    localIntegrations: [
      { slug: "emiratesnbd", name: "Emirates NBD", category: "Banking" },
      { slug: "adcb", name: "ADCB", category: "Banking" },
      { slug: "stripe", name: "Stripe UAE", category: "Payments" },
      { slug: "telr", name: "Telr", category: "Payments" },
      { slug: "networkint", name: "Network International", category: "Payments" }
    ],
    proofPoint: { label: "MENA tenants", value: "350+ across the GCC" },
    relatedSolutions: ["retail", "distribution", "professional-services"]
  },
  {
    type: "country",
    slug: "canada",
    title: "Zivvy for Canada",
    description:
      "GST/HST/PST across provinces, CRA-ready T4 and T5018, bilingual EN/FR invoices, and Interac payments — from a Montreal tenant on CAD.",
    keyword: "erp software canada gst hst",
    problem:
      "Canadian teams juggle federal GST/HST plus provincial PST/QST, T4 slips, T5018 for contractors, and a French/English printing requirement — most tools handle one province and shrug at the rest.",
    solution:
      "Zivvy Canada ships a GST/HST/PST/QST rate table by province, generates T4/T5018 XML for CRA Internet File Transfer, and prints every document in EN/FR by default.",
    benefits: [
      "GST, HST, PST, and QST rates seeded per province",
      "T4 and T5018 XML for CRA Internet File Transfer",
      "Bilingual EN/FR invoices with Quebec-compliant layout",
      "Interac e-Transfer reconciliation via banking feed",
      "CAD ledger with multi-currency revaluation",
      "PIPEDA data-subject flows out of the box"
    ],
    useCases: [
      "File the GST34 return for a mixed HST-PST customer base",
      "Generate T5018 for every subcontractor at year-end",
      "Meet Quebec's French-first invoicing requirement",
      "Reconcile Interac e-Transfer deposits into the ledger",
      "Handle Ontario HST vs. Alberta GST-only invoicing"
    ],
    faqs: [
      {
        q: "How do you handle Quebec's QST?",
        a: "QST is tracked as a separate line under Revenu Québec — the report exports in the ClicSÉQUR format they expect."
      },
      {
        q: "Is the French translation actually acceptable in Quebec?",
        a: "The invoice layout meets the Office québécois de la langue française's requirements — French takes visual precedence, English is optional."
      }
    ],
    ctaLabel: "Start on Zivvy Canada",
    ctaHref: "/login#signup",
    countryCode: "CA",
    flagEmoji: "🇨🇦",
    currency: "CAD",
    currencySymbol: "C$",
    primaryLanguage: "en-CA",
    secondaryLocale: "fr-CA",
    taxRegime: "GST/HST + PST/QST",
    region: "Americas",
    dataResidency: "ca-central-1 (Montreal)",
    fiscalYearStart: "January 1",
    complianceHooks: [
      { label: "GST34 return", description: "Quarterly or annual, based on registration." },
      { label: "QST return (Revenu Québec)", description: "ClicSÉQUR-format export." },
      { label: "T4 / T5018 XML", description: "For CRA Internet File Transfer." },
      { label: "Bilingual EN/FR printing", description: "Quebec-compliant layout by default." },
      { label: "PIPEDA data-subject flows", description: "Access + rectification requests." }
    ],
    regulatoryLinks: [
      { label: "CRA", href: "https://www.canada.ca/en/revenue-agency.html" },
      { label: "Revenu Québec", href: "https://www.revenuquebec.ca/" }
    ],
    localIntegrations: [
      { slug: "stripe", name: "Stripe CA", category: "Payments" },
      { slug: "plaid", name: "Plaid (Canada)", category: "Banking" },
      { slug: "rbc", name: "RBC", category: "Banking" },
      { slug: "cra", name: "CRA", category: "Tax" }
    ],
    proofPoint: { label: "Canadian tenants", value: "500+ across all provinces" },
    relatedSolutions: ["saas", "professional-services", "distribution"]
  },
  {
    type: "country",
    slug: "australia",
    title: "Zivvy for Australia",
    description:
      "BAS-ready GST, ATO STP2 payroll, Super Stream contributions, and PayID/PayTo — from a Sydney tenant on AUD.",
    keyword: "erp software australia bas gst",
    problem:
      "Australian businesses need to lodge BAS, file STP2 with the ATO on every payrun, remit super via SuperStream, and increasingly accept PayTo — none of which line up in the typical stack.",
    solution:
      "Zivvy Australia is an ATO-registered SBR software, lodges BAS through the SBR channel, files STP2 payload on every payrun, and generates SuperStream-compliant contribution files.",
    benefits: [
      "BAS lodgement via the SBR channel — ATO-registered software",
      "Single Touch Payroll Phase 2 on every payrun",
      "SuperStream contribution files for every clearing house",
      "PayID and PayTo collection over NPP",
      "AUD ledger with USD/NZD revaluation",
      "Fair Work-aware employee record structure"
    ],
    useCases: [
      "Lodge the quarterly BAS from Zivvy without an agent portal",
      "File STP2 every payday",
      "Remit super via SuperChoice or Beam clearing houses",
      "Take PayTo mandates on subscription customers",
      "Handle contractor payments with the correct ABN checks"
    ],
    faqs: [
      {
        q: "Are you registered with the ATO's SBR channel?",
        a: "Yes. Zivvy is on the ATO's list of registered STP-enabled software products. STP2 events go over SBR."
      },
      {
        q: "Which super clearing houses are supported?",
        a: "SuperChoice, Beam, and the ATO's Small Business Superannuation Clearing House for < 20-employee businesses."
      }
    ],
    ctaLabel: "Start on Zivvy Australia",
    ctaHref: "/login#signup",
    countryCode: "AU",
    flagEmoji: "🇦🇺",
    currency: "AUD",
    currencySymbol: "A$",
    primaryLanguage: "en-AU",
    taxRegime: "GST (BAS)",
    region: "ANZ",
    dataResidency: "ap-southeast-2 (Sydney)",
    fiscalYearStart: "July 1",
    complianceHooks: [
      { label: "BAS lodgement", description: "Quarterly or monthly via SBR." },
      { label: "STP2 payroll reporting", description: "Real-time employer submission." },
      { label: "SuperStream contributions", description: "Compliant contribution file." },
      { label: "TFN validation", description: "Employee TFN check on onboarding." },
      { label: "PAYG withholding", description: "Auto on employees and contractors." }
    ],
    regulatoryLinks: [
      { label: "ATO", href: "https://www.ato.gov.au/" },
      { label: "Fair Work", href: "https://www.fairwork.gov.au/" }
    ],
    localIntegrations: [
      { slug: "stripe", name: "Stripe AU", category: "Payments" },
      { slug: "commbank", name: "CommBank", category: "Banking" },
      { slug: "beam", name: "Beam Super", category: "Payments" },
      { slug: "payto", name: "PayTo (NPP)", category: "Payments" }
    ],
    proofPoint: { label: "ANZ tenants", value: "480+ across AU and NZ" },
    relatedSolutions: ["retail", "professional-services", "saas"]
  },
  {
    type: "country",
    slug: "brazil",
    title: "Zivvy for Brazil",
    description:
      "NFe/NFSe emission, SPED-ready bookkeeping, ICMS/PIS/COFINS handling, and PIX payments — from a São Paulo tenant on BRL.",
    keyword: "erp software brazil nfe icms",
    problem:
      "Brazilian businesses need NFe and NFSe emission per municipality, SPED for the tax authority, ICMS across 27 states plus DF, and PIX for everything else — usually five vendors held together with a lot of prayer.",
    solution:
      "Zivvy Brasil emits NFe and NFSe against SEFAZ per state, generates SPED Fiscal and SPED Contribuições, and reconciles PIX QR codes into Payment Entries.",
    benefits: [
      "NFe/NFCe emission with per-state SEFAZ certificates",
      "NFSe per municipality — São Paulo, Rio, and 1,000+ others",
      "SPED Fiscal and SPED Contribuições export",
      "ICMS, IPI, PIS, COFINS, ISS handled per operation",
      "PIX QR on every invoice — dynamic and static",
      "BRL base ledger with USD revaluation on foreign accounts"
    ],
    useCases: [
      "Emit NFe against São Paulo SEFAZ with the correct CFOP",
      "Generate SPED Fiscal for the monthly EFD filing",
      "Handle ICMS-ST substitution on interstate sales",
      "Print DANFE alongside the electronic XML",
      "Accept PIX dinâmico QR from a Sales Invoice"
    ],
    faqs: [
      {
        q: "Do you actually connect to SEFAZ?",
        a: "Yes. Zivvy uses your A1 certificate to sign and submit NFe XML directly to the SEFAZ web service in each state."
      },
      {
        q: "How is NFSe handled — every municipality is different?",
        a: "We support the top 20 NFSe schemas out of the box (São Paulo, Rio, Belo Horizonte, ...) and integrate with e-Nfs and Nota Control for long-tail municipalities."
      }
    ],
    ctaLabel: "Comece com Zivvy Brasil",
    ctaHref: "/login#signup",
    countryCode: "BR",
    flagEmoji: "🇧🇷",
    currency: "BRL",
    currencySymbol: "R$",
    primaryLanguage: "pt-BR",
    taxRegime: "NFe / ICMS",
    region: "Americas",
    dataResidency: "sa-east-1 (São Paulo)",
    fiscalYearStart: "January 1",
    complianceHooks: [
      { label: "NFe / NFCe emission", description: "Signed XML to SEFAZ per state." },
      { label: "NFSe per município", description: "Top 20 schemas + long-tail bridge." },
      { label: "SPED Fiscal + SPED Contribuições", description: "Monthly EFD export." },
      { label: "ICMS-ST substitution", description: "Interstate ST computation." },
      { label: "PIX dinâmico QR", description: "On every open Sales Invoice." },
      { label: "eSocial for payroll", description: "S-2200 series events." }
    ],
    regulatoryLinks: [
      { label: "Portal SPED", href: "https://sped.rfb.gov.br/" },
      { label: "Portal Nacional NFSe", href: "https://www.nfse.gov.br/" }
    ],
    localIntegrations: [
      { slug: "pix", name: "PIX (BCB)", category: "Payments" },
      { slug: "sefaz", name: "SEFAZ", category: "Tax" },
      { slug: "stripe", name: "Stripe Brasil", category: "Payments" },
      { slug: "mercadopago", name: "Mercado Pago", category: "Payments" },
      { slug: "itau", name: "Itaú", category: "Banking" }
    ],
    proofPoint: { label: "LATAM tenants", value: "280+ across Brasil" },
    relatedSolutions: ["retail", "distribution", "manufacturing"]
  }
];

const industryProfiles: IndustrySolutionProfile[] = [
  {
    type: "industry",
    slug: "manufacturing",
    title: "Zivvy for Manufacturers",
    description:
      "BOM-aware work orders, quality gates, and shop-floor tracking — with COGS that actually matches what you built.",
    keyword: "manufacturing erp software",
    problem:
      "Discrete manufacturers lose the plot between BOM revisions, shop-floor variance, and the accounting close. By the time COGS lands in the P&L, no one remembers which lot ate the scrap.",
    solution:
      "Zivvy Manufacturing ties every work order to its exact BOM revision, records material issue against the routing, and posts variance to a scrap account you can drill down to the operation.",
    benefits: [
      "Multi-level BOMs with revision control and effective dates",
      "Work orders with routing, QC gates, and shift assignments",
      "Backflushing tied to routing operations, not headers",
      "Scrap and variance posted per operation, not per WO",
      "Sub-contracting jobs with material send-out and receipt",
      "OEE, first-pass yield, and on-time delivery dashboards"
    ],
    useCases: [
      "Freeze a BOM revision before releasing a WO",
      "Log material issue against a routing operation",
      "Fail a QC gate and re-route the WO automatically",
      "Send raw material to a subcontractor and reconcile finished return",
      "Roll standard cost quarterly against your latest BOM",
      "Track OEE per work center in the shop-floor dashboard"
    ],
    faqs: [
      {
        q: "How deep does the routing go?",
        a: "As deep as you need — every operation has a work center, standard time, and setup time. Actual times are logged from the shop-floor tablet."
      },
      {
        q: "Do you support process manufacturing?",
        a: "We're a discrete-manufacturing product first. Recipe-based process manufacturing is on the roadmap and available in a limited preview."
      },
      {
        q: "How does subcontracting work?",
        a: "You issue a Subcontracting PO with the sent-material breakdown; the subcontract receipt closes the loop and posts the value-add to the finished good."
      }
    ],
    ctaLabel: "Book a shop-floor tour",
    ctaHref: "/contact",
    industryVertical: "Discrete Manufacturing",
    sizeSweetSpot: "10 – 250 employees",
    painPoints: [
      "BOM revision drift",
      "COGS variance",
      "Job costing",
      "Scrap tracking",
      "Shift utilization"
    ],
    regulatoryContext: "ISO 9001",
    keyModules: [
      { slug: "workflow-builder", title: "Work orders", blurb: "BOM-aware routing with QC gates and shift assignments." },
      { slug: "inventory-management", title: "Inventory", blurb: "Bin-level stock with FIFO / moving-average valuation." },
      { slug: "reporting-dashboard", title: "OEE dashboard", blurb: "Overall equipment effectiveness per work center." },
      { slug: "workflow-builder", title: "Subcontracting", blurb: "Material send-out and finished-return in one flow." },
      { slug: "analytics", title: "Scrap analytics", blurb: "Variance posted per operation, drillable to the WO." },
      { slug: "workflow-builder", title: "Quality inspection", blurb: "Incoming, in-process, and outgoing inspection." }
    ],
    incumbents: ["Tally + Excel", "SAP Business One", "Odoo Manufacturing"],
    namedDashboards: ["OEE", "First-pass yield", "On-time delivery", "Scrap %", "WIP aging"],
    acvBand: "$12k – $60k ACV",
    proofPoint: { label: "Shop-floor tenants", value: "620+ manufacturers" },
    relatedSolutions: ["india", "germany", "distribution"]
  },
  {
    type: "industry",
    slug: "distribution",
    title: "Zivvy for Distributors",
    description:
      "Warehouse zones, pick lists, delivery routes, and multi-currency AR — for the businesses that move product for a living.",
    keyword: "distribution erp software",
    problem:
      "Distributors lose margin between the pick and the invoice. Pickers walk long paths, delivery routes get re-optimized in a spreadsheet, and cash arrives days after the receivable is written off.",
    solution:
      "Zivvy Distribution runs zone-aware pick lists, wave-picks by delivery route, and reconciles cash-on-delivery back into the customer ledger the same day.",
    benefits: [
      "Zone- and bin-aware pick lists with a printable route",
      "Wave picking that groups by delivery vehicle",
      "Pack-station verification against the Sales Order",
      "Delivery route planning with a Google Maps handoff",
      "Cash-on-delivery reconciled the same day",
      "3PL integrations — pull confirmations back into the ledger"
    ],
    useCases: [
      "Print a bin-optimized pick list for the morning wave",
      "Verify a pack against the SO barcode-by-barcode",
      "Assign a route sheet to a delivery vehicle",
      "Reconcile COD collections at end-of-day",
      "Push a shipment to Shiprocket / Delhivery in one click",
      "Track fill rate per SKU and per customer"
    ],
    faqs: [
      {
        q: "Do you support wave picking?",
        a: "Yes. You can build a wave by delivery route, priority, or carrier. The wave prints one master pick list with sub-cards per order."
      },
      {
        q: "Which 3PLs do you integrate with?",
        a: "Shiprocket, Delhivery, Blue Dart, DHL, and FedEx via native connectors — anything else via a webhook adapter."
      }
    ],
    ctaLabel: "Talk distribution setup",
    ctaHref: "/contact",
    industryVertical: "Wholesale Distribution",
    sizeSweetSpot: "20 – 500 employees",
    painPoints: [
      "Long picker paths",
      "COD reconciliation",
      "Route optimization",
      "Fill-rate drift",
      "Stale inventory"
    ],
    keyModules: [
      { slug: "inventory-management", title: "Warehouse", blurb: "Zone- and bin-aware storage across sites." },
      { slug: "workflow-builder", title: "Pick / Pack / Ship", blurb: "Wave picking with barcode verification." },
      { slug: "workflow-builder", title: "Delivery routes", blurb: "Route sheets with Google Maps handoff." },
      { slug: "reporting-dashboard", title: "Fill-rate dashboard", blurb: "SKU-level fill rate over rolling windows." },
      { slug: "analytics", title: "Aged inventory", blurb: "Slow-mover and dead-stock analytics." },
      { slug: "workflow-builder", title: "COD reconciliation", blurb: "End-of-day cash reconciliation." }
    ],
    incumbents: ["Unicommerce", "Vinculum", "TradeGecko / QuickBooks Commerce"],
    namedDashboards: ["Fill rate", "OTIF", "Aged inventory", "COD outstanding"],
    proofPoint: { label: "Warehouses live", value: "900+ SKUs picked/day median" },
    relatedSolutions: ["india", "retail", "manufacturing"]
  },
  {
    type: "industry",
    slug: "professional-services",
    title: "Zivvy for Professional Services",
    description:
      "Timesheets tied to projects, retainer billing, utilization dashboards, and revenue recognition for services firms.",
    keyword: "professional services automation software",
    problem:
      "Consulting, agency, and services firms lose 8–15% of billable hours to fuzzy timesheets, retainers that drift out of scope, and a month-end close that treats every project as a black box.",
    solution:
      "Zivvy PSA turns every project into a live P&L — hours land against the WBS the same day, retainers draw down against booked scope, and revenue is recognized as-earned by policy.",
    benefits: [
      "Timesheets tied to WBS, not just projects",
      "Retainer contracts with monthly draw-down",
      "T&M, fixed-fee, and milestone billing on one project",
      "Utilization by person, role, and practice",
      "Revenue recognition by percentage-of-completion or milestone",
      "Change-order workflow with approval gates"
    ],
    useCases: [
      "Log a billable hour against a WBS phase on the mobile app",
      "Auto-generate a retainer draw-down invoice on the 1st",
      "Split-bill a milestone across two client entities",
      "Track utilization per consultant against a target",
      "Recognize revenue on a fixed-fee project as work completes",
      "Move an at-risk project through the change-order gate"
    ],
    faqs: [
      {
        q: "Can we bill in multiple currencies on one project?",
        a: "Yes. Currency is per-invoice, not per-project — bill USD for the parent and EUR for a subsidiary's spin-off phase."
      },
      {
        q: "Do you handle percentage-of-completion revenue?",
        a: "Yes. You pick the recognition policy per contract — POC, milestone, or ratably over the term."
      }
    ],
    ctaLabel: "See PSA in action",
    ctaHref: "/product-tour",
    industryVertical: "Professional Services",
    sizeSweetSpot: "5 – 200 consultants",
    painPoints: [
      "Missing timesheets",
      "Retainer drift",
      "Utilization visibility",
      "Milestone revenue",
      "Change-order chaos"
    ],
    keyModules: [
      { slug: "workflow-builder", title: "Projects", blurb: "WBS with phases, tasks, and role-loaded plans." },
      { slug: "workflow-builder", title: "Timesheets", blurb: "Mobile, browser, and calendar-driven capture." },
      { slug: "workflow-builder", title: "Retainer billing", blurb: "Draw-downs with roll-over rules." },
      { slug: "reporting-dashboard", title: "Utilization", blurb: "Per-person and per-role targets." },
      { slug: "analytics", title: "Project P&L", blurb: "Live margin per project and per client." },
      { slug: "workflow-builder", title: "Revenue recognition", blurb: "POC or milestone-driven." }
    ],
    incumbents: ["Harvest + QuickBooks", "Kantata", "Deltek Vantagepoint"],
    namedDashboards: ["Utilization", "Project margin", "Realized rate", "Backlog"],
    acvBand: "$8k – $30k ACV",
    proofPoint: { label: "Services firms", value: "400+ agencies and consultancies" },
    relatedSolutions: ["agencies", "finance-teams", "startups"]
  },
  {
    type: "industry",
    slug: "saas",
    title: "Zivvy for SaaS",
    description:
      "MRR, ARR, churn, and ASC 606 revenue recognition — with the subscription lifecycle wired straight into the ledger.",
    keyword: "saas erp accounting software",
    problem:
      "SaaS finance teams pivot Stripe exports into Google Sheets, then re-pivot them for the board. The number changes every time someone touches it, and ASC 606 becomes an audit finding.",
    solution:
      "Zivvy SaaS models subscriptions natively — the invoice comes from a Subscription doctype, revenue is recognized ratably per ASC 606, and the MRR/ARR/churn dashboard reads directly from the subscription ledger.",
    benefits: [
      "Subscription doctype with proration and mid-cycle changes",
      "ASC 606-compliant revenue recognition (ratable + performance)",
      "MRR, ARR, net-new, expansion, and churn out of the box",
      "Stripe Billing sync with reconciled payouts to the ledger",
      "Dunning that respects card-decline and renewal rules",
      "Cohort retention and LTV against real cash"
    ],
    useCases: [
      "Prorate a mid-cycle plan change and settle the deltas",
      "Recognize an annual invoice ratably across 12 months",
      "Read live MRR at the top of the dashboard",
      "Dun a churned customer through email, in-app, and CS",
      "Compute LTV against realized cash, not booked revenue",
      "Cut a revenue-share report for reseller partners"
    ],
    faqs: [
      {
        q: "Is your rev-rec actually ASC 606 compliant?",
        a: "Yes. Each performance obligation has its own recognition schedule — you can review the schedule per contract during the close."
      },
      {
        q: "How do you handle Stripe fees?",
        a: "Stripe fees post to a separate expense account per payout, so gross MRR isn't polluted by processing fees."
      }
    ],
    ctaLabel: "Wire up subscriptions",
    ctaHref: "/login#signup",
    industryVertical: "SaaS",
    sizeSweetSpot: "5 – 100 employees, up to $30M ARR",
    painPoints: [
      "MRR drift",
      "ASC 606 nightmares",
      "Stripe → GL sync",
      "Churn attribution",
      "Cohort LTV"
    ],
    keyModules: [
      { slug: "workflow-builder", title: "Subscriptions", blurb: "Native subscription doctype with proration." },
      { slug: "analytics", title: "Rev-rec engine", blurb: "ASC 606-compliant per performance obligation." },
      { slug: "reporting-dashboard", title: "MRR / ARR dashboard", blurb: "Net-new, expansion, contraction, churn." },
      { slug: "team-collaboration", title: "Dunning", blurb: "Multi-channel with card-decline handling." },
      { slug: "analytics", title: "Cohort retention", blurb: "LTV against realized cash." },
      { slug: "workflow-builder", title: "Reseller share", blurb: "Revenue-share for channel partners." }
    ],
    incumbents: ["Stripe + Google Sheets", "Chargebee + QuickBooks", "Maxio"],
    namedDashboards: ["MRR", "ARR", "Net revenue retention", "Cohort LTV"],
    acvBand: "$6k – $24k ACV",
    proofPoint: { label: "ARR under management", value: "$180M+ across tenants" },
    relatedSolutions: ["usa", "startups", "developers"]
  },
  {
    type: "industry",
    slug: "retail",
    title: "Zivvy for Retail",
    description:
      "POS-integrated inventory, seasonal buying plans, and same-day reconciliation across every store and channel.",
    keyword: "retail erp pos software",
    problem:
      "Multi-store retailers lose sight of stock across POS, marketplace, and warehouse. Seasonal buying happens on gut, and shrink shows up two months later in the P&L.",
    solution:
      "Zivvy Retail plugs into every POS and marketplace, keeps a live SKU-level stock ledger, and runs seasonal buying plans with an open-to-buy budget you actually respect.",
    benefits: [
      "POS integrations — Square, Shopify POS, Vend, and DIY",
      "Marketplace channels — Amazon, Flipkart, Meesho, Myntra",
      "Open-to-buy plans against seasonal budgets",
      "Same-day sales-audit and cash reconciliation",
      "Shrink and returns tracked by SKU, store, and cashier",
      "Style-color-size matrix for apparel"
    ],
    useCases: [
      "Post a store's end-of-day sales to the GL by 6:15pm",
      "Reject a PO that breaches the season's open-to-buy",
      "Reconcile Shopify payouts against store-level revenue",
      "Track shrink by cashier over rolling 30 days",
      "Manage an apparel matrix — 12 sizes × 8 colors × 40 styles",
      "Route returns to a repair, resale, or write-off bin"
    ],
    faqs: [
      {
        q: "Which POS systems integrate natively?",
        a: "Square, Shopify POS, Lightspeed Retail, and Vend — plus a REST bridge for anything sending an itemized checkout webhook."
      },
      {
        q: "Do you handle style-color-size?",
        a: "Yes. Every SKU can be a variant of a style; the buying plan and open-to-buy operate at the style level."
      }
    ],
    ctaLabel: "See a retail store setup",
    ctaHref: "/product-tour",
    industryVertical: "Retail",
    sizeSweetSpot: "1 – 50 stores",
    painPoints: [
      "Multi-channel stock",
      "Seasonal buying",
      "Shrink tracking",
      "Same-day close",
      "Return handling"
    ],
    keyModules: [
      { slug: "inventory-management", title: "Stock ledger", blurb: "Live SKU-level across stores and channels." },
      { slug: "workflow-builder", title: "POS bridge", blurb: "Square, Shopify POS, Vend, Lightspeed." },
      { slug: "reporting-dashboard", title: "Open-to-buy", blurb: "Seasonal buying plans with budgets." },
      { slug: "analytics", title: "Shrink analytics", blurb: "By SKU, store, and cashier." },
      { slug: "workflow-builder", title: "Marketplace sync", blurb: "Amazon, Flipkart, Meesho listings." },
      { slug: "workflow-builder", title: "Returns triage", blurb: "Repair, resale, write-off bins." }
    ],
    incumbents: ["Vend + Xero", "Shopify + QuickBooks", "Lightspeed Retail"],
    namedDashboards: ["Sell-through", "Open-to-buy remaining", "Shrink %", "Sell-out days"],
    proofPoint: { label: "Retail SKUs tracked", value: "8.4M+ across tenants" },
    relatedSolutions: ["india", "distribution", "brazil"]
  }
];

const teamProfiles: TeamSolutionProfile[] = [
  {
    type: "team",
    slug: "startups",
    title: "Zivvy for Startups",
    description:
      "Founder-mode operations from first customer to Series A — with two free seats and no card to start.",
    keyword: "startup operations erp software",
    problem:
      "Startups outgrow spreadsheets in month three, then get quoted six-figure implementations by enterprise ERPs they'll grow into in year five. The gap is where founders lose their weekends.",
    solution:
      "Zivvy gives founders a full operating tenant on the Free tier — sales, CRM, basic stock, and invoicing — and unlocks the depth they need only when the workflow demands it.",
    benefits: [
      "Two free seats forever, no card required",
      "One tenant covers CRM, invoicing, and stock from day one",
      "Upgrade to Pro when the workflow needs it — no replatforming",
      "Founders' dashboard: cash, pipeline, and receivables in one view",
      "Public API on every plan — build automations from week one",
      "Multi-currency ready when the first international customer signs"
    ],
    useCases: [
      "Send the first invoice on Friday, get paid Monday",
      "Track a Series A pipeline of 40 investors alongside customers",
      "Move from Sheets to Zivvy in a working session",
      "Wire Slack alerts on every closed-won deal",
      "Start multi-currency the day the first EU customer signs"
    ],
    faqs: [
      {
        q: "How long does 'Free forever' actually last?",
        a: "Indefinitely. Two seats, sales + CRM + basic stock — no trial expiry. You upgrade when you need Pro-tier depth, not because the timer ran out."
      },
      {
        q: "Can we move data if we outgrow it?",
        a: "Yes. Everything is a REST resource — GET, backup, and go. No lock-in on any tier."
      }
    ],
    ctaLabel: "Start on Free",
    ctaHref: "/login#signup",
    role: "Solo founder / Ops-of-one",
    teamSize: "1 – 10 people",
    seniority: "founder",
    dailyRituals: [
      "Review overnight pipeline additions",
      "Chase two overdue invoices",
      "Check runway against the burn line",
      "Post the weekly investor update"
    ],
    replacesTools: ["Google Sheets", "Notion", "HubSpot Free", "QuickBooks Simple Start"],
    minimumTier: "Free",
    northStarMetric: "Days of runway",
    proofPoint: { label: "Startups on Free", value: "1,200+ tenants" },
    relatedSolutions: ["saas", "developers", "usa"]
  },
  {
    type: "team",
    slug: "agencies",
    title: "Zivvy for Agencies",
    description:
      "Retainer billing, project P&Ls, and time-to-revenue that finally match — for creative and digital agencies.",
    keyword: "agency operations erp software",
    problem:
      "Agencies bill retainers in one tool, track hours in another, and reconcile margin in a spreadsheet on the last day of the month. The founder is the only person who really knows if a client is profitable.",
    solution:
      "Zivvy wires the retainer, the timesheet, and the project P&L into one tenant — margin per client is a live number, not a monthly reveal.",
    benefits: [
      "Retainer contracts with monthly draw-down and roll-over",
      "T&M and fixed-fee on the same project with proper WIP handling",
      "Live client-level margin — no month-end reveal",
      "Utilization targets per role with weekly variance",
      "Change-order approvals with a client-visible portal",
      "Multi-entity support for agencies with a design studio side"
    ],
    useCases: [
      "Draw down a $12k retainer against 60 hours of work",
      "Flip a project from T&M to fixed-fee mid-flight",
      "Approve a change order through a client-visible link",
      "Track utilization on a shrinking design team",
      "Bill a marketplace expense back to the client at cost + 15%"
    ],
    faqs: [
      {
        q: "Can we bill through the client's PO number?",
        a: "Yes. Every invoice can carry a customer PO reference, and the PO can act as a spend cap on the project."
      },
      {
        q: "Do you handle white-label reseller work?",
        a: "Yes. Business tier supports partner-branded portals so a client of your client sees your reseller's branding."
      }
    ],
    ctaLabel: "Talk agency setup",
    ctaHref: "/contact",
    role: "Agency operations lead",
    teamSize: "5 – 40 people",
    seniority: "manager",
    dailyRituals: [
      "Approve last week's timesheets",
      "Review retainers close to depletion",
      "Sign off on invoices to be sent today",
      "Check utilization against the 75% target"
    ],
    replacesTools: ["Harvest", "Toggl", "QuickBooks", "Notion"],
    minimumTier: "Pro",
    northStarMetric: "Realized rate",
    proofPoint: { label: "Agencies live", value: "290+ operations tenants" },
    relatedSolutions: ["professional-services", "marketing-teams", "finance-teams"]
  },
  {
    type: "team",
    slug: "enterprises",
    title: "Zivvy for Enterprises",
    description:
      "Business-tier controls, multi-entity roll-ups, SAML SSO, and row-level RBAC — for teams outgrowing mid-market tools.",
    keyword: "enterprise operations erp platform",
    problem:
      "Enterprises get boxed into legacy suites that ship as an implementation project. The modern alternative usually breaks at 500 users, or at the first serious permissions requirement.",
    solution:
      "Zivvy Business runs a single tenant across dozens of entities, ships row-level RBAC, SAML SSO, SCIM provisioning, and audit-grade logs — with the same clean UX the small teams see.",
    benefits: [
      "Multi-entity consolidation with intercompany eliminations",
      "Row-level RBAC — restrict by cost center, region, or project",
      "SAML SSO + SCIM provisioning against Okta, Entra, Google",
      "Audit-grade activity log with an export API",
      "Dedicated CSM and named support engineers",
      "SOC 2 Type II and ISO 27001 available on Business"
    ],
    useCases: [
      "Consolidate a 12-entity group with intercompany eliminations",
      "Restrict AR clerks in Region A to Region A customers only",
      "Provision new hires from Okta with the right roles from day one",
      "Export a full audit trail to your GRC platform",
      "Run a controlled rollout starting from one BU"
    ],
    faqs: [
      {
        q: "How do you handle a phased enterprise rollout?",
        a: "Most enterprises start with one business unit as a pilot — same tenant, restricted scope — and expand once the process is validated."
      },
      {
        q: "Which SSO providers are supported?",
        a: "Okta, Microsoft Entra ID, Google Workspace, OneLogin, and any SAML 2.0 IdP. SCIM 2.0 for provisioning."
      }
    ],
    ctaLabel: "Plan enterprise rollout",
    ctaHref: "/contact",
    role: "VP Operations / CIO",
    teamSize: "200 – 5,000 people",
    seniority: "exec",
    dailyRituals: [
      "Review the previous day's exception queue",
      "Sit in the ops steering committee",
      "Approve escalated capex requests",
      "Read the cross-BU KPI digest"
    ],
    replacesTools: ["SAP ECC", "Oracle NetSuite", "Microsoft Dynamics", "In-house legacy"],
    minimumTier: "Business",
    northStarMetric: "Cross-BU on-time delivery",
    proofPoint: { label: "Business-tier tenants", value: "120+ multi-entity groups" },
    relatedSolutions: ["manufacturing", "distribution", "germany"]
  },
  {
    type: "team",
    slug: "hr-teams",
    title: "Zivvy for HR Teams",
    description:
      "Onboarding, attendance, payroll, and leave — with the compliance hooks HR keeps in a separate spreadsheet.",
    keyword: "hr operations software",
    problem:
      "HR runs onboarding in a Notion doc, attendance on a biometric device, payroll in an Excel template the accountant emailed over, and leave in Google Calendar. Every offboarding is a scavenger hunt.",
    solution:
      "Zivvy People puts the whole employee lifecycle on one record — onboarding checklists, attendance ingestion, payroll runs, leave balances, and offboarding — with the compliance hook per region baked in.",
    benefits: [
      "Employee lifecycle on one record — hire to offboard",
      "Onboarding checklists with cross-team assignments",
      "Attendance ingestion from biometric and app-based punch",
      "Payroll runs with tax, super, and social contributions built-in",
      "Leave balances that respect regional accrual policy",
      "Regulatory exports — Form 16, P60, W-2, PayG, T4"
    ],
    useCases: [
      "Build a Day-1 checklist that spans IT, Finance, and HR",
      "Import attendance from a Suprema device automatically",
      "Run payroll on the 28th and file taxes on the 30th",
      "Reject a leave request that breaches team-coverage rules",
      "Generate every employee's Form 16 at year-end (India)"
    ],
    faqs: [
      {
        q: "Which payroll regions ship out of the box?",
        a: "India (Form 16), UK (RTI + P60), Australia (STP2), Singapore (CPF), UAE (WPS), and Germany (Lohnsteuer)."
      },
      {
        q: "Do you integrate with biometric devices?",
        a: "Yes. Suprema, ZKTeco, and eSSL over their standard SDKs. App-based check-in is also included."
      }
    ],
    ctaLabel: "Explore HR operations",
    ctaHref: "/login#signup",
    role: "Head of People",
    teamSize: "3 – 30 HR staff serving 50 – 5,000 employees",
    seniority: "director",
    dailyRituals: [
      "Approve today's leave requests",
      "Check onboarding checklist blockers",
      "Prep the monthly payroll variance report",
      "Review upcoming probation reviews"
    ],
    replacesTools: ["BambooHR", "Notion", "greytHR", "Deel (partial)"],
    minimumTier: "Pro",
    northStarMetric: "Time-to-productive (new hire)",
    proofPoint: { label: "Employees managed", value: "180,000+ across tenants" },
    relatedSolutions: ["india", "germany", "uk"]
  },
  {
    type: "team",
    slug: "marketing-teams",
    title: "Zivvy for Marketing Teams",
    description:
      "Campaign → pipeline → revenue in one system — no more attribution files that argue with the CRM.",
    keyword: "marketing operations software",
    problem:
      "Marketing runs campaigns in HubSpot, tracks leads in Salesforce, reads attribution in a warehouse, and reports to the CFO from a fifth tool. The four systems never agree, and every board deck starts with a caveat.",
    solution:
      "Zivvy connects the campaign, the lead source, the qualified opportunity, and the closed-won invoice on a single tenant — attribution reads directly off the same records finance uses.",
    benefits: [
      "Campaigns with UTM ingestion linked to Leads and Opportunities",
      "Multi-touch attribution against real closed-won revenue",
      "Content planning with an editorial workflow",
      "Marketing budget vs. actual — same tenant as finance",
      "Lead-to-cash SLAs with automated escalation",
      "Webhook everything — Slack alerts on high-intent leads"
    ],
    useCases: [
      "Attribute a $250k deal to the campaigns it actually touched",
      "Route a high-intent lead from webform to owner in under 60 seconds",
      "Send Slack alerts on inbound leads from marketing target accounts",
      "Track campaign spend against booked pipeline in real time",
      "Compare newsletter conversion vs. paid social on realized revenue"
    ],
    faqs: [
      {
        q: "Do you support multi-touch attribution?",
        a: "Yes. First-touch, last-touch, linear, and time-decay models — all computed against realized revenue in the ledger."
      },
      {
        q: "Can we still use HubSpot for automation?",
        a: "Absolutely. Zivvy exposes /v1/leads and /v1/opportunities REST APIs plus a customers.created webhook — bidirectional sync in a weekend."
      }
    ],
    ctaLabel: "See marketing workflows",
    ctaHref: "/use-cases/content-planning",
    role: "Head of Marketing",
    teamSize: "3 – 25 marketers",
    seniority: "director",
    dailyRituals: [
      "Check overnight pipeline additions by source",
      "Review yesterday's spend against the weekly budget",
      "Read the SDR-to-AE handoff queue",
      "Approve the content calendar for the week"
    ],
    replacesTools: ["HubSpot Marketing Hub", "Airtable", "Notion", "Google Sheets"],
    minimumTier: "Pro",
    northStarMetric: "Marketing-sourced pipeline",
    proofPoint: { label: "Attribution accuracy", value: "94% against ledger-of-record" },
    relatedSolutions: ["saas", "agencies", "startups"]
  },
  {
    type: "team",
    slug: "developers",
    title: "Zivvy for Developers",
    description:
      "REST-first, webhook-native, and event-driven — every state change is a signed webhook you can subscribe to.",
    keyword: "erp api developer platform",
    problem:
      "Most business software treats developers as an afterthought — you get a CSV import, a webhook, and a URL to their integrations partner page. Real automation dies in a Zapier sandbox.",
    solution:
      "Zivvy is REST-first and webhook-native — every doctype is a REST resource, every state change fires an HMAC-signed webhook, and every mutation accepts an Idempotency-Key header.",
    benefits: [
      "420+ REST endpoints — one per doctype",
      "HMAC-SHA256 signed webhooks with 24-hour replay",
      "Idempotency-Key headers on every mutation",
      "OpenAPI 3.1 spec at integrate.zivvy.xyz/docs",
      "Node, Python, and PHP SDKs — plus a raw curl example on every endpoint",
      "Sandbox tenants that reset every 24 hours"
    ],
    useCases: [
      "Subscribe to sales-invoices.submitted and forward to your ledger",
      "Provision a customer on your side when customers.created fires",
      "Idempotently import 10,000 records with a batch key",
      "Test against a sandbox that resets nightly",
      "Instrument a webhook consumer with the retry headers Zivvy sends"
    ],
    faqs: [
      {
        q: "Is the API on every tier?",
        a: "Yes. Free, Pro, and Business — same REST surface, same webhook stream, same OpenAPI spec."
      },
      {
        q: "How do you version breaking changes?",
        a: "Every endpoint is under /v1. Breaking changes ship as /v2 with a 12-month deprecation window."
      },
      {
        q: "Where are the SDKs?",
        a: "@zivvy/node, zivvy-python, and zivvy-php on the usual registries. Rust and Go community SDKs are in the works."
      }
    ],
    ctaLabel: "Read the API docs",
    ctaHref: "https://integrate.zivvy.xyz/docs",
    role: "Platform / Integration Engineer",
    teamSize: "1 – 10 developers",
    seniority: "lead",
    dailyRituals: [
      "Read the webhook error log",
      "Roll a new integration to staging",
      "Review the API changelog",
      "Cut a release of the internal Zivvy client"
    ],
    replacesTools: ["Custom Python scripts", "Zapier", "Make (Integromat)", "MuleSoft"],
    minimumTier: "Free",
    northStarMetric: "Webhook delivery success rate",
    proofPoint: { label: "Public API calls", value: "180M+ / month" },
    relatedSolutions: ["saas", "startups", "usa"]
  },
  {
    type: "team",
    slug: "finance-teams",
    title: "Zivvy for Finance Teams",
    description:
      "Close in five days, reconcile in one, and hand the auditors a bow-tied file — with the ledger built in.",
    keyword: "finance operations software",
    problem:
      "Finance teams close in weeks, not days. Bank reconciliation is a two-day marathon, intercompany eliminations happen in Excel, and every year-end audit is a scavenger hunt for supporting documentation.",
    solution:
      "Zivvy Finance ties every posting to a source document — invoice, receipt, contract — so close is a state transition, not a spreadsheet exercise. Bank feeds match against open items automatically, and audit packs export in one click.",
    benefits: [
      "Live GL with drill-down from KPI to source document",
      "Bank feeds via Plaid, TrueLayer, and open banking",
      "Multi-currency revaluation with parametric rate sources",
      "Intercompany eliminations at consolidation time",
      "Fixed asset register with depreciation schedules",
      "Auditor pack export in one click — GL, sub-ledgers, supporting docs"
    ],
    useCases: [
      "Close the books by day 5 of the following month",
      "Match a bank feed against 400 open invoices in under an hour",
      "Revalue foreign-currency AR at month-end automatically",
      "Eliminate intercompany AR/AP at consolidation",
      "Hand the auditor a zipped pack with journals, receipts, and confirmations"
    ],
    faqs: [
      {
        q: "How fast can we actually close?",
        a: "Median customer closes in 5 business days after go-live. The fastest tenants close in 2 — helped by same-day bank feeds and pre-close reconciliation macros."
      },
      {
        q: "Do you support IFRS and US GAAP?",
        a: "Both. Book policy is per-entity; you can run one entity on IFRS and another on US GAAP inside the same tenant."
      }
    ],
    ctaLabel: "Give me a finance-shaped tenant",
    ctaHref: "/contact",
    role: "Head of Finance / Controller",
    teamSize: "3 – 25 finance staff",
    seniority: "director",
    dailyRituals: [
      "Review AR aging over 30 days",
      "Match yesterday's bank feed to open items",
      "Approve journals held for review",
      "Read the cash position snapshot"
    ],
    replacesTools: ["QuickBooks", "Xero", "NetSuite", "Excel"],
    minimumTier: "Pro",
    northStarMetric: "Cash days to close",
    proofPoint: { label: "Median close", value: "5 business days" },
    relatedSolutions: ["saas", "professional-services", "enterprises"]
  }
];

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export const solutionProfiles: SolutionProfile[] = [
  ...countryProfiles,
  ...industryProfiles,
  ...teamProfiles
];

export const solutionProfileBySlug: Record<string, SolutionProfile> =
  Object.fromEntries(solutionProfiles.map((p) => [p.slug, p]));

export const countrySolutionProfiles = countryProfiles;
export const industrySolutionProfiles = industryProfiles;
export const teamSolutionProfiles = teamProfiles;

/**
 * Legacy compat — some callers still import `solutionCards` and expect
 * a `HubCardItem`-shaped array. The new list supersedes the old one; we
 * export a shim so hub/grid callers keep working while migrating.
 */
export const solutionProfileCards = solutionProfiles.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));
