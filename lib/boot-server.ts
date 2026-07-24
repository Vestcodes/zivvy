import { cache } from "react";
import { cookies } from "next/headers";
import {
  GUEST_BOOT,
  type Bootinfo,
  type ZivvyBoot,
  type ZivvyTier,
  type ZivvyTenantSummary
} from "@/lib/boot-types";
import {
  DOCTYPE_MIN_TIER as FALLBACK_DOCTYPE_MIN_TIER,
  MODULE_MIN_TIER as FALLBACK_MODULE_MIN_TIER
} from "@/lib/plan-features";
import { MOCK_BOOT } from "@/lib/mock-boot";
import { tierAtLeast } from "@/lib/boot-types";
import { FRAPPE_ORIGIN } from "@/lib/frappe-origin";

const DEV_MOCK =
  process.env.NEXT_PUBLIC_ZIVVY_DEV_MOCK === "1" ||
  process.env.ZIVVY_DEV_MOCK === "1";

async function frappeServerCall<T = unknown>(
  method: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T | null> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return null;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null) continue;
    body.set(k, String(v));
  }

  try {
    const res = await fetch(`${FRAPPE_ORIGIN}/api/method/${method}`, {
      method: "POST",
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: cookieHeader
      },
      body: body.toString()
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: T };
    return json.message ?? null;
  } catch {
    return null;
  }
}

interface BootData {
  user: {
    email: string;
    full_name: string;
    tenant: string | null;
  };
  plan: {
    tier: ZivvyTier;
    tier_label: string;
    demo_plan: ZivvyTier | null;
    site_tier: ZivvyTier;
    status: string;
    seats_used: number;
    seats_allowed: number;
    current_period_end: string | null;
    cancel_at_period_end: boolean | 0 | 1 | null;
    pricing: Record<string, unknown>;
  };
  tenant: ZivvyTenantSummary | null;
  tier_map: {
    module_min_tier: Record<string, ZivvyTier>;
    doctype_min_tier: Record<string, ZivvyTier>;
  };
  blocked_modules: string[];
  blocked_doctypes: string[];
}

/**
 * React `cache()` dedupes the boot fetch across every server component in a
 * single request. The consolidated endpoint returns user + plan + tenant +
 * tier map in a single RPC — down from 4+ sequential roundtrips.
 */
export const fetchBootinfo = cache(_fetchBootinfo);

async function _fetchBootinfo(): Promise<Bootinfo> {
  if (DEV_MOCK) return MOCK_BOOT;

  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return GUEST_BOOT;

  const data = await frappeServerCall<BootData>(
    "zivvy_brand.gating.api.get_boot_data"
  );
  if (!data?.user) return GUEST_BOOT;

  const { user, plan, tenant: tenantInfo, tier_map: tierMap, blocked_modules, blocked_doctypes } = data;

  const tier: ZivvyTier = plan.tier ?? "free";
  const moduleTierMap = tierMap?.module_min_tier ?? FALLBACK_MODULE_MIN_TIER;
  const doctypeTierMap = tierMap?.doctype_min_tier ?? FALLBACK_DOCTYPE_MIN_TIER;

  const tenant: ZivvyTenantSummary | null = tenantInfo
    ? {
        ...tenantInfo,
        name: tenantInfo.name ?? user.tenant ?? undefined
      }
    : null;

  const zivvy: ZivvyBoot = {
    tier,
    tier_label: plan.tier_label ?? tier.charAt(0).toUpperCase() + tier.slice(1),
    demo_plan: plan.demo_plan ?? null,
    site_tier: plan.site_tier ?? tier,
    priority_support: tier === "pro" || tier === "business",
    seats_used: plan.seats_used ?? tenant?.seats_used ?? 0,
    seats_allowed: plan.seats_allowed ?? tenant?.seat_limit ?? 0,
    subscription_status: plan.status ?? tenant?.subscription_status ?? "none",
    blocked_modules: blocked_modules ?? Object.entries(moduleTierMap)
      .filter(([, required]) => !tierAtLeast(tier, required))
      .map(([module]) => module),
    blocked_doctypes: blocked_doctypes ?? Object.entries(doctypeTierMap)
      .filter(([, required]) => !tierAtLeast(tier, required))
      .map(([doctype]) => doctype),
    module_min_tier: moduleTierMap,
    doctype_min_tier: doctypeTierMap,
    pricing: plan.pricing ?? {},
    billing_route: "/billing",
    pricing_route: "/pricing",
    tenant,
    tenancy_mode: "company_per_tenant",
    home_route: "/dashboard",
    workspace_routes: {
      home: "/dashboard",
      sales: "/sales/invoices",
      finance: "/finance/accounts",
      billing: "/billing",
      team: "/settings/team",
      settings: "/settings",
      help: "/help"
    }
  };

  return {
    logged_in: true,
    user: {
      name: user.email,
      full_name: user.full_name ?? user.email,
      roles: []
    },
    sysdefaults: tenant?.company ? { company: tenant.company } : undefined,
    app_name: "Zivvy",
    website_title: "Zivvy",
    zivvy
  };
}
