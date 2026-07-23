import { frappeGetCount, reportviewGet } from "@/lib/frappe-meta";

/**
 * Utility: return a YYYY-MM-DD string for a given Date.
 */
function toDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function firstOfMonth(): string {
  const d = new Date();
  return toDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

function firstOfLastMonth(): string {
  const d = new Date();
  return toDay(new Date(d.getFullYear(), d.getMonth() - 1, 1));
}

function firstOfThisMonth(): string {
  const d = new Date();
  return toDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  return toDay(m);
}

function startOfLastWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) - 7;
  const m = new Date(d);
  m.setDate(diff);
  return toDay(m);
}

function today(): string {
  return toDay(new Date());
}

async function sumField(
  doctype: string,
  field: string,
  filters: Array<[string, string, string, string | number | boolean]>
): Promise<number> {
  const res = await reportviewGet({
    doctype,
    fields: [field],
    filters,
    page_length: 500
  });
  if (!res?.values) return 0;
  return res.values.reduce((sum, row) => sum + Number(row[field] ?? 0), 0);
}

// ---------- KPIs ----------

export interface KpiData {
  revenue: {
    current: number;
    previous: number;
    deltaPct: number | null;
  };
  outstanding: number;
  leads: {
    current: number;
    previous: number;
    delta: number;
  };
  stockAlerts: number;   // count of items with a reorder_level > 0 (placeholder proxy)
}

export async function fetchKpis(): Promise<KpiData> {
  const [revThis, revLast, outstandingSum, leadsThis, leadsLast, stockAlerts] = await Promise.all([
    sumField("Sales Invoice", "grand_total", [
      ["Sales Invoice", "docstatus", "=", 1],
      ["Sales Invoice", "posting_date", ">=", firstOfThisMonth()]
    ]),
    sumField("Sales Invoice", "grand_total", [
      ["Sales Invoice", "docstatus", "=", 1],
      ["Sales Invoice", "posting_date", ">=", firstOfLastMonth()],
      ["Sales Invoice", "posting_date", "<", firstOfMonth()]
    ]),
    sumField("Sales Invoice", "outstanding_amount", [
      ["Sales Invoice", "docstatus", "=", 1],
      ["Sales Invoice", "outstanding_amount", ">", 0]
    ]),
    frappeGetCount("Lead", { creation: [">=", startOfWeek()] }),
    frappeGetCount("Lead", {
      creation: ["between", [startOfLastWeek(), startOfWeek()]]
    }),
    frappeGetCount("Item", { disabled: 0, has_variants: 0, reorder_level: [">", 0] })
  ]);

  const deltaPct =
    revLast > 0
      ? Math.round(((revThis - revLast) / revLast) * 1000) / 10
      : revThis > 0
        ? null
        : 0;

  return {
    revenue: { current: revThis, previous: revLast, deltaPct },
    outstanding: outstandingSum,
    leads: {
      current: leadsThis,
      previous: leadsLast,
      delta: leadsThis - leadsLast
    },
    stockAlerts
  };
}

// ---------- Needs your attention ----------

export interface AttentionItem {
  kind: "overdue-invoice" | "arriving-po" | "low-stock";
  title: string;
  meta: string;
  href: string;
  severity: "warning" | "info" | "critical";
}

export async function fetchAttention(): Promise<AttentionItem[]> {
  const now = today();
  const [overdue, arriving] = await Promise.all([
    reportviewGet({
      doctype: "Sales Invoice",
      fields: ["name", "customer", "outstanding_amount", "due_date", "grand_total"],
      filters: [
        ["Sales Invoice", "docstatus", "=", 1],
        ["Sales Invoice", "outstanding_amount", ">", 0],
        ["Sales Invoice", "due_date", "<", now]
      ],
      order_by: "due_date asc",
      page_length: 3
    }),
    reportviewGet({
      doctype: "Purchase Order",
      fields: ["name", "supplier", "schedule_date"],
      filters: [
        ["Purchase Order", "docstatus", "=", 1],
        ["Purchase Order", "schedule_date", "=", now]
      ],
      page_length: 2
    })
  ]);

  const items: AttentionItem[] = [];

  for (const row of overdue?.values ?? []) {
    const dueStr = String(row.due_date ?? "");
    const due = new Date(dueStr);
    const daysLate = isNaN(due.getTime())
      ? 0
      : Math.floor((Date.now() - due.getTime()) / 86400_000);
    const outstanding = Number(row.outstanding_amount ?? 0);
    items.push({
      kind: "overdue-invoice",
      title: `${row.name} — ${daysLate} days overdue`,
      meta: `${row.customer ?? "—"} · $${outstanding.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      href: `/sales/invoices/${encodeURIComponent(String(row.name))}`,
      severity: daysLate > 10 ? "critical" : "warning"
    });
  }

  for (const row of arriving?.values ?? []) {
    items.push({
      kind: "arriving-po",
      title: `${row.name} arriving today`,
      meta: `Supplier: ${row.supplier ?? "—"}`,
      href: `/purchases/orders/${encodeURIComponent(String(row.name))}`,
      severity: "info"
    });
  }

  return items;
}

// ---------- Recent activity ----------

export interface ActivityItem {
  kind: "payment" | "delivery" | "lead" | "invoice";
  title: string;
  detail: string;
  when: string;   // relative
  whenIso: string;
  href: string;
}

function relative(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diff = Date.now() - then;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  const [payments, deliveries, leads, invoices] = await Promise.all([
    reportviewGet({
      doctype: "Payment Entry",
      fields: ["name", "party", "paid_amount", "modified"],
      filters: [["Payment Entry", "docstatus", "=", 1]],
      order_by: "modified desc",
      page_length: 2
    }),
    reportviewGet({
      doctype: "Delivery Note",
      fields: ["name", "customer", "modified"],
      filters: [["Delivery Note", "docstatus", "=", 1]],
      order_by: "modified desc",
      page_length: 2
    }),
    reportviewGet({
      doctype: "Lead",
      fields: ["name", "lead_name", "company_name", "creation"],
      order_by: "creation desc",
      page_length: 2
    }),
    reportviewGet({
      doctype: "Sales Invoice",
      fields: ["name", "customer", "grand_total", "modified"],
      filters: [["Sales Invoice", "docstatus", "=", 1]],
      order_by: "modified desc",
      page_length: 2
    })
  ]);

  const items: ActivityItem[] = [];

  for (const row of payments?.values ?? []) {
    const amt = Number(row.paid_amount ?? 0);
    const iso = String(row.modified ?? "");
    items.push({
      kind: "payment",
      title: "Payment received",
      detail: `$${amt.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} from ${row.party ?? "—"}`,
      when: relative(iso),
      whenIso: iso,
      href: `/finance/payments/${encodeURIComponent(String(row.name))}`
    });
  }
  for (const row of deliveries?.values ?? []) {
    const iso = String(row.modified ?? "");
    items.push({
      kind: "delivery",
      title: "Order shipped",
      detail: `${row.name} to ${row.customer ?? "—"}`,
      when: relative(iso),
      whenIso: iso,
      href: `/sales/deliveries/${encodeURIComponent(String(row.name))}`
    });
  }
  for (const row of leads?.values ?? []) {
    const iso = String(row.creation ?? "");
    items.push({
      kind: "lead",
      title: "New lead",
      detail: `${row.lead_name ?? row.name}${
        row.company_name ? ` · ${row.company_name}` : ""
      }`,
      when: relative(iso),
      whenIso: iso,
      href: `/crm/leads/${encodeURIComponent(String(row.name))}`
    });
  }
  for (const row of invoices?.values ?? []) {
    const iso = String(row.modified ?? "");
    items.push({
      kind: "invoice",
      title: "Invoice sent",
      detail: `${row.name} to ${row.customer ?? "—"}`,
      when: relative(iso),
      whenIso: iso,
      href: `/sales/invoices/${encodeURIComponent(String(row.name))}`
    });
  }

  items.sort((a, b) => (b.whenIso > a.whenIso ? 1 : -1));
  return items.slice(0, 6);
}

export interface DashboardData {
  kpis: KpiData;
  attention: AttentionItem[];
  activity: ActivityItem[];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [kpis, attention, activity] = await Promise.all([
    fetchKpis(),
    fetchAttention(),
    fetchActivity()
  ]);
  return { kpis, attention, activity };
}
