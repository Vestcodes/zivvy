"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  clearPendingTier,
  isTierSlug,
  normalizeBilling,
  readPendingTier,
  startTierCheckout,
  type BillingCadence,
  type TierSlug,
} from "@/lib/tier-checkout";

/**
 * Silent handoff for users returning from the pricing tiles.
 *
 * Two pickup surfaces:
 *
 * - URL params: `/dashboard?plan=pro&billing=monthly` — set by
 *   `/login/page.tsx` when an already-signed-in user hits `/login?plan=…`.
 * - LocalStorage: written by the sign-up form after a successful sign-up so
 *   the intent survives the email-verification round trip.
 *
 * The component renders nothing and clears both surfaces once it kicks off
 * checkout, so a refresh doesn't loop the user through Polar again.
 */
export function PendingTierHandoff() {
  const router = useRouter();
  const search = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    // 1. URL params take priority — most recent, explicit intent.
    let tier: TierSlug | null = null;
    let billing: BillingCadence = "monthly";

    const planParam = search?.get("plan");
    if (isTierSlug(planParam)) {
      tier = planParam;
      billing = normalizeBilling(search?.get("billing"));
    } else {
      // 2. Fall back to a stashed intent from the sign-up flow.
      const stashed = readPendingTier();
      if (stashed) {
        tier = stashed.tier;
        billing = stashed.billing;
      }
    }

    if (!tier) return;
    started.current = true;
    clearPendingTier();

    // Strip the plan / billing params so a page refresh doesn't re-enter
    // checkout after the user finishes on Polar.
    if (planParam && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      url.searchParams.delete("billing");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    void (async () => {
      try {
        const handedOff = await startTierCheckout(tier!, billing, (path) =>
          router.push(path)
        );
        if (!handedOff) {
          toast.error(
            "We couldn't start your plan checkout — please try again from the pricing page."
          );
        }
      } catch {
        toast.error(
          "We couldn't start your plan checkout — please try again from the pricing page."
        );
      }
    })();
    // Only fire once per mount; router / search are stable enough for our use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
