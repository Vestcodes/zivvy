"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frappeCall } from "@/lib/frappe-client";

export function useFrappeList<T = Record<string, unknown>>(
  doctype: string,
  opts: {
    fields?: string[];
    filters?: Record<string, unknown> | Array<unknown>;
    orderBy?: string;
    limit?: number;
    enabled?: boolean;
  } = {}
) {
  return useQuery<T[]>({
    queryKey: ["frappe-list", doctype, opts.filters, opts.orderBy, opts.limit],
    queryFn: async () => {
      const result = await frappeCall<T[]>("frappe.client.get_list", {
        doctype,
        fields: JSON.stringify(opts.fields ?? ["name"]),
        filters: opts.filters ? JSON.stringify(opts.filters) : undefined,
        order_by: opts.orderBy,
        limit_page_length: opts.limit ?? 20
      });
      return Array.isArray(result) ? result : [];
    },
    enabled: opts.enabled !== false
  });
}

export function useFrappeCall<T = unknown>(
  method: string,
  args?: Record<string, string | number | boolean | null | undefined>,
  opts?: { enabled?: boolean; staleTime?: number }
) {
  return useQuery<T>({
    queryKey: ["frappe-call", method, args],
    queryFn: () => frappeCall<T>(method, args ?? undefined),
    enabled: opts?.enabled !== false,
    staleTime: opts?.staleTime
  });
}

export function useFrappeMutation<T = unknown>(
  method: string,
  opts?: { invalidateKeys?: string[][] }
) {
  const qc = useQueryClient();
  return useMutation<T, Error, Record<string, string | number | boolean | null | undefined>>({
    mutationFn: (args) => frappeCall<T>(method, args),
    onSuccess: () => {
      if (opts?.invalidateKeys) {
        for (const key of opts.invalidateKeys) {
          void qc.invalidateQueries({ queryKey: key });
        }
      }
    }
  });
}
