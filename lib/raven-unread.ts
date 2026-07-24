import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

/**
 * Fetch unread Raven message count for the current user.
 *
 * Backed by `frappe.desk.notifications.get_notifications` which aggregates
 * both Raven and doctype notifications — same source the bell reads, so the
 * two stay in sync automatically.
 *
 * When Raven isn't installed OR the API fails for any reason, returns 0
 * silently rather than crashing the topbar.
 */

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

async function serverCall<T = unknown>(
  method: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T | null> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return null;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null) continue;
    body.set(k, String(v));
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
      body: body.toString()
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: T };
    return json.message ?? null;
  } catch {
    return null;
  }
}

export const fetchUnreadChatCount = cache(_fetchUnreadChatCount);

async function _fetchUnreadChatCount(): Promise<number> {
  const notif = await serverCall<{
    open_count_doctype?: Record<string, number>;
  }>("frappe.desk.notifications.get_notifications");
  if (!notif) return 0;
  const per = notif.open_count_doctype ?? {};
  return (per["Raven Message"] ?? 0) + (per["Raven Channel"] ?? 0);
}
