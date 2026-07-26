"use client";

/**
 * `<PppNotice>` — small marketing-pricing banner shown when the user's
 * resolved PPP factor is below 1.0.
 *
 * Copy is deliberately neutral ("Prices adjusted for your region") — we do
 * not use the word "discount", which reads as consumer-y and would trigger
 * PPP-abuse expectations (Polar checkout still runs USD in v1). Links to
 * `/pricing#regional-pricing` where the FAQ block explains what "adjusted"
 * means.
 *
 * Renders nothing at all when PPP is 1.0 — no wasted layout space on the
 * majority of visitors.
 */

import Link from "next/link";
import { Info } from "lucide-react";
import { useRegion } from "@/hooks/use-region";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Optional country name override for the copy — otherwise "your region". */
  regionLabel?: string;
  /** Compact variant — inline chip instead of a full banner. */
  variant?: "banner" | "chip";
}

export function PppNotice({
  className,
  regionLabel,
  variant = "banner"
}: Props) {
  const region = useRegion();
  if (region.pppFactor >= 1) return null;

  const percentOff = Math.round((1 - region.pppFactor) * 100);
  const label = regionLabel ?? "your region";

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-medium text-primary",
          className
        )}
        role="note"
      >
        <Info className="size-3" aria-hidden />
        <span>
          Adjusted <span className="tabular-nums">−{percentOff}%</span> for{" "}
          {label}
        </span>
      </span>
    );
  }

  return (
    <div
      role="note"
      className={cn(
        "mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.05] px-4 py-3 text-sm text-foreground/90",
        className
      )}
    >
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Info className="size-3.5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="font-medium text-foreground">
          Prices adjusted for {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Displayed prices reflect a{" "}
          <span className="tabular-nums font-medium text-foreground">
            {percentOff}%
          </span>{" "}
          regional adjustment. Checkout is billed in USD — your bank handles the
          FX conversion.{" "}
          <Link
            href="/pricing#regional-pricing"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            How this works
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
