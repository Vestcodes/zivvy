"use client";

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

interface CountryGroup {
  label: string;
  countries: CountryOption[];
}

const COUNTRY_GROUPS: CountryGroup[] = [
  {
    label: "Americas",
    countries: [
      { code: "US", label: "United States", flag: "🇺🇸" },
      { code: "CA", label: "Canada", flag: "🇨🇦" },
      { code: "BR", label: "Brazil", flag: "🇧🇷" },
      { code: "MX", label: "Mexico", flag: "🇲🇽" },
      { code: "AR", label: "Argentina", flag: "🇦🇷" },
      { code: "CL", label: "Chile", flag: "🇨🇱" },
      { code: "CO", label: "Colombia", flag: "🇨🇴" },
      { code: "PE", label: "Peru", flag: "🇵🇪" },
    ],
  },
  {
    label: "Europe",
    countries: [
      { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
      { code: "DE", label: "Germany", flag: "🇩🇪" },
      { code: "FR", label: "France", flag: "🇫🇷" },
      { code: "NL", label: "Netherlands", flag: "🇳🇱" },
      { code: "IT", label: "Italy", flag: "🇮🇹" },
      { code: "ES", label: "Spain", flag: "🇪🇸" },
      { code: "BE", label: "Belgium", flag: "🇧🇪" },
      { code: "IE", label: "Ireland", flag: "🇮🇪" },
      { code: "PT", label: "Portugal", flag: "🇵🇹" },
      { code: "AT", label: "Austria", flag: "🇦🇹" },
      { code: "CH", label: "Switzerland", flag: "🇨🇭" },
      { code: "SE", label: "Sweden", flag: "🇸🇪" },
      { code: "NO", label: "Norway", flag: "🇳🇴" },
      { code: "DK", label: "Denmark", flag: "🇩🇰" },
      { code: "FI", label: "Finland", flag: "🇫🇮" },
      { code: "PL", label: "Poland", flag: "🇵🇱" },
      { code: "CZ", label: "Czech Republic", flag: "🇨🇿" },
      { code: "HU", label: "Hungary", flag: "🇭🇺" },
      { code: "RO", label: "Romania", flag: "🇷🇴" },
      { code: "BG", label: "Bulgaria", flag: "🇧🇬" },
      { code: "HR", label: "Croatia", flag: "🇭🇷" },
      { code: "GR", label: "Greece", flag: "🇬🇷" },
      { code: "UA", label: "Ukraine", flag: "🇺🇦" },
      { code: "TR", label: "Türkiye", flag: "🇹🇷" },
    ],
  },
  {
    label: "Asia Pacific",
    countries: [
      { code: "IN", label: "India", flag: "🇮🇳" },
      { code: "JP", label: "Japan", flag: "🇯🇵" },
      { code: "AU", label: "Australia", flag: "🇦🇺" },
      { code: "NZ", label: "New Zealand", flag: "🇳🇿" },
      { code: "SG", label: "Singapore", flag: "🇸🇬" },
      { code: "HK", label: "Hong Kong", flag: "🇭🇰" },
      { code: "KR", label: "South Korea", flag: "🇰🇷" },
      { code: "TW", label: "Taiwan", flag: "🇹🇼" },
      { code: "MY", label: "Malaysia", flag: "🇲🇾" },
      { code: "TH", label: "Thailand", flag: "🇹🇭" },
      { code: "ID", label: "Indonesia", flag: "🇮🇩" },
      { code: "PH", label: "Philippines", flag: "🇵🇭" },
      { code: "VN", label: "Vietnam", flag: "🇻🇳" },
      { code: "CN", label: "China", flag: "🇨🇳" },
      { code: "PK", label: "Pakistan", flag: "🇵🇰" },
      { code: "BD", label: "Bangladesh", flag: "🇧🇩" },
      { code: "LK", label: "Sri Lanka", flag: "🇱🇰" },
    ],
  },
  {
    label: "Middle East & Africa",
    countries: [
      { code: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
      { code: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
      { code: "IL", label: "Israel", flag: "🇮🇱" },
      { code: "EG", label: "Egypt", flag: "🇪🇬" },
      { code: "ZA", label: "South Africa", flag: "🇿🇦" },
      { code: "NG", label: "Nigeria", flag: "🇳🇬" },
      { code: "KE", label: "Kenya", flag: "🇰🇪" },
    ],
  },
];

const ALL_CODES = new Set(
  COUNTRY_GROUPS.flatMap((g) => g.countries.map((c) => c.code))
);

interface Props {
  className?: string;
  triggerClassName?: string;
  label?: string;
}

export function RegionPicker({ className, triggerClassName, label }: Props) {
  const region = useRegion();

  const groups = useMemo<CountryGroup[]>(() => {
    if (ALL_CODES.has(region.country) || !REGION_CURRENCY[region.country]) {
      return COUNTRY_GROUPS;
    }
    return [
      ...COUNTRY_GROUPS,
      {
        label: "Other",
        countries: [
          { code: region.country, label: region.country, flag: "🌐" },
        ],
      },
    ];
  }, [region.country]);

  const allCountries = groups.flatMap((g) => g.countries);
  const activeOption = allCountries.find((o) => o.code === region.country) ?? {
    code: region.country,
    label: region.country,
    flag: "🌐",
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
        <SelectContent className="max-h-[320px]">
          {groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.countries.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
