"use client";

/**
 * `<RegionProvider>` — carries the server-resolved region snapshot into
 * the client tree.
 *
 * The Root Layout (server component) calls `getRegionFromRequestOrCookie()`,
 * hands the result down as `initial`, and every client component under
 * this provider gets consistent SSR/hydration values via `useRegion()`.
 * On the client, `setRegion()` writes the same country/currency cookies the
 * Edge middleware would set and refreshes the router so any server-rendered
 * price also reruns.
 *
 * Keeping the write-side symmetric with the middleware is important — if
 * they drift, a user who picks India via `<RegionPicker>` on the client
 * will get an INR display but a USD-cookie SSR on the next request.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { resolveCurrency, resolveRegion } from "@/lib/pricing";

export interface RegionSnapshot {
  country: string;
  currency: string;
  region: string;
}

/**
 * Tiered catalog payload returned by
 * `zivvy_brand.pricing.api.get_localised_pricing?country=XX`. The provider
 * caches this so any `<LocalisedPrice tier=… billing=… />` on the page can
 * pull the backend-formatted string without spawning its own fetch.
 */
export interface TieredPriceLeaf {
  amount_cents: number;
  currency: string;
  formatted: string;
  source: string;
  price_id?: string;
}

export interface TieredCatalog {
  region: {
    country: string;
    currency: string;
    in_eu: boolean;
    known: boolean;
  };
  currency: string;
  tiers: {
    pro: { monthly: TieredPriceLeaf; annual: TieredPriceLeaf };
    business: { monthly: TieredPriceLeaf; annual: TieredPriceLeaf };
  };
  notes: {
    source: string;
    cache_state: string;
    checkout_currency_supported: boolean;
  };
}

export type CatalogState = "idle" | "loading" | "ready" | "error";

interface RegionContextValue extends RegionSnapshot {
  /** True once the user picked a region explicitly this session. */
  overridden: boolean;
  /** Persist a new region choice — mirrors middleware cookie writes. */
  setRegion: (country: string) => void;
  /** Latest tiered pricing payload for the current country, or null. */
  catalog: TieredCatalog | null;
  /** Fetch lifecycle for `catalog` — drives skeletons in consumers. */
  catalogState: CatalogState;
  /**
   * Backend-declared: does Polar accept a subscription in the local
   * currency, or will checkout fall back to USD? Drives the "Billed in USD"
   * disclosure under localised prices.
   */
  checkoutCurrencySupported: boolean;
}

const DEFAULT: RegionSnapshot = {
  country: "US",
  currency: "USD",
  region: "us"
};

const RegionContext = createContext<RegionContextValue>({
  ...DEFAULT,
  overridden: false,
  setRegion: () => {
    /* no-op outside provider */
  },
  catalog: null,
  catalogState: "idle",
  checkoutCurrencySupported: true
});

interface Props {
  initial?: RegionSnapshot;
  children: ReactNode;
}

const COOKIE_MAX_AGE_DAYS = 30;

const catalogCache = new Map<string, TieredCatalog>();

/**
 * Write the same country/currency cookies the Edge middleware sets. Kept
 * here so a client-side region switch stays consistent with a server-side
 * rewrite on the next navigation.
 */
function writeCookies(snapshot: RegionSnapshot) {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toUTCString();
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  const base = `Path=/; Expires=${expires}; SameSite=Lax${secure}`;
  document.cookie = `zv_country=${snapshot.country}; ${base}`;
  document.cookie = `zv_currency=${snapshot.currency}; ${base}`;
}

export function RegionProvider({ initial, children }: Props) {
  const seed = initial ?? DEFAULT;
  const [snapshot, setSnapshot] = useState<RegionSnapshot>(seed);
  const [overridden, setOverridden] = useState(false);
  const [catalog, setCatalog] = useState<TieredCatalog | null>(null);
  const [catalogState, setCatalogState] = useState<CatalogState>("idle");
  const router = useRouter();

  const setRegion = useCallback(
    (raw: string) => {
      const country = raw.trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(country)) return;
      const next: RegionSnapshot = {
        country,
        currency: resolveCurrency(country),
        region: resolveRegion(country)
      };
      writeCookies(next);
      setSnapshot(next);
      setOverridden(true);
      // Re-render server components so any price rendered at the RSC
      // layer picks up the new cookies too.
      router.refresh();
    },
    [router]
  );

  // Fetch the tiered pricing catalog for the current country on mount and
  // whenever the country changes. Uses native fetch — no swr / react-query
  // dep — because this is a single endpoint per country and the response
  // already carries the exact formatted strings we want to render.
  useEffect(() => {
    let cancelled = false;
    const country = snapshot.country;

    const cached = catalogCache.get(country);
    if (cached) {
      setCatalog(cached);
      setCatalogState("ready");
      return;
    }

    setCatalogState("loading");
    fetch(
      `/api/method/zivvy_brand.pricing.api.get_localised_pricing?country=${encodeURIComponent(country)}`,
      {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      }
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const message = (data && data.message) as TieredCatalog | undefined;
        if (!message || !message.tiers) {
          throw new Error("empty catalog");
        }
        catalogCache.set(country, message);
        setCatalog(message);
        setCatalogState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setCatalog(null);
        setCatalogState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.country]);

  const checkoutCurrencySupported =
    catalog?.notes?.checkout_currency_supported ?? true;

  const value = useMemo<RegionContextValue>(
    () => ({
      ...snapshot,
      overridden,
      setRegion,
      catalog,
      catalogState,
      checkoutCurrencySupported
    }),
    [
      snapshot,
      overridden,
      setRegion,
      catalog,
      catalogState,
      checkoutCurrencySupported
    ]
  );

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
}

export function useRegionContext() {
  return useContext(RegionContext);
}
