import type { Metadata } from "next";
import Link from "next/link";
import { PlanCard } from "@/components/billing/plan-card";
import { ManagePlan } from "@/components/billing/manage-plan";
import { ActiveAddons } from "@/components/billing/active-addons";
import { Button } from "@/components/ui/button";
import { fetchBootinfo } from "@/lib/boot-server";

export const metadata: Metadata = {
  title: "Billing — Zivvy",
  description: "Manage your Zivvy plan, seats, and subscription."
};

export default async function BillingPage() {
  const boot = await fetchBootinfo();

  if (!boot.zivvy) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Billing
        </h1>
        <p className="mt-4 text-muted-foreground">
          Your account is still provisioning. Please try again in a moment.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const hasSubscription = Boolean(
    boot.zivvy.tenant?.polar_subscription_id ||
      ["active", "trialing", "past_due"].includes(boot.zivvy.subscription_status)
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Billing
        </h1>
        <p className="mt-2 text-muted-foreground">
          Plan, seats, and subscription.
        </p>
      </div>

      <PlanCard zivvy={boot.zivvy} />
      <div className="mt-8">
        <ManagePlan hasSubscription={hasSubscription} currentTier={boot.zivvy.tier} />
      </div>
      <div className="mt-8">
        <ActiveAddons />
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Checkout is processed by our payment provider. By upgrading you agree to the{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>
        ,{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/refunds" className="underline underline-offset-2 hover:text-foreground">
          Billing &amp; Refunds
        </Link>{" "}
        policy.
      </p>
    </div>
  );
}
