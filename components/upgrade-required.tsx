import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZivvyTier } from "@/lib/boot-types";

const TIER_LABEL: Record<ZivvyTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business"
};

/**
 * First-class 403-with-context state. Render this wherever `useEntitlement`
 * returns `allowed: false, reason: "tier"`. Distinct from generic "no permission".
 */
export function UpgradeRequired({
  featureName,
  requiredTier
}: {
  featureName: string;
  requiredTier: ZivvyTier;
}) {
  return (
    <Card className="mx-auto max-w-md border-border/70 bg-card/60 text-center">
      <CardHeader>
        <div className="bg-primary-gradient mx-auto grid size-12 place-items-center rounded-full text-primary-foreground shadow-elevation-md">
          <Sparkles className="size-6" />
        </div>
        <CardTitle className="mt-3 font-display">
          {featureName} needs {TIER_LABEL[requiredTier]}
        </CardTitle>
        <CardDescription>
          This feature is included on the {TIER_LABEL[requiredTier]} plan and above.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild variant="polished">
          <Link href="/billing">Upgrade plan</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">See plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
