/**
 * Maps human-readable module names to Frappe roles.
 *
 * Each module has a "view" role (read-only) and a "full" role (create/edit/delete).
 * The role builder UI shows modules; behind the scenes we resolve to Frappe roles
 * for the backend API.
 */

export type AccessLevel = "none" | "view" | "full";

export interface ModuleConfig {
  key: string;
  label: string;
  description: string;
  viewRoles: string[];
  fullRoles: string[];
}

export const MODULES: ModuleConfig[] = [
  {
    key: "crm",
    label: "CRM",
    description: "Leads, opportunities, and customer relationships",
    viewRoles: ["Sales User"],
    fullRoles: ["Sales Manager", "Sales Master Manager", "Sales User"],
  },
  {
    key: "sales",
    label: "Sales",
    description: "Quotations, sales orders, and invoicing",
    viewRoles: ["Sales User"],
    fullRoles: ["Sales Manager", "Sales Master Manager", "Sales User"],
  },
  {
    key: "purchasing",
    label: "Purchasing",
    description: "Purchase orders, suppliers, and receipts",
    viewRoles: ["Purchase User"],
    fullRoles: ["Purchase Manager", "Purchase Master Manager", "Purchase User"],
  },
  {
    key: "stock",
    label: "Stock & Inventory",
    description: "Warehouses, stock entries, and inventory tracking",
    viewRoles: ["Stock User"],
    fullRoles: ["Stock Manager", "Stock User", "Item Manager"],
  },
  {
    key: "finance",
    label: "Finance",
    description: "Chart of accounts, journal entries, and payments",
    viewRoles: ["Accounts User"],
    fullRoles: ["Accounts Manager", "Accounts User"],
  },
  {
    key: "hr",
    label: "HR & People",
    description: "Employees, attendance, leaves, and payroll",
    viewRoles: ["HR User"],
    fullRoles: ["HR Manager", "HR User"],
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    description: "BOMs, work orders, and production planning",
    viewRoles: ["Manufacturing User"],
    fullRoles: ["Manufacturing Manager", "Manufacturing User"],
  },
  {
    key: "projects",
    label: "Projects",
    description: "Projects, tasks, and time tracking",
    viewRoles: ["Projects User"],
    fullRoles: ["Projects Manager", "Projects User"],
  },
  {
    key: "support",
    label: "Support",
    description: "Support tickets and customer issues",
    viewRoles: ["Support Team"],
    fullRoles: ["Support Team"],
  },
  {
    key: "insights",
    label: "Insights",
    description: "Dashboards, charts, and custom queries",
    viewRoles: ["Insights User"],
    fullRoles: ["Insights User"],
  },
  {
    key: "wiki",
    label: "Wiki",
    description: "Internal knowledge base and documentation",
    viewRoles: ["Wiki Approver"],
    fullRoles: ["Wiki Approver"],
  },
];

export function rolesToModuleAccess(roles: string[]): Record<string, AccessLevel> {
  const roleSet = new Set(roles);
  const access: Record<string, AccessLevel> = {};
  for (const mod of MODULES) {
    const hasFull = mod.fullRoles.every((r) => roleSet.has(r));
    const hasView = mod.viewRoles.some((r) => roleSet.has(r));
    access[mod.key] = hasFull ? "full" : hasView ? "view" : "none";
  }
  return access;
}

export function moduleAccessToRoles(access: Record<string, AccessLevel>): string[] {
  const roles = new Set<string>();
  for (const mod of MODULES) {
    const level = access[mod.key] ?? "none";
    if (level === "full") {
      mod.fullRoles.forEach((r) => roles.add(r));
    } else if (level === "view") {
      mod.viewRoles.forEach((r) => roles.add(r));
    }
  }
  return Array.from(roles).sort();
}

export interface RolePreset {
  name: string;
  description: string;
  access: Record<string, AccessLevel>;
}

export const PRESETS: RolePreset[] = [
  {
    name: "Full Access",
    description: "All modules with full create/edit/delete permissions",
    access: Object.fromEntries(MODULES.map((m) => [m.key, "full" as const])),
  },
  {
    name: "Sales",
    description: "CRM, sales pipeline, and basic stock visibility",
    access: {
      crm: "full",
      sales: "full",
      purchasing: "none",
      stock: "view",
      finance: "none",
      hr: "none",
      manufacturing: "none",
      projects: "none",
      support: "none",
      insights: "none",
      wiki: "view",
    },
  },
  {
    name: "Finance",
    description: "Accounting, invoicing, and purchasing",
    access: {
      crm: "none",
      sales: "view",
      purchasing: "full",
      stock: "view",
      finance: "full",
      hr: "none",
      manufacturing: "none",
      projects: "none",
      support: "none",
      insights: "view",
      wiki: "view",
    },
  },
  {
    name: "Operations",
    description: "Stock, manufacturing, and project management",
    access: {
      crm: "none",
      sales: "view",
      purchasing: "full",
      stock: "full",
      finance: "none",
      hr: "none",
      manufacturing: "full",
      projects: "full",
      support: "none",
      insights: "none",
      wiki: "view",
    },
  },
  {
    name: "View Only",
    description: "Read-only access across all modules",
    access: Object.fromEntries(MODULES.map((m) => [m.key, "view" as const])),
  },
];
