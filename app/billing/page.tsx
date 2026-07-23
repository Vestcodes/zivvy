import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PlanCard } from "@/components/billing/plan-card";
import { ManagePlan } from "@/components/billing/manage-plan";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Billing — Zivvy",
  description: "Manage your Zivvy plan, seats, and subscription."
};

export default async function BillingPage() {
  const boot = await fetchBootinfo();

  if (!boot.logged_in) {
    redirect("/login?redirect-to=/billing");
  }

  if (!boot.zivvy) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-bold">Billing</h1>
          <p className="mt-4 text-muted-foreground">
            Your account isn't fully provisioned yet. Please try again in a moment.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/app/zivvy-home">Back to dashboard</Link>
          </Button>
        </main>
        <SiteFooter />
      </>
    );
  }

  const hasSubscription = Boolean(
    boot.zivvy.tenant?.polar_subscription_id ||
      ["active", "trialing", "past_due"].includes(boot.zivvy.subscription_status)
  );

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Billing
            </h1>
            <p className="mt-2 text-muted-foreground">
              Plan, seats, and subscription. Payments handled by Polar.
            </p>
          </div>

          <PlanCard zivvy={boot.zivvy} />
          <div className="mt-8">
            <ManagePlan hasSubscription={hasSubscription} currentTier={boot.zivvy.tier} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
