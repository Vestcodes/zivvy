"use client";

/**
 * `<LocalisedPrice />` — the one price-render primitive.
 *
 * Three shapes, in priority order:
 *   • `<LocalisedPrice tier="pro" billing="monthly" amountCents={1800} />` —
 *     read the backend-formatted string for that tier/billing out of the
 *     `RegionProvider` catalog and render it as-is. Falls back to
 *     `amountCents` formatted as USD if the catalog isn't ready yet.
 *   • `<LocalisedPrice value="₹1,999" />` — render a pre-formatted string
 *     verbatim. Used when the caller already has the backend `formatted`.
 *   • `<LocalisedPrice amountCents={1800} currency="USD" />` — format a
 *     native-unit amount via `Intl.NumberFormat`. Used for add-ons and
 *     seat-delta UI that reference USD Polar-native prices directly (no
 *     PPP math, no FX conversion).
 *
 * Optional `showUsdNote` renders a "Billed in USD at checkout" line under
 * the price when the region's currency isn't natively supported by Polar.
 */

import { useMemo } from "react";
import { useRegion } from "@/hooks/use-region";
import { formatLocalisedPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface Props {
  /** Pre-formatted price string. Wins over amountCents. */
  value?: string;
  /** Amount in the currency's minor units (cents / paise / …). */
  amountCents?: number;
  /** ISO-4217 currency code for `amountCents`. Defaults to USD. */
  currency?: string;
  /** Optional BCP-47 locale override for `Intl.NumberFormat`. */
  locale?: string;
  className?: string;
  /**
   * Tier + billing pair — when both are set we pull the backend-formatted
   * price out of the region catalog. Falls back to `amountCents` formatting
   * while the catalog is loading or errored.
   */
  tier?: "pro" | "business";
  billing?: "monthly" | "annual";
  /**
   * When true AND the region's currency isn't a Polar checkout currency,
   * render a small caption clarifying that the final charge is in USD.
   */
  showUsdNote?: boolean;
}

export function LocalisedPrice({
  value,
  amountCents,
  currency,
  locale,
  className,
  tier,
  billing,
  showUsdNote
}: Props) {
  const region = useRegion();

  const catalogFormatted = useMemo(() => {
    if (!tier || !billing) return null;
    if (region.catalogState !== "ready") return null;
    return region.catalog?.tiers?.[tier]?.[billing]?.formatted ?? null;
  }, [tier, billing, region.catalog, region.catalogState]);

  const formatted = useMemo(() => {
    if (catalogFormatted) return catalogFormatted;
    if (value !== undefined) return value;
    const amount = (amountCents ?? 0) / 100;
    return formatLocalisedPrice(amount, {
      currency: currency ?? "USD",
      locale
    });
  }, [catalogFormatted, value, amountCents, currency, locale]);

  const priceSpan = (
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

  const shouldShowNote = showUsdNote && !region.checkoutCurrencySupported;
  if (!shouldShowNote) return priceSpan;

  return (
    <span className="inline-flex flex-col">
      {priceSpan}
      <span className="block text-xs text-muted-foreground mt-0.5">
        Billed in USD at checkout
      </span>
    </span>
  );
}
