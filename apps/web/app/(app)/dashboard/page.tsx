import type { Metadata } from "next";
import { LedgerDashboard } from "@/components/dashboard/ledger-dashboard";
import { PendingTierHandoff } from "@/components/billing/pending-tier-handoff";
import { SeatsReturnToast } from "@/components/billing/seats-return-toast";

export const metadata: Metadata = {
  title: "Dashboard — Zivvy"
};

export default async function DashboardPage() {
  return (
    <>
      <PendingTierHandoff />
      <SeatsReturnToast />
      <LedgerDashboard />
    </>
  );
}
