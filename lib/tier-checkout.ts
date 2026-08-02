/**
 * Client-side helpers for the self-serve Pro / Business tier checkout flow.
 *
 * The Frappe backend exposes `zivvy_brand.billing.tier_checkout.subscribe_tier`,
 * which returns either a Polar checkout URL or a fallback billing route.
 *
 * The flow is split across three surfaces:
 *
 * 1. Pricing preview links to `/login?plan=<slug>&billing=<cadence>#signup`.
 * 2. `AuthPanel` reads those params and hands them to the sign-in / sign-up
 *    forms.
 * 3. When the user is authenticated (immediately after sign-in, or after
 *    verifying their email post-sign-up and landing on `/dashboard`),
 *    `startTierCheckout` is invoked, which redirects the browser to the
 *    Polar checkout URL (or the Desk billing fallback).
 */
import { frappeCall, FrappeError } from "@/lib/frappe-client";

export type TierSlug = "pro" | "business";
export type BillingCadence = "monthly" | "annual";

export const PENDING_TIER_STORAGE_KEY = "zivvy.pendingTierCheckout";

export function isTierSlug(value: unknown): value is TierSlug {
  return value === "pro" || value === "business";
}

export function normalizeBilling(value: unknown): BillingCadence {
  return value === "annual" ? "annual" : "monthly";
}

export interface PendingTierCheckout {
  tier: TierSlug;
  billing: BillingCadence;
}

export function stashPendingTier(pending: PendingTierCheckout) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PENDING_TIER_STORAGE_KEY,
      JSON.stringify(pending)
    );
  } catch {
    // Storage may be unavailable (private mode / disabled) — silently skip.
  }
}

export function readPendingTier(): PendingTierCheckout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_TIER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingTierCheckout>;
    if (!isTierSlug(parsed.tier)) return null;
    return {
      tier: parsed.tier,
      billing: normalizeBilling(parsed.billing),
    };
  } catch {
    return null;
  }
}

export function clearPendingTier() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_TIER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface CheckoutResponse {
  checkout_url?: string;
  polar_configured?: boolean;
}

/**
 * Kick off the tier subscription. Redirects the browser to the Polar checkout
 * URL when it's a full URL (`http…`); otherwise navigates in-app.
 *
 * Returns `false` when the call failed or nothing to redirect to, so callers
 * can fall back to their default post-auth destination.
 */
export async function startTierCheckout(
  tier: TierSlug,
  billing: BillingCadence,
  navigate: (path: string) => void
): Promise<boolean> {
  try {
    const result = await frappeCall<CheckoutResponse>(
      "zivvy_brand.billing.tier_checkout.subscribe_tier",
      { tier, billing }
    );
    const url = (result?.checkout_url ?? "").trim();
    if (!url) return false;
    if (/^https?:\/\//i.test(url)) {
      window.location.href = appendCheckoutLocale(url);
      return true;
    }
    navigate(url);
    return true;
  } catch (err) {
    if (err instanceof FrappeError) {
      // Surface an auth issue up to the caller; other errors are best-effort.
      throw err;
    }
    return false;
  }
}

const POLAR_CHECKOUT_LOCALES = new Set([
  "en", "nl", "es", "fr", "sv", "de", "hu", "it", "pt", "pt-PT",
  "ko", "ja", "tr", "pl",
]);

export function appendCheckoutLocale(url: string): string {
  if (typeof navigator === "undefined") return url;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("locale")) return url;
    const browserLang = navigator.language;
    if (POLAR_CHECKOUT_LOCALES.has(browserLang)) {
      parsed.searchParams.set("locale", browserLang);
      return parsed.toString();
    }
    const short = browserLang.split("-")[0];
    if (POLAR_CHECKOUT_LOCALES.has(short)) {
      parsed.searchParams.set("locale", short);
      return parsed.toString();
    }
  } catch {
    // Malformed URL — return as-is.
  }
  return url;
}
