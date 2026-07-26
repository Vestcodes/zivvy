/**
 * Client-safe shared surface for /settings/team.
 *
 * lib/team.ts is server-only (imports next/headers via cookies()); anything
 * a client component needs — the TeamMember type and the ASSIGNABLE_ROLES
 * constant — lives here so Next.js can tree-shake safely.
 */

export interface TeamMember {
  name: string;
  full_name: string;
  email: string;
  enabled: boolean;
  user_type: string;
  last_login: string | null;
  roles: string[];
}

/** Mirrors zivvy_brand/tenants/api.py — must stay in sync. */
export const ASSIGNABLE_ROLES = [
  "Accounts Manager",
  "Accounts User",
  "Sales Manager",
  "Sales Master Manager",
  "Sales User",
  "Purchase Manager",
  "Purchase Master Manager",
  "Purchase User",
  "Stock Manager",
  "Stock User",
  "Manufacturing Manager",
  "Manufacturing User",
  "HR Manager",
  "HR User",
  "Employee",
  "Expense Approver",
  "Leave Approver",
  "Projects Manager",
  "Projects User",
  "Support Team",
  "Quality Manager",
  "Asset Manager",
  "Asset User",
  "Agent",
  "Item Manager",
  "Wiki Approver",
  "Insights User",
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
