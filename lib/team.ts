import { cookies } from "next/headers";

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

export interface TeamMember {
  name: string;
  full_name: string;
  email: string;
  enabled: boolean;
  user_type: string;
  last_login: string | null;
  roles: string[];
}

async function serverCall<T = unknown>(
  method: string,
  body?: Record<string, string | number | boolean | undefined>
): Promise<T | null> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return null;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body ?? {})) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }

  try {
    const res = await fetch(`${FRAPPE_ORIGIN}/api/method/${method}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: cookieHeader
      },
      body: params.toString()
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: T } & Record<string, unknown>;
    if (json && typeof json === "object" && "message" in json) {
      return (json.message ?? null) as T | null;
    }
    return json as unknown as T;
  } catch {
    return null;
  }
}

export async function fetchTeamMembers(tenantName?: string | null): Promise<TeamMember[]> {
  // Scope by tenant when we have one — critical for multi-tenant Frappe sites
  // where an unscoped list would leak users across workspaces. The absence of
  // a tenant means we still filter to System Users so guests/administrators
  // don't leak into a customer's view.
  const filters: Array<[string, string, string, string | number | boolean]> = [
    ["User", "user_type", "=", "System User"],
    ["User", "name", "not like", "%@example.com"],
    ["User", "name", "!=", "Guest"],
    ["User", "name", "!=", "Administrator"]
  ];
  if (tenantName) {
    filters.push(["User", "zivvy_tenant", "=", tenantName]);
  }

  const users = await serverCall<Array<Record<string, unknown>>>(
    "frappe.client.get_list",
    {
      doctype: "User",
      fields: JSON.stringify(["name", "full_name", "email", "enabled", "user_type", "last_login"]),
      filters: JSON.stringify(filters),
      order_by: "full_name asc",
      limit_page_length: 100
    }
  );

  if (!Array.isArray(users) || users.length === 0) return [];

  // Batch the roles query — one round trip for every user's roles instead of N.
  // parent-in filter respects permission_query_conditions the same way per-user
  // fetches would.
  const emails = users.map((u) => String(u.name));
  const rawRoles = await serverCall<Array<Record<string, unknown>>>(
    "frappe.client.get_list",
    {
      doctype: "Has Role",
      fields: JSON.stringify(["parent", "role"]),
      filters: JSON.stringify([
        ["Has Role", "parent", "in", emails],
        ["Has Role", "parenttype", "=", "User"]
      ]),
      limit_page_length: 5000
    }
  );

  const rolesByUser = new Map<string, string[]>();
  if (Array.isArray(rawRoles)) {
    for (const r of rawRoles) {
      const parent = String(r.parent);
      const role = String(r.role);
      if (role.startsWith("_") || role === "All" || role === "Guest") continue;
      const arr = rolesByUser.get(parent) ?? [];
      arr.push(role);
      rolesByUser.set(parent, arr);
    }
  }

  return users.map((u) => ({
    name: String(u.name ?? ""),
    full_name: String(u.full_name ?? ""),
    email: String(u.email ?? u.name ?? ""),
    enabled: u.enabled === 1,
    user_type: String(u.user_type ?? ""),
    last_login: u.last_login ? String(u.last_login) : null,
    roles: rolesByUser.get(String(u.name)) ?? []
  }));
}

export const ASSIGNABLE_ROLES = [
  "System Manager",
  "Accounts Manager",
  "Accounts User",
  "Sales Manager",
  "Sales User",
  "Purchase Manager",
  "Purchase User",
  "Stock Manager",
  "Stock User",
  "Manufacturing Manager",
  "Manufacturing User",
  "HR Manager",
  "HR User",
  "Projects Manager",
  "Projects User",
  "Support Team"
] as const;
