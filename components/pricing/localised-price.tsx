"use client";

/**
 * `<LocalisedPrice usdCents={1800} />` — the one price-render primitive.
 *
 * Reads the RegionProvider snapshot (populated on the server from cookies +
 * Vercel geo headers) so SSR and hydration match without a flash of USD.
 * If you're outside a RegionProvider the default snapshot (US / USD / 1.0)
 * kicks in, which is exactly the same fallback the middleware writes on
 * the first request.
 *
 * Callers pass USD *cents* — the same shape our webhooks + Polar catalog
 * carry — so we can compose PPP into integer maths without float drift.
 */

import { useMemo } from "react";
import { formatLocalisedPrice } from "@/lib/pricing";
import { useRegion } from "@/hooks/use-region";
import { cn } from "@/lib/utils";

interface Props {
  /** Base USD price in cents. e.g. $18 → `1800`. */
  usdCents: number;
  /**
   * Optional currency override — bypasses the region context entirely.
   * Handy for a comparison label that must stay in USD.
   */
  currency?: string;
  /** Optional PPP factor override (0..1). Ignored when `currency` is set. */
  ppp?: number;
  /** Optional BCP-47 locale override. Default resolves from currency. */
  locale?: string;
  className?: string;
  /**
   * When true, suppress the PPP factor entirely (checkout-side display
   * where we quote the FX-only price without the discount).
   */
  ignorePpp?: boolean;
}

export function LocalisedPrice({
  usdCents,
  currency: currencyProp,
  ppp: pppProp,
  locale,
  className,
  ignorePpp = false
}: Props) {
  const region = useRegion();

  const formatted = useMemo(() => {
    const currency = currencyProp ?? region.currency;
    const ppp = ignorePpp ? 1 : pppProp ?? region.pppFactor;
    return formatLocalisedPrice(usdCents, { currency, ppp, locale });
  }, [
    usdCents,
    currencyProp,
    pppProp,
    ignorePpp,
    locale,
    region.currency,
    region.pppFactor
  ]);

  return (
    <span
      // `tabular-nums` keeps the digit columns aligned when the toggle
      // swaps monthly/annual — matches every other price render in the app.
      className={cn("tabular-nums", className)}
      // Screen reader + copy-paste stay clean; visual is identical.
      aria-label={formatted}
    >
      {formatted}
    </span>
  );
}
