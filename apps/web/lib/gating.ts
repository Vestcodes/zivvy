/**
 * Shared gating logic. One source of truth for "is this thing gated for
 * the current user?" — used by the sidebar, launcher, awesomebar,
 * AutoList, and AutoForm.
 */

import { tierAtLeast, type ZivvyBoot, type ZivvyTier } from "@/lib/boot-types";

export interface GatedItem {
  /** Frappe module name (e.g. "Accounts") — checked against boot.blocked_modules. */
  module?: string;
  /** Explicit minimum tier (e.g. "pro") — checked against boot.tier. */
  minTier?: ZivvyTier;
  /** Doctype name — used to look up boot.doctype_min_tier. */
  doctype?: string;
}

export interface GatingStatus {
  gated: boolean;
  /** The tier a user needs to reach to unlock. */
  requiredTier?: ZivvyTier;
  /** Which signal fired ("module" | "tier" | "doctype"). */
  reason?: "module" | "tier" | "doctype";
}

const OPEN: GatingStatus = { gated: false };

/**
 * Given an item spec and the current boot payload, return whether the
 * current user should see this item as gated + which tier unlocks it.
 * Backend still enforces on every RPC; this is UX only.
 */
export function isItemGated(item: GatedItem, boot: ZivvyBoot | null): GatingStatus {
  if (!boot) return OPEN;
  const currentTier = boot.tier;

  if (item.module && boot.blocked_modules?.includes(item.module)) {
    return {
      gated: true,
      requiredTier: (boot.module_min_tier?.[item.module] as ZivvyTier) ?? "pro",
      reason: "module"
    };
  }

  if (item.doctype) {
    const required = boot.doctype_min_tier?.[item.doctype] as ZivvyTier | undefined;
    if (required && !tierAtLeast(currentTier, required)) {
      return { gated: true, requiredTier: required, reason: "doctype" };
    }
  }

  if (item.minTier && !tierAtLeast(currentTier, item.minTier)) {
    return { gated: true, requiredTier: item.minTier, reason: "tier" };
  }

  return OPEN;
}

export const TIER_LABEL: Record<ZivvyTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business"
};
