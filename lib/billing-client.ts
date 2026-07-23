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

export function createCheckout(plan: Exclude<ZivvyTier, "free">, seats?: number) {
  return frappeCall<{ checkout_id: string; url: string; seats: number; plan: ZivvyTier }>(
    "zivvy_brand.billing.api.create_checkout",
    { plan, seats }
  );
}

export function createPortalSession() {
  return frappeCall<{ ok: boolean; url?: string; requires_checkout?: boolean }>(
    "zivvy_brand.billing.api.create_portal_session"
  );
}
