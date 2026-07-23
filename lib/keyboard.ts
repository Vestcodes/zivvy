/**
 * Keyboard shortcut definitions. Single source of truth
 * for the global handler and the help overlay.
 */

export interface Shortcut {
  keys: string[];
  label: string;
  section: string;
}

export const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ["g", "d"], label: "Go to Dashboard", section: "Navigation" },
  { keys: ["g", "s"], label: "Go to Sales", section: "Navigation" },
  { keys: ["g", "p"], label: "Go to Procurement", section: "Navigation" },
  { keys: ["g", "i"], label: "Go to Stock / Items", section: "Navigation" },
  { keys: ["g", "f"], label: "Go to Accounting", section: "Navigation" },
  { keys: ["g", "h"], label: "Go to People / HR", section: "Navigation" },
  { keys: ["g", "c"], label: "Go to CRM", section: "Navigation" },
  { keys: ["g", "b"], label: "Go to Billing", section: "Navigation" },

  // Global
  { keys: ["/"], label: "Open search / command bar", section: "Global" },
  { keys: ["?"], label: "Show keyboard shortcuts", section: "Global" },
  { keys: ["Escape"], label: "Close dialog / cancel", section: "Global" },

  // List view
  { keys: ["j"], label: "Next row", section: "List" },
  { keys: ["k"], label: "Previous row", section: "List" },
  { keys: ["Enter"], label: "Open selected row", section: "List" },
  { keys: ["n"], label: "New record", section: "List" },

  // Form view
  { keys: ["⌘", "S"], label: "Save", section: "Form" },
  { keys: ["Escape"], label: "Discard changes", section: "Form" },
];

export const GO_TO_MAP: Record<string, string> = {
  d: "/dashboard",
  s: "/sales/invoices",
  p: "/purchases/orders",
  i: "/stock/items",
  f: "/finance/accounts",
  h: "/hr/employees",
  c: "/crm/leads",
  b: "/billing",
};

export function groupShortcuts(): Record<string, Shortcut[]> {
  const groups: Record<string, Shortcut[]> = {};
  for (const s of SHORTCUTS) {
    (groups[s.section] ??= []).push(s);
  }
  return groups;
}
