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

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const users = await serverCall<Array<Record<string, unknown>>>(
    "frappe.client.get_list",
    {
      doctype: "User",
      fields: JSON.stringify(["name", "full_name", "email", "enabled", "user_type", "last_login"]),
      filters: JSON.stringify([
        ["User", "user_type", "=", "System User"],
        ["User", "name", "not like", "%@example.com"],
        ["User", "name", "!=", "Guest"],
        ["User", "name", "!=", "Administrator"]
      ]),
      order_by: "full_name asc",
      limit_page_length: 100
    }
  );

  if (!Array.isArray(users)) return [];

  const members: TeamMember[] = [];
  for (const u of users) {
    const roles = await serverCall<Array<Record<string, unknown>>>(
      "frappe.client.get_list",
      {
        doctype: "Has Role",
        fields: JSON.stringify(["role"]),
        filters: JSON.stringify([
          ["Has Role", "parent", "=", String(u.name)],
          ["Has Role", "parenttype", "=", "User"]
        ]),
        limit_page_length: 50
      }
    );

    members.push({
      name: String(u.name ?? ""),
      full_name: String(u.full_name ?? ""),
      email: String(u.email ?? u.name ?? ""),
      enabled: u.enabled === 1,
      user_type: String(u.user_type ?? ""),
      last_login: u.last_login ? String(u.last_login) : null,
      roles: Array.isArray(roles)
        ? roles
            .map((r) => String(r.role))
            .filter((r) => !r.startsWith("_") && r !== "All" && r !== "Guest")
        : []
    });
  }

  return members;
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
