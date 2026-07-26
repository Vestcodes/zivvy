import type { Metadata } from "next";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { DashboardAttention } from "@/components/dashboard/dashboard-attention";
import { PendingTierHandoff } from "@/components/billing/pending-tier-handoff";
import { SeatsReturnToast } from "@/components/billing/seats-return-toast";
import { fetchDashboardData } from "@/lib/dashboard-data";
import { fetchBootinfo } from "@/lib/boot-server";

function getCurrencySymbol(code: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

export const metadata: Metadata = {
  title: "Dashboard — Zivvy"
};

export default async function DashboardPage() {
  const [{ kpis, attention, activity }, boot] = await Promise.all([
    fetchDashboardData(),
    fetchBootinfo()
  ]);
  const currencySymbol = getCurrencySymbol(String(boot.sysdefaults?.currency ?? "USD"));
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <PendingTierHandoff />
      <SeatsReturnToast />
      <DashboardHero />
      <DashboardKpis data={kpis} currency={currencySymbol} />
      <div className="grid gap-3 lg:grid-cols-3">
        <DashboardAttention items={attention} className="lg:col-span-2" />
        <DashboardActivity items={activity} />
      </div>
    </div>
  );
}
