import { cookies } from "next/headers";
import { FRAPPE_ORIGIN } from "@/lib/frappe-origin";

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
  stockAlerts: number;
}

export interface AttentionItem {
  kind: "overdue-invoice" | "arriving-po" | "low-stock";
  title: string;
  meta: string;
  href: string;
  severity: "warning" | "info" | "critical";
}

export interface ActivityItem {
  kind: "payment" | "delivery" | "lead" | "invoice";
  title: string;
  detail: string;
  when: string;
  whenIso: string;
  href: string;
}

export interface DashboardData {
  kpis: KpiData;
  attention: AttentionItem[];
  activity: ActivityItem[];
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

const EMPTY: DashboardData = {
  kpis: {
    revenue: { current: 0, previous: 0, deltaPct: 0 },
    outstanding: 0,
    leads: { current: 0, previous: 0, delta: 0 },
    stockAlerts: 0
  },
  attention: [],
  activity: []
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return EMPTY;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(
      `${FRAPPE_ORIGIN}/api/method/zivvy_brand.dashboard.api.get_dashboard_data`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookieHeader
        }
      }
    );
    if (!res.ok) return EMPTY;
    const json = await res.json();
    const data = json?.message ?? json;
    if (!data?.kpis) return EMPTY;

    const activity = (data.activity ?? []).map(
      (item: { whenIso?: string } & Record<string, unknown>) => ({
        ...item,
        when: relative(item.whenIso ?? "")
      })
    );

    return {
      kpis: data.kpis,
      attention: data.attention ?? [],
      activity
    };
  } catch {
    return EMPTY;
  }
}
