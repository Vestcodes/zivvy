import { cookies } from "next/headers";
import {
  GUEST_BOOT,
  type Bootinfo,
  type ZivvyBoot,
  type ZivvyTier,
  type ZivvyTenantSummary
} from "@/lib/boot-types";
import { MOCK_BOOT } from "@/lib/mock-boot";

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

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
      cache: "no-store",
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

interface RawPlan {
  tier?: ZivvyTier;
  tier_label?: string;
  demo_plan?: ZivvyTier | null;
  site_tier?: ZivvyTier;
  status?: string;                // Zivvy subscription status
  subscription_status?: string;   // alt field name
  seats_used?: number;
  seats_allowed?: number;
  current_period_end?: string | null;
  cancel_at_period_end?: 0 | 1 | boolean;
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  pricing?: Record<string, unknown>;
}

interface RawUserValues {
  full_name?: string | null;
  zivvy_tenant?: string | null;
}

interface RawTenantValues {
  tenant_name?: string | null;
  slug?: string | null;
  company?: string | null;
  status?: string | null;
  plan?: ZivvyTier | null;
  seat_limit?: number | null;
  seats_used?: number | null;
  datacenter?: "india" | "eu" | "us" | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: 0 | 1 | boolean | null;
  polar_customer_id?: string | null;
  polar_subscription_id?: string | null;
  owner_user?: string | null;
}

/**
 * Best-effort authenticated bootinfo. Uses only whitelisted Frappe endpoints:
 *  - frappe.auth.get_logged_user   (auth check)
 *  - zivvy_brand.billing.api.get_my_plan  (tier + seats)
 *  - frappe.client.get_value(User)        (full_name + zivvy_tenant)
 *  - frappe.client.get_value(Zivvy Tenant) (company + datacenter + …)
 *
 * `frappe.boot.get_bootinfo` is NOT whitelisted for RPC (403), so we compose
 * our Bootinfo shape from these smaller reads instead.
 */
export async function fetchBootinfo(): Promise<Bootinfo> {
  if (DEV_MOCK) return MOCK_BOOT;

  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid) return GUEST_BOOT;

  const email = await frappeServerCall<string>("frappe.auth.get_logged_user");
  if (!email || email === "Guest") return GUEST_BOOT;

  const [plan, userVals] = await Promise.all([
    frappeServerCall<RawPlan>("zivvy_brand.billing.api.get_my_plan"),
    frappeServerCall<RawUserValues>("frappe.client.get_value", {
      doctype: "User",
      filters: JSON.stringify({ name: email }),
      fieldname: JSON.stringify(["full_name", "zivvy_tenant"])
    })
  ]);

  let tenant: ZivvyTenantSummary | null = null;
  if (userVals?.zivvy_tenant) {
    const tenantVals = await frappeServerCall<RawTenantValues>(
      "frappe.client.get_value",
      {
        doctype: "Zivvy Tenant",
        filters: JSON.stringify({ name: userVals.zivvy_tenant }),
        fieldname: JSON.stringify([
          "tenant_name",
          "slug",
          "company",
          "status",
          "plan",
          "seat_limit",
          "seats_used",
          "datacenter",
          "subscription_status",
          "current_period_end",
          "cancel_at_period_end",
          "polar_customer_id",
          "polar_subscription_id",
          "owner_user"
        ])
      }
    );
    if (tenantVals) {
      tenant = {
        name: userVals.zivvy_tenant,
        tenant_name: tenantVals.tenant_name ?? undefined,
        slug: tenantVals.slug ?? userVals.zivvy_tenant,
        company: tenantVals.company ?? undefined,
        status: tenantVals.status ?? undefined,
        plan: (tenantVals.plan as ZivvyTier | undefined) ?? undefined,
        seat_limit: tenantVals.seat_limit ?? undefined,
        seats_used: tenantVals.seats_used ?? undefined,
        datacenter: (tenantVals.datacenter as "india" | "eu" | "us" | undefined) ?? undefined,
        subscription_status: tenantVals.subscription_status ?? undefined,
        current_period_end: tenantVals.current_period_end ?? undefined,
        cancel_at_period_end: Boolean(tenantVals.cancel_at_period_end),
        polar_customer_id: tenantVals.polar_customer_id ?? undefined,
        polar_subscription_id: tenantVals.polar_subscription_id ?? undefined,
        owner_user: tenantVals.owner_user ?? undefined
      };
    }
  }

  const tier: ZivvyTier = plan?.tier ?? "free";
  const zivvy: ZivvyBoot = {
    tier,
    tier_label: plan?.tier_label ?? tier.charAt(0).toUpperCase() + tier.slice(1),
    demo_plan: plan?.demo_plan ?? null,
    site_tier: plan?.site_tier ?? tier,
    priority_support: false,
    seats_used: plan?.seats_used ?? tenant?.seats_used ?? 0,
    seats_allowed: plan?.seats_allowed ?? tenant?.seat_limit ?? 0,
    subscription_status:
      plan?.subscription_status ?? plan?.status ?? tenant?.subscription_status ?? "none",
    blocked_modules: [],
    blocked_doctypes: [],
    module_min_tier: {},
    doctype_min_tier: {},
    pricing: plan?.pricing ?? {},
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
      name: email,
      full_name: userVals?.full_name ?? email,
      roles: []
    },
    sysdefaults: tenant?.company ? { company: tenant.company } : undefined,
    app_name: "Zivvy",
    website_title: "Zivvy",
    zivvy
  };
}
