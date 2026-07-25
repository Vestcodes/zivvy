import { frappeCall } from "@/lib/frappe-client";
import type { ZivvyTier } from "@/lib/boot-types";

export interface MyPlan {
  tier: ZivvyTier;
  tier_label: string;
  subscription_status: string;
  seats_used: number;
  seats_allowed: number;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
}

export function getMyPlan() {
  return frappeCall<MyPlan>("zivvy_brand.billing.api.get_my_plan");
}

export function createCheckout(
  plan: Exclude<ZivvyTier, "free">,
  seats?: number,
  billing: "monthly" | "annual" = "monthly"
) {
  return frappeCall<{
    checkout_id: string;
    url: string;
    seats: number;
    plan: ZivvyTier;
    billing: "monthly" | "annual";
  }>("zivvy_brand.billing.api.create_checkout", { plan, seats, billing });
}

export function createPortalSession() {
  return frappeCall<{ ok: boolean; url?: string; requires_checkout?: boolean }>(
    "zivvy_brand.billing.api.create_portal_session"
  );
}

export type SeatUpdateMode = "direct" | "checkout" | "portal" | "placeholder";

export interface SeatUpdateResult {
  mode: SeatUpdateMode;
  seats?: number;
  updated?: boolean;
  checkout_url?: string;
  portal_url?: string;
  polar_configured?: boolean;
}

export function updateSeatQuantity(newQuantity: number) {
  return frappeCall<SeatUpdateResult>(
    "zivvy_brand.billing.tier_checkout.update_seat_quantity",
    { new_quantity: newQuantity }
  );
}
