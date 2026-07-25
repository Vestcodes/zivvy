"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  polarSuccess?: boolean;
  polarCancelled?: boolean;
  tier?: string;
  billing?: string;
  /**
   * Where to send the user after firing the toast. Callers on `/settings`
   * (which already redirects) should skip this; callers who want to keep the
   * user on the current page can omit it.
   */
  redirectTo?: string | null;
}

/**
 * Fires a sonner toast on mount reflecting the Polar checkout outcome, then
 * (optionally) navigates away — used on `/settings` so the user lands on a
 * useful sub-page after a successful (or cancelled) tier checkout.
 */
export function PolarReturnToast({
  polarSuccess,
  polarCancelled,
  tier,
  billing,
  redirectTo,
}: Props) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (polarSuccess) {
      const label = formatTier(tier);
      const cadence = billing === "annual" ? " (annual)" : "";
      toast.success(`You're now on the ${label} plan${cadence}.`);
    } else if (polarCancelled) {
      toast("Checkout cancelled — pick a plan when you're ready.");
    }

    if (redirectTo) {
      // Use replace so the polar_success / polar_cancelled params don't stay
      // in the history and re-fire on Back navigation.
      router.replace(redirectTo);
    }
  }, [polarSuccess, polarCancelled, tier, billing, redirectTo, router]);

  return null;
}

function formatTier(tier: string | undefined): string {
  if (tier === "pro") return "Pro";
  if (tier === "business") return "Business";
  return "paid";
}
