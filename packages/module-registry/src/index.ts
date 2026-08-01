import type { EventName } from "@zivvy/events";

export type ZivvyTier = "free" | "pro" | "business";
export type ModuleStatus = "planned" | "kernel-backed" | "zivvy-native";

export type ModuleSpec = {
  key: string;
  title: string;
  description: string;
  status: ModuleStatus;
  minTier: ZivvyTier;
  targetUsers: string[];
  primaryJob: string;
  primaryCta: string;
  emptyState: string;
  routes: string[];
  erpDoctypes: string[];
  eventNames: EventName[];
  integrations: string[];
  aiCapabilities: string[];
  smokeTests: string[];
};

export const salesModule: ModuleSpec = {
  key: "sales",
  title: "Sales",
  description: "Quote, order, invoice, collect, and retain every customer relationship.",
  status: "kernel-backed",
  minTier: "free",
  targetUsers: ["founder", "sales operator", "finance operator"],
  primaryJob: "Move a customer from quote to paid invoice without leaving the workspace.",
  primaryCta: "Create invoice",
  emptyState: "Create your first customer, import customers from CSV, or connect HubSpot/Stripe.",
  routes: ["/sales", "/sales/customers", "/sales/quotations", "/sales/orders", "/sales/invoices"],
  erpDoctypes: ["Customer", "Quotation", "Sales Order", "Sales Invoice", "Payment Entry"],
  eventNames: [
    "customers.created",
    "customers.updated",
    "quotations.created",
    "quotations.submitted",
    "sales-orders.created",
    "sales-orders.submitted",
    "sales-invoices.created",
    "sales-invoices.submitted",
    "sales-invoices.paid",
    "payment-entries.created",
    "payment-entries.failed"
  ],
  integrations: ["HubSpot", "Salesforce", "Stripe", "Slack", "Google Workspace"],
  aiCapabilities: [
    "summarize customer history",
    "draft quote follow-up",
    "detect stuck deals",
    "explain unpaid invoice risk"
  ],
  smokeTests: [
    "create customer",
    "edit customer",
    "search and filter customers",
    "create quote",
    "send quote",
    "submit sales order",
    "create invoice",
    "send invoice",
    "create payment link",
    "record payment",
    "export list",
    "bulk action permissions"
  ]
};

export const moduleRegistry: ModuleSpec[] = [
  salesModule,
  {
    key: "crm",
    title: "CRM",
    description: "Lead capture, pipeline, opportunities, campaigns, and account context.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["founder", "sales operator"],
    primaryJob: "Capture demand and turn qualified opportunities into sales work.",
    primaryCta: "Create lead",
    emptyState: "Import leads, create a lead manually, or connect HubSpot/Slack forms.",
    routes: ["/crm/leads", "/crm/opportunities", "/crm/prospects"],
    erpDoctypes: ["Lead", "Opportunity", "Prospect", "Campaign"],
    eventNames: ["leads.created", "opportunities.updated"],
    integrations: ["HubSpot", "Salesforce", "Slack", "Webhooks"],
    aiCapabilities: ["score lead", "summarize opportunity", "draft next step"],
    smokeTests: ["create lead", "convert lead", "kanban pipeline", "filter opportunities"]
  },
  {
    key: "finance",
    title: "Finance",
    description: "Banking, reconciliation, accounts, payment requests, and reporting.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["founder", "finance operator", "accountant"],
    primaryJob: "Know cash position and reconcile money movement accurately.",
    primaryCta: "Reconcile bank feed",
    emptyState: "Connect a bank account, import a statement, or create a payment request.",
    routes: ["/finance", "/finance/banking", "/finance/reports"],
    erpDoctypes: ["Bank Account", "Bank Transaction", "Journal Entry", "Payment Entry"],
    eventNames: ["payment-entries.created", "payment-entries.paid"],
    integrations: ["Plaid", "GoCardless", "Stripe", "QuickBooks", "Xero"],
    aiCapabilities: ["explain cash movement", "match transactions", "flag anomalies"],
    smokeTests: ["list bank accounts", "import statement", "reconcile payment", "view reports"]
  },
  {
    key: "stock",
    title: "Inventory",
    description: "Items, warehouses, stock movement, reorder, and barcode scanning.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["ops operator", "warehouse operator", "founder"],
    primaryJob: "Know what is in stock, where it is, and what needs action.",
    primaryCta: "Create item",
    emptyState: "Import items, create your first item, or connect Shopify/Amazon.",
    routes: ["/stock", "/stock/items", "/stock/warehouses", "/stock/scan"],
    erpDoctypes: ["Item", "Warehouse", "Stock Entry"],
    eventNames: ["items.created", "items.updated"],
    integrations: ["Shopify", "Amazon", "Unicommerce", "Webhooks"],
    aiCapabilities: ["suggest reorder", "detect dead stock", "explain stock variance"],
    smokeTests: ["create item", "filter items", "scan barcode", "move stock"]
  },
  {
    key: "shipping",
    title: "Shipping",
    description: "Shipments, carrier rules, delivery tracking, and fulfilment exceptions.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["ops operator", "warehouse operator", "customer success"],
    primaryJob: "Move fulfilled orders to customers with clear tracking and exception handling.",
    primaryCta: "Create shipment",
    emptyState: "Create a shipment from a sales order or configure a shipping rule.",
    routes: ["/shipping", "/shipping/shipments", "/shipping/rules"],
    erpDoctypes: ["Shipment", "Shipping Rule"],
    eventNames: [],
    integrations: ["DHL", "UPS", "FedEx", "Webhooks"],
    aiCapabilities: ["explain delivery exception", "draft customer update", "suggest carrier rule"],
    smokeTests: ["create shipment", "filter shipments", "create shipping rule", "open tracking details"]
  },
  {
    key: "pos",
    title: "Point of Sale",
    description: "Fast retail checkout, register sessions, profiles, returns, and receipts.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["retail operator", "store manager", "finance operator"],
    primaryJob: "Complete an accurate sale quickly while keeping stock and accounting in sync.",
    primaryCta: "Start checkout",
    emptyState: "Create a POS profile and open the first register session.",
    routes: ["/pos", "/pos/invoices", "/pos/profiles", "/pos/opening", "/pos/closing"],
    erpDoctypes: ["POS Invoice", "POS Profile", "POS Opening Entry", "POS Closing Entry"],
    eventNames: ["sales-invoices.created", "sales-invoices.paid"],
    integrations: ["Stripe", "Adyen", "Receipt printers"],
    aiCapabilities: ["summarize shift", "flag unusual return", "explain register variance"],
    smokeTests: ["open register", "create POS invoice", "process return", "close register"]
  },
  {
    key: "procurement",
    title: "Procurement",
    description: "Suppliers, requests, purchase orders, bills, and buying controls.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["ops operator", "finance operator", "founder"],
    primaryJob: "Buy the right things from the right suppliers without losing approval context.",
    primaryCta: "Create purchase order",
    emptyState: "Create a supplier, import suppliers, or start your first purchase order.",
    routes: ["/purchases", "/purchases/suppliers", "/purchases/orders", "/purchases/invoices"],
    erpDoctypes: ["Supplier", "Request for Quotation", "Purchase Order", "Purchase Invoice"],
    eventNames: ["suppliers.created", "purchase-orders.created", "purchase-invoices.created"],
    integrations: ["Gmail", "Slack", "Webhooks"],
    aiCapabilities: ["compare supplier quotes", "summarize supplier risk", "draft purchase request"],
    smokeTests: ["create supplier", "create purchase order", "submit bill", "filter suppliers"]
  },
  {
    key: "projects",
    title: "Projects",
    description: "Projects, tasks, timesheets, budgets, and delivery accountability.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["project manager", "delivery lead", "founder"],
    primaryJob: "Turn committed work into tracked tasks, time, budget, and invoiceable progress.",
    primaryCta: "Create project",
    emptyState: "Create a project, import tasks, or start from a delivery template.",
    routes: ["/projects", "/projects/all", "/projects/tasks", "/projects/timesheets"],
    erpDoctypes: ["Project", "Task", "Timesheet"],
    eventNames: ["projects.created", "tasks.created", "tasks.updated"],
    integrations: ["Slack", "GitHub", "Notion", "Google Calendar"],
    aiCapabilities: ["summarize project status", "detect blocked tasks", "draft client update"],
    smokeTests: ["create project", "create task", "move task status", "log time"]
  },
  {
    key: "people",
    title: "People",
    description: "Employees, time off, attendance, shifts, expenses, payroll, and onboarding.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["founder", "people ops", "manager"],
    primaryJob: "Keep team records, attendance, leave, onboarding, and expenses under control.",
    primaryCta: "Add employee",
    emptyState: "Invite employees, import people records, or start onboarding.",
    routes: ["/hr/employees", "/hr/time-off", "/hr/attendance", "/hr/expenses"],
    erpDoctypes: ["Employee", "Leave Application", "Attendance", "Expense Claim"],
    eventNames: ["employees.created", "employees.updated"],
    integrations: ["Google Workspace", "Microsoft 365", "Slack"],
    aiCapabilities: ["summarize employee timeline", "detect attendance anomaly", "draft onboarding checklist"],
    smokeTests: ["create employee", "request time off", "record attendance", "submit expense"]
  },
  {
    key: "talent",
    title: "Talent",
    description: "Recruitment, interviews, goals, performance, and learning in one people workflow.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["people ops", "hiring manager", "team lead"],
    primaryJob: "Move candidates and employees through fair, visible growth workflows.",
    primaryCta: "Create job opening",
    emptyState: "Create a job opening, invite interviewers, or import active candidates.",
    routes: ["/talent", "/talent/openings", "/talent/applicants", "/talent/interviews", "/talent/goals"],
    erpDoctypes: ["Job Opening", "Job Applicant", "Interview", "Appraisal", "Goal", "Training Event"],
    eventNames: [],
    integrations: ["Google Calendar", "Microsoft 365", "Slack"],
    aiCapabilities: ["summarize candidate", "draft interview plan", "suggest development goal"],
    smokeTests: ["create job opening", "add applicant", "schedule interview", "create goal"]
  },
  {
    key: "manufacturing",
    title: "Manufacturing",
    description: "BOMs, work orders, job cards, subcontracting, and shop-floor execution.",
    status: "kernel-backed",
    minTier: "business",
    targetUsers: ["production manager", "ops operator", "founder"],
    primaryJob: "Plan and execute production with material, work-center, and quality context.",
    primaryCta: "Create work order",
    emptyState: "Create a BOM, import items, or start your first work order.",
    routes: ["/manufacturing/bom", "/manufacturing/work-orders", "/manufacturing/job-cards"],
    erpDoctypes: ["BOM", "Work Order", "Job Card"],
    eventNames: ["boms.created", "work-orders.created", "work-orders.updated"],
    integrations: ["Webhooks", "Slack"],
    aiCapabilities: ["explain production delay", "detect material shortage", "summarize work order"],
    smokeTests: ["create BOM", "create work order", "complete job card", "view material requirements"]
  },
  {
    key: "quality",
    title: "Quality",
    description: "Inspections, criteria, non-conformance, and production quality evidence.",
    status: "kernel-backed",
    minTier: "business",
    targetUsers: ["quality lead", "production manager", "ops operator"],
    primaryJob: "Catch quality problems before they become customer or production failures.",
    primaryCta: "Create inspection",
    emptyState: "Create the first inspection or define quality criteria for a produced item.",
    routes: ["/quality", "/quality/inspections"],
    erpDoctypes: ["Quality Inspection"],
    eventNames: [],
    integrations: ["Webhooks", "Slack"],
    aiCapabilities: ["summarize failed criteria", "detect recurring defect", "draft corrective action"],
    smokeTests: ["create inspection", "record result", "filter failed inspections", "open linked work order"]
  },
  {
    key: "assets",
    title: "Assets",
    description: "Fixed assets, maintenance, movements, depreciation, and lifecycle controls.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["finance operator", "ops operator"],
    primaryJob: "Track owned assets from purchase to depreciation, movement, and maintenance.",
    primaryCta: "Add asset",
    emptyState: "Create your first asset or import fixed assets from CSV.",
    routes: ["/assets", "/assets/register", "/assets/maintenance", "/assets/movements", "/assets/depreciation"],
    erpDoctypes: ["Asset", "Asset Movement", "Asset Maintenance"],
    eventNames: ["assets.created", "assets.updated"],
    integrations: ["Webhooks"],
    aiCapabilities: ["summarize asset lifecycle", "flag overdue maintenance", "explain depreciation"],
    smokeTests: ["create asset", "move asset", "schedule maintenance", "view depreciation"]
  },
  {
    key: "support",
    title: "Support",
    description: "Tickets, issues, warranty, SLAs, helpdesk teams, and knowledge flows.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["support agent", "founder", "customer success"],
    primaryJob: "Resolve customer issues with full account, order, and product context.",
    primaryCta: "Create ticket",
    emptyState: "Create a ticket, import support history, or connect email/Slack.",
    routes: ["/service", "/service/tickets", "/service/issues", "/service/warranty", "/service/slas"],
    erpDoctypes: ["Issue", "HD Ticket", "Warranty Claim"],
    eventNames: ["tickets.created", "tickets.updated"],
    integrations: ["Gmail", "Slack", "Postmark", "Twilio"],
    aiCapabilities: ["summarize thread", "draft reply", "suggest knowledge article"],
    smokeTests: ["create ticket", "assign ticket", "change status", "search knowledge base"]
  },
  {
    key: "helpdesk",
    title: "Helpdesk",
    description: "Shared support inboxes, teams, service contracts, and a customer knowledge base.",
    status: "kernel-backed",
    minTier: "pro",
    targetUsers: ["support agent", "support lead", "customer success"],
    primaryJob: "Resolve incoming requests with clear ownership, service targets, and reusable answers.",
    primaryCta: "Create ticket",
    emptyState: "Connect a support inbox, create a ticket, or publish the first knowledge article.",
    routes: ["/helpdesk", "/helpdesk/tickets", "/helpdesk/kb", "/helpdesk/teams", "/helpdesk/contracts"],
    erpDoctypes: ["HD Ticket", "HD Article", "HD Team", "HD Service Level Agreement"],
    eventNames: ["tickets.created", "tickets.updated"],
    integrations: ["Gmail", "Microsoft 365", "Slack", "Twilio"],
    aiCapabilities: ["summarize thread", "draft reply", "suggest knowledge article"],
    smokeTests: ["create ticket", "assign team", "change status", "search knowledge base"]
  },
  {
    key: "wiki",
    title: "Wiki",
    description: "Team knowledge, SOPs, internal documentation, and operating memory.",
    status: "kernel-backed",
    minTier: "free",
    targetUsers: ["founder", "ops lead", "team member"],
    primaryJob: "Capture how the business actually works and link it to operational records.",
    primaryCta: "Create page",
    emptyState: "Create your first page or generate an SOP from recent activity.",
    routes: ["/wiki/pages", "/wiki/spaces"],
    erpDoctypes: ["Wiki Page"],
    eventNames: ["wiki-pages.created", "wiki-pages.updated"],
    integrations: ["Notion", "Google Drive", "Slack"],
    aiCapabilities: ["draft SOP", "summarize page changes", "answer from workspace knowledge"],
    smokeTests: ["create page", "edit page", "search page", "link page to record"]
  },
  {
    key: "webshop",
    title: "Webshop",
    description: "Storefront products, categories, online orders, catalog sync, and promotions.",
    status: "kernel-backed",
    minTier: "business",
    targetUsers: ["ecommerce operator", "ops operator", "founder"],
    primaryJob: "Keep online catalog and ERP stock/order records aligned.",
    primaryCta: "Sync products",
    emptyState: "Connect Shopify, import products, or create a product manually.",
    routes: ["/webshop/products", "/webshop/categories", "/webshop/orders"],
    erpDoctypes: ["Website Item", "Item Group", "Sales Order"],
    eventNames: ["items.updated", "sales-orders.created"],
    integrations: ["Shopify", "Amazon", "Unicommerce", "WooCommerce"],
    aiCapabilities: ["optimize product copy", "detect catalog mismatch", "summarize order exceptions"],
    smokeTests: ["sync product", "map category", "import order", "verify stock update"]
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Dashboards, reports, saved views, trends, alerts, and operational insight.",
    status: "planned",
    minTier: "business",
    targetUsers: ["founder", "operator", "finance lead"],
    primaryJob: "Turn business activity into decisions without building reports from scratch.",
    primaryCta: "Create dashboard",
    emptyState: "Start from a dashboard template or ask AI for the metric you need.",
    routes: ["/stats", "/insights/dashboards", "/insights/charts", "/insights/queries"],
    erpDoctypes: ["Dashboard", "Dashboard Chart", "Report"],
    eventNames: [],
    integrations: ["PostHog", "Segment", "Google Sheets"],
    aiCapabilities: ["explain KPI change", "build chart from question", "detect anomalies"],
    smokeTests: ["view dashboard", "filter chart", "export report", "save view"]
  },
  {
    key: "integrations",
    title: "Integrations",
    description: "Connected apps, OAuth, sync health, webhooks, API keys, and automation surfaces.",
    status: "zivvy-native",
    minTier: "free",
    targetUsers: ["founder", "developer", "ops lead"],
    primaryJob: "Connect external systems safely and know exactly what synced or failed.",
    primaryCta: "Connect app",
    emptyState: "Connect Slack, Google, Stripe, Shopify, or create your first webhook.",
    routes: ["/settings/developer", "/integrations", "/developers/webhooks"],
    erpDoctypes: ["Zivvy Webhook", "Zivvy API Key", "Zivvy Event Log"],
    eventNames: ["integrations.created", "integrations.synced", "webhooks.created"],
    integrations: ["Nango", "Pipedream", "Zapier", "n8n"],
    aiCapabilities: ["suggest integration", "explain failed sync", "generate webhook handler"],
    smokeTests: ["create API key", "register webhook", "send test event", "view sync log"]
  }
];

export function getModule(key: string) {
  return moduleRegistry.find((module) => module.key === key) ?? null;
}

/** URL/sidebar keys intentionally differ from product names in a few places. */
export const moduleNavigationAliases: Record<string, string> = {
  purchases: "procurement",
  hr: "people",
  service: "support",
  insights: "analytics"
};

export function getModuleByNavigationKey(key: string) {
  return getModule(moduleNavigationAliases[key] ?? key);
}
