"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Shared billing-cycle state for the pricing page. The toggle lives in
 * `<PricingHero>` (client) but the tier cards in `<PricingPreview>` render
 * prices that depend on the same value — a context lets them stay in sync
 * without a full re-render trip through the URL.
 *
 * We still mirror to `?billing=` so deep links (and refresh) preserve the
 * user's choice.
 */

export type BillingCycle = "monthly" | "annual";

interface BillingContextValue {
  billing: BillingCycle;
  setBilling: (next: BillingCycle) => void;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function PricingBillingProvider({ children }: { children: React.ReactNode }) {
  const [billing, setBillingState] = useState<BillingCycle>("monthly");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const value = params.get("billing");
    if (value === "annual" || value === "monthly") setBillingState(value);
  }, []);

  const setBilling = useCallback((next: BillingCycle) => {
    setBillingState(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next === "monthly") url.searchParams.delete("billing");
    else url.searchParams.set("billing", next);
    history.replaceState(null, "", url.toString());
  }, []);

  return (
    <BillingContext.Provider value={{ billing, setBilling }}>
      {children}
    </BillingContext.Provider>
  );
}

export function usePricingBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error(
      "usePricingBilling must be used inside <PricingBillingProvider>"
    );
  }
  return ctx;
}
