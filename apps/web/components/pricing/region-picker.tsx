"use client";

/**
 * `<RegionPicker>` — dropdown that lets a user preview localised pricing
 * for a different country. Writes the same country/currency cookies the
 * middleware would set via the `RegionProvider.setRegion()` shim, then
 * `router.refresh()` so any server-rendered price re-runs.
 *
 * Kept intentionally lean: a curated list of the countries we actually
 * profile on marketing pages. Full 240-country picker isn't a v1 need.
 */

import { useMemo } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { REGION_CURRENCY } from "@/lib/pricing";
import { useRegion } from "@/hooks/use-region";
import { cn } from "@/lib/utils";

interface CountryOption {
  code: string;
  label: string;
  flag: string;
}

/**
 * The visible menu — a single list of countries we actively profile on
 * marketing pages. Country selection drives which Polar-native currency
 * the tier cards render.
 */
const MARKETING_CODES: CountryOption[] = [
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "SG", label: "Singapore", flag: "🇸🇬" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { code: "ZA", label: "South Africa", flag: "🇿🇦" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
  { code: "ID", label: "Indonesia", flag: "🇮🇩" },
  { code: "PL", label: "Poland", flag: "🇵🇱" },
  { code: "PH", label: "Philippines", flag: "🇵🇭" },
  { code: "PK", label: "Pakistan", flag: "🇵🇰" },
  { code: "TR", label: "Türkiye", flag: "🇹🇷" }
];

interface Props {
  className?: string;
  triggerClassName?: string;
  /** Optional label rendered above the trigger, e.g. "Prices in". */
  label?: string;
}

export function RegionPicker({ className, triggerClassName, label }: Props) {
  const region = useRegion();

  // Guarantee the active country is present — a user landing from an
  // obscure country should still see their own flag as the current value.
  const options = useMemo<CountryOption[]>(() => {
    const seen = new Set(MARKETING_CODES.map((o) => o.code));
    const merged = [...MARKETING_CODES];
    if (!seen.has(region.country) && REGION_CURRENCY[region.country]) {
      merged.push({
        code: region.country,
        label: region.country,
        flag: "🌐"
      });
    }
    return merged;
  }, [region.country]);

  const activeOption = options.find((o) => o.code === region.country) ?? {
    code: region.country,
    label: region.country,
    flag: "🌐"
  };

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      )}
      <Select
        value={region.country}
        onValueChange={(v) => region.setRegion(v)}
      >
        <SelectTrigger
          aria-label="Change pricing region"
          className={cn(
            "h-9 min-w-[10rem] gap-2 border-border/70 bg-background/70 pl-3 pr-2 text-sm backdrop-blur",
            triggerClassName
          )}
        >
          <Globe className="size-3.5 text-muted-foreground" aria-hidden />
          <SelectValue placeholder="Region">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>{activeOption.flag}</span>
              <span>{activeOption.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Currency</SelectLabel>
            {options.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{opt.flag}</span>
                  <span>{opt.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
