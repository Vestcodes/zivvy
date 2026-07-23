"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frappeCall } from "@/lib/frappe-client";
import type { Notification } from "@/lib/notifications";

const NOTIFICATIONS_KEY = ["notifications"];
const UNREAD_KEY = ["notifications", "unread-count"];

interface NotificationsData {
  items: Notification[];
  unreadCount: number;
}

export function useNotifications(initial?: { items: Notification[]; unreadCount: number }) {
  const qc = useQueryClient();

  const { data } = useQuery<NotificationsData>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const [items, count] = await Promise.all([
        frappeCall<Array<Record<string, unknown>>>("frappe.client.get_list", {
          doctype: "Notification Log",
          fields: JSON.stringify([
            "name", "subject", "email_content", "document_type",
            "document_name", "from_user", "type", "read", "creation"
          ]),
          order_by: "creation desc",
          limit_page_length: 20
        }).then((res) =>
          Array.isArray(res)
            ? res.map((n): Notification => ({
                name: String(n.name ?? ""),
                subject: String(n.subject ?? ""),
                email_content: n.email_content ? String(n.email_content) : undefined,
                document_type: n.document_type ? String(n.document_type) : undefined,
                document_name: n.document_name ? String(n.document_name) : undefined,
                from_user: n.from_user ? String(n.from_user) : undefined,
                type: String(n.type ?? ""),
                read: n.read === 1,
                creation: String(n.creation ?? "")
              }))
            : []
        ),
        frappeCall<number>("frappe.client.get_count", {
          doctype: "Notification Log",
          filters: JSON.stringify({ read: 0 })
        }).then((res) => (typeof res === "number" ? res : 0))
      ]);
      return { items, unreadCount: count };
    },
    initialData: initial,
    staleTime: 30_000,
    refetchInterval: 60_000
  });

  const markRead = useMutation({
    mutationFn: (name: string) =>
      frappeCall("frappe.client.set_value", {
        doctype: "Notification Log",
        name,
        fieldname: "read",
        value: "1"
      }),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const prev = qc.getQueryData<NotificationsData>(NOTIFICATIONS_KEY);
      if (prev) {
        qc.setQueryData<NotificationsData>(NOTIFICATIONS_KEY, {
          items: prev.items.map((n) => (n.name === name ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        });
      }
      return { prev };
    },
    onError: (_err, _name, ctx) => {
      if (ctx?.prev) qc.setQueryData(NOTIFICATIONS_KEY, ctx.prev);
    }
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      frappeCall("frappe.desk.doctype.notification_log.notification_log.mark_all_as_read"),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const prev = qc.getQueryData<NotificationsData>(NOTIFICATIONS_KEY);
      if (prev) {
        qc.setQueryData<NotificationsData>(NOTIFICATIONS_KEY, {
          items: prev.items.map((n) => ({ ...n, read: true })),
          unreadCount: 0
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(NOTIFICATIONS_KEY, ctx.prev);
    }
  });

  return {
    notifications: data?.items ?? initial?.items ?? [],
    unreadCount: data?.unreadCount ?? initial?.unreadCount ?? 0,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingRead: markRead.isPending
  };
}
