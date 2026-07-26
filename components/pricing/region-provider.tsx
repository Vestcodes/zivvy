"use client";

/**
 * `<RegionProvider>` — carries the server-resolved region snapshot into
 * the client tree.
 *
 * The Root Layout (server component) calls `getRegionFromRequestOrCookie()`,
 * hands the result down as `initial`, and every client component under
 * this provider gets consistent SSR/hydration values via `useRegion()`.
 * On the client, `setRegion()` writes the same three cookies the Edge
 * middleware would set and refreshes the router so any server-rendered
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
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import {
  pppFactorToBasisPoints,
  resolveCurrency,
  resolvePpp,
  resolveRegion
} from "@/lib/pricing";

export interface RegionSnapshot {
  country: string;
  currency: string;
  pppFactor: number;
  region: string;
}

interface RegionContextValue extends RegionSnapshot {
  /** True once the user picked a region explicitly this session. */
  overridden: boolean;
  /** Persist a new region choice — mirrors middleware cookie writes. */
  setRegion: (country: string) => void;
}

const DEFAULT: RegionSnapshot = {
  country: "US",
  currency: "USD",
  pppFactor: 1,
  region: "us"
};

const RegionContext = createContext<RegionContextValue>({
  ...DEFAULT,
  overridden: false,
  setRegion: () => {
    /* no-op outside provider */
  }
});

interface Props {
  initial?: RegionSnapshot;
  children: ReactNode;
}

const COOKIE_MAX_AGE_DAYS = 30;

/**
 * Write the same three cookies the Edge middleware sets. Kept here so a
 * client-side region switch stays consistent with a server-side rewrite
 * on the next navigation.
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
  const bp = pppFactorToBasisPoints(snapshot.pppFactor);
  document.cookie = `zv_country=${snapshot.country}; ${base}`;
  document.cookie = `zv_currency=${snapshot.currency}; ${base}`;
  document.cookie = `zv_ppp_bp=${bp}; ${base}`;
}

export function RegionProvider({ initial, children }: Props) {
  const seed = initial ?? DEFAULT;
  const [snapshot, setSnapshot] = useState<RegionSnapshot>(seed);
  const [overridden, setOverridden] = useState(false);
  const router = useRouter();

  const setRegion = useCallback(
    (raw: string) => {
      const country = raw.trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(country)) return;
      const next: RegionSnapshot = {
        country,
        currency: resolveCurrency(country),
        pppFactor: resolvePpp(country),
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

  const value = useMemo<RegionContextValue>(
    () => ({ ...snapshot, overridden, setRegion }),
    [snapshot, overridden, setRegion]
  );

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
}

export function useRegionContext() {
  return useContext(RegionContext);
}
