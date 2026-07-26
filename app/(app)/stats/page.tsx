import type { Metadata } from "next";
import { fetchBootinfo } from "@/lib/boot-server";
import { tierAtLeast } from "@/lib/boot-types";
import { UpgradeRequired } from "@/components/upgrade-required";

export const metadata: Metadata = { title: "Stats — Zivvy" };

export default async function StatsPage() {
  const boot = await fetchBootinfo();
  const tier = boot.zivvy?.tier ?? "free";

  if (!tierAtLeast(tier, "business")) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Stats</h1>
          <p className="text-sm text-muted-foreground">
            Analytics and business intelligence dashboards
          </p>
        </header>
        <UpgradeRequired featureName="Stats & Insights" requiredTier="business" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Stats</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and business intelligence dashboards
        </p>
      </header>
      <div className="flex flex-col items-center justify-center rounded-lg border border-border/70 bg-card/60 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Insights dashboards are coming soon. We&apos;re building custom analytics
          tailored to your business — stay tuned.
        </p>
      </div>
    </div>
  );
}
