import type { Metadata } from "next";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { DashboardAttention } from "@/components/dashboard/dashboard-attention";
import { fetchDashboardData } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard — Zivvy"
};

export default async function DashboardPage() {
  const { kpis, attention, activity } = await fetchDashboardData();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <DashboardHero />
      <DashboardKpis data={kpis} />
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardAttention items={attention} className="lg:col-span-2" />
        <DashboardActivity items={activity} />
      </div>
    </div>
  );
}
