import { cookies } from "next/headers";

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

export interface Notification {
  name: string;
  subject: string;
  email_content?: string;
  document_type?: string;
  document_name?: string;
  from_user?: string;
  type: string;
  read: boolean;
  creation: string;
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

export async function fetchNotifications(limit = 20): Promise<Notification[]> {
  const res = await serverCall<Array<Record<string, unknown>>>(
    "frappe.client.get_list",
    {
      doctype: "Notification Log",
      fields: JSON.stringify([
        "name", "subject", "email_content", "document_type",
        "document_name", "from_user", "type", "read", "creation"
      ]),
      order_by: "creation desc",
      limit_page_length: limit
    }
  );

  if (!Array.isArray(res)) return [];

  return res.map((n) => ({
    name: String(n.name ?? ""),
    subject: String(n.subject ?? ""),
    email_content: n.email_content ? String(n.email_content) : undefined,
    document_type: n.document_type ? String(n.document_type) : undefined,
    document_name: n.document_name ? String(n.document_name) : undefined,
    from_user: n.from_user ? String(n.from_user) : undefined,
    type: String(n.type ?? ""),
    read: n.read === 1,
    creation: String(n.creation ?? "")
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await serverCall<number>("frappe.client.get_count", {
    doctype: "Notification Log",
    filters: JSON.stringify({ read: 0 })
  });
  return typeof res === "number" ? res : 0;
}
