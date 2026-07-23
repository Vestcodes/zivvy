"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  GUEST_BOOT,
  tierAtLeast,
  type Bootinfo,
  type ZivvyTier
} from "@/lib/boot-types";

const BootContext = createContext<Bootinfo>(GUEST_BOOT);

export function BootProvider({
  bootinfo,
  children
}: {
  bootinfo: Bootinfo;
  children: ReactNode;
}) {
  return <BootContext.Provider value={bootinfo}>{children}</BootContext.Provider>;
}

export function useBoot(): Bootinfo {
  return useContext(BootContext);
}

export function useZivvyBoot() {
  return useBoot().zivvy;
}

/**
 * Read the effective tier of the current user's tenant.
 * Always resolves — falls back to "free" when not signed in.
 */
export function useTier(): ZivvyTier {
  return useZivvyBoot()?.tier ?? "free";
}

export interface EntitlementResult {
  allowed: boolean;
  required: ZivvyTier | null;
  reason: "ok" | "tier" | "not-signed-in";
}

/**
 * UX-only gating primitive. Backend is source of truth — always render
 * upgrade UI when this returns `allowed: false` rather than hiding
 * the feature entirely.
 */
export function useEntitlement(
  kind: "doctype" | "module",
  name: string
): EntitlementResult {
  const boot = useZivvyBoot();
  if (!boot) return { allowed: false, required: null, reason: "not-signed-in" };

  const table = kind === "doctype" ? boot.doctype_min_tier : boot.module_min_tier;
  const required = (table?.[name] as ZivvyTier | undefined) ?? "free";
  const allowed = tierAtLeast(boot.tier, required);

  return {
    allowed,
    required,
    reason: allowed ? "ok" : "tier"
  };
}

export function useIsSignedIn(): boolean {
  return useBoot().logged_in;
}
