/**
 * URL slug ↔ Frappe DocType name. Keeps human-friendly URLs while the
 * backend keeps its Title Case doctype identifiers.
 *
 * Some entries point at doctypes that live in *sibling* Frappe apps rather
 * than ERPNext core:
 *   - hrms  (Employee, Leave Application, Attendance, Salary Slip, …)
 *   - support workflows use Issue/Warranty Claim which are in core.
 */

export const SLUG_TO_DOCTYPE: Record<string, string> = {
  // Sales
  "sales/customers":       "Customer",
  "sales/quotations":      "Quotation",
  "sales/orders":          "Sales Order",
  "sales/invoices":        "Sales Invoice",
  "sales/deliveries":      "Delivery Note",

  // Point of Sale (Accounts module)
  "pos/invoices":          "POS Invoice",
  "pos/profiles":          "POS Profile",
  "pos/opening":           "POS Opening Entry",
  "pos/closing":           "POS Closing Entry",

  // Procurement / Buying
  "purchases/suppliers":   "Supplier",
  "purchases/rfqs":        "Request for Quotation",
  "purchases/orders":      "Purchase Order",
  "purchases/invoices":    "Purchase Invoice",

  // Stock
  "stock/items":           "Item",
  "stock/warehouses":      "Warehouse",
  "stock/entries":         "Stock Entry",
  "stock/reorder":         "Item Reorder",

  // Accounting
  "finance/accounts":      "Account",
  "finance/payments":      "Payment Entry",
  "finance/journal":       "Journal Entry",

  // Manufacturing
  "manufacturing/bom":              "BOM",
  "manufacturing/work-orders":      "Work Order",
  "manufacturing/job-cards":        "Job Card",
  "manufacturing/subcontracting":   "Subcontracting Order",

  // Assets
  "assets":                "Asset",
  "assets/maintenance":    "Asset Maintenance Log",
  "assets/movements":      "Asset Movement",
  "assets/depreciation":   "Asset Depreciation Schedule",

  // People / HR — served by the hrms app on the backend
  "hr/employees":          "Employee",
  "hr/time-off":           "Leave Application",
  "hr/attendance":         "Attendance",
  "hr/shifts":             "Shift Assignment",
  "hr/payroll":            "Salary Slip",
  "hr/expenses":           "Expense Claim",
  "hr/loans":              "Employee Advance",
  "hr/onboarding":         "Employee Onboarding",

  // Talent — recruitment, performance, learning (hrms)
  "talent/openings":       "Job Opening",
  "talent/applicants":     "Job Applicant",
  "talent/interviews":     "Interview",
  "talent/appraisals":     "Appraisal",
  "talent/goals":          "Goal",
  "talent/training":       "Training Event",

  // Shipping (erpnext-shipping + stock core)
  "shipping/shipments":    "Shipment",
  "shipping/parcels":      "Shipment Parcel",
  "shipping/rules":        "Shipping Rule",
  "shipping/carriers":     "Parcel Service",

  // CRM
  "crm/leads":             "Lead",
  "crm/opportunities":     "Opportunity",
  "crm/prospects":         "Prospect",
  "crm/campaigns":         "Campaign",
  "crm/appointments":      "Appointment",
  "crm/contracts":         "Contract",

  // Projects
  "projects":              "Project",
  "projects/tasks":        "Task",
  "projects/timesheets":   "Timesheet",

  // Support (ERPNext core)
  "support/tickets":       "Issue",
  "support/issues":        "Issue",
  "support/warranty":      "Warranty Claim",
  "support/slas":          "Service Level Agreement",

  // Helpdesk (Frappe Helpdesk app, Pro tier)
  "helpdesk/tickets":      "HD Ticket",
  "helpdesk/kb":           "HD Article",
  "helpdesk/teams":        "HD Team",
  "helpdesk/contracts":    "HD Service Contract",

  // Insights — analytics / BI (Business tier)
  "insights/dashboards":   "Insights Dashboard",
  "insights/charts":       "Insights Chart",
  "insights/queries":      "Insights Query",

  // Wiki (Free — bundled docs app)
  "wiki/pages":            "Wiki Page",
  "wiki/spaces":           "Wiki Space",

  // Webshop (Business tier — storefront)
  "webshop/products":      "Website Item",
  "webshop/categories":    "Web Item Group",
  "webshop/orders":        "Sales Order"
};

export function slugToDoctype(module: string, doctype: string): string | null {
  const key = `${module}/${doctype}`;
  return SLUG_TO_DOCTYPE[key] ?? null;
}
