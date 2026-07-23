/**
 * Types for `bootinfo.zivvy` — the canonical read model injected by
 * zivvy_brand.gating.boot.extend_bootinfo on the backend.
 *
 * Server is authoritative. Frontend uses these values for UX only (hide/disable/CTA).
 * Real gating is enforced by Frappe hooks + guard_api_access.
 */

export type ZivvyTier = "free" | "pro" | "business";

export interface ZivvyTenantSummary {
  name: string;
  tenant_name?: string;
  slug: string;
  status?: string;
  plan?: ZivvyTier;
  seat_limit?: number;
  seats_used?: number;
  company?: string;
  owner_user?: string;
  datacenter?: "india" | "eu" | "us";
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  subscription_status?: string;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
}

export interface ZivvyBoot {
  tier: ZivvyTier;
  tier_label: string;
  demo_plan?: ZivvyTier | null;
  site_tier?: ZivvyTier;
  priority_support: boolean;
  seats_used: number;
  seats_allowed: number;
  subscription_status: string;
  blocked_modules: string[];
  blocked_doctypes: string[];
  module_min_tier: Record<string, ZivvyTier>;
  doctype_min_tier: Record<string, ZivvyTier>;
  pricing: Record<string, unknown>;
  billing_route: string;
  pricing_route: string;
  tenant: ZivvyTenantSummary | null;
  tenancy_mode: "company_per_tenant" | string;
  home_route: string;
  workspace_routes: Record<string, string>;
}

export interface Bootinfo {
  user?: { name?: string; full_name?: string; roles?: string[] };
  sysdefaults?: Record<string, unknown>;
  app_name?: string;
  app_logo_url?: string;
  splash_image?: string;
  website_title?: string;
  zivvy: ZivvyBoot | null;
  logged_in: boolean;
}

export const GUEST_BOOT: Bootinfo = {
  logged_in: false,
  zivvy: null
};

const TIER_ORDER: Record<ZivvyTier, number> = { free: 0, pro: 1, business: 2 };

export function tierAtLeast(current: ZivvyTier, required: ZivvyTier): boolean {
  return TIER_ORDER[current] >= TIER_ORDER[required];
}
