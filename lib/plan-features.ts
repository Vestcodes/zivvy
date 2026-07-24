import type { ZivvyTier } from "@/lib/boot-types";

/**
 * Client-side mirror of the plan → feature map. The Frappe backend is the
 * authoritative source of gating (permission_query_conditions + guard_api_access),
 * but the frontend needs to know the SAME rules to show tiles/sidebar items as
 * locked BEFORE a user clicks them — otherwise the tile looks open, the click
 * routes to the module, and the Frappe RPC 403s into "isn't available on your
 * plan" as a surprise.
 *
 * This map is intentionally conservative — a mismatch here (frontend says "free"
 * but backend requires "pro") just means the user sees an unlock prompt after
 * clicking instead of before. The reverse — frontend shows locked but backend
 * allows — is the failure mode we want to avoid.
 *
 * Keep in sync with zivvy_brand's tier / module allow-list. If you add a
 * module or tighten a tier, update both sides in the same commit.
 */

export const MODULE_MIN_TIER: Record<string, ZivvyTier> = {
  // Business-only surfaces (manufacturing, quality, subcontracting, assets).
  Manufacturing: "business",
  "Quality Management": "business",
  Subcontracting: "business",
  Assets: "business",

  // Bundled product apps — same tier as their backend gate in
  // zivvy_brand SPA_PATH_MIN_TIER. Keep in lock-step.
  Insights: "business",           // /insights — analytics + BI (Business)
  Webshop: "business",            // /webshop  — storefront (Business)
  "E-commerce Integrations": "business",

  Helpdesk: "pro",                // /helpdesk — Frappe Helpdesk (Pro)
  Raven: "pro",                   // /raven    — team chat (Pro)

  // Free — bundled product apps that ship on every tier.
  // Wiki + CRM don't appear here (implicit "free") to keep the map lean.

  // Pro-required — heavier ops surfaces.
  Accounts: "pro",                // full accounting (Journal, Payments, Reports)
  Buying: "pro",                  // purchase pipeline + RFQs
  Projects: "pro",
  HRMS: "pro"
};

/**
 * Doctype-level overrides. Applied on top of MODULE_MIN_TIER — most doctypes
 * inherit their module's tier, but a handful land in specific tiers:
 *  - Basic customer / supplier / item CRUD stays on Free
 *  - Employees / Payroll / Job Cards need Pro or Business
 */
export const DOCTYPE_MIN_TIER: Record<string, ZivvyTier> = {
  // Business tier
  BOM: "business",
  "Work Order": "business",
  "Job Card": "business",
  "Subcontracting Order": "business",
  "Subcontracting Receipt": "business",
  "Quality Inspection": "business",
  "Quality Procedure": "business",
  Asset: "business",
  "Asset Maintenance": "business",
  "Asset Movement": "business",

  // Pro tier
  "POS Invoice": "pro",
  "POS Profile": "pro",
  "POS Opening Entry": "pro",
  "POS Closing Entry": "pro",
  "Journal Entry": "pro",
  "Payment Entry": "pro",
  Account: "pro",
  Employee: "pro",
  "Leave Application": "pro",
  Attendance: "pro",
  "Shift Type": "pro",
  "Salary Slip": "pro",
  "Expense Claim": "pro",
  "Loan Application": "pro",
  "Job Opening": "pro",
  "Job Applicant": "pro",
  Interview: "pro",
  Appraisal: "pro",
  Project: "pro",
  Task: "pro",
  Timesheet: "pro",
  "Purchase Order": "pro",
  "Supplier Quotation": "pro",
  "Purchase Invoice": "pro",
  "Purchase Receipt": "pro",
  "Request for Quotation": "pro",

  // Bundled Frappe product-app doctypes.
  // Helpdesk (Pro)
  "HD Ticket": "pro",
  "HD Article": "pro",
  "HD Team": "pro",
  // Raven (Pro)
  "Raven Channel": "pro",
  "Raven Message": "pro",
  // Insights (Business)
  "Insights Dashboard": "business",
  "Insights Query": "business",
  "Insights Chart": "business",
  // Webshop (Business)
  "Website Item": "business",
  "Web Item Group": "business"
};

/**
 * Modules with a hard "blocked" status — the module isn't just tier-gated,
 * it doesn't exist as an installable app on Free at all. On Free, blocked
 * modules render locked tiles rather than "empty list".
 */
export function blockedModulesFor(tier: ZivvyTier): string[] {
  const blocked: string[] = [];
  for (const [module, required] of Object.entries(MODULE_MIN_TIER)) {
    if (!tierAtLeast(tier, required)) blocked.push(module);
  }
  return blocked;
}

function tierAtLeast(current: ZivvyTier, required: ZivvyTier): boolean {
  const order: Record<ZivvyTier, number> = { free: 0, pro: 1, business: 2 };
  return order[current] >= order[required];
}
