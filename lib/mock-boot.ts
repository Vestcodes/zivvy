import type { Bootinfo, ZivvyBoot } from "@/lib/boot-types";

const MOCK_ZIVVY: ZivvyBoot = {
  tier: "pro",
  tier_label: "Pro",
  demo_plan: null,
  site_tier: "pro",
  priority_support: false,
  seats_used: 3,
  seats_allowed: 10,
  subscription_status: "active",
  blocked_modules: ["Manufacturing", "Assets", "Quality", "Subcontracting"],
  blocked_doctypes: ["Work Order", "BOM", "Asset", "Job Card"],
  module_min_tier: {
    Accounts: "pro",
    Stock: "pro",
    HR: "pro",
    Projects: "pro",
    Manufacturing: "business",
    Assets: "business",
    Quality: "business",
    Subcontracting: "business"
  },
  doctype_min_tier: {},
  pricing: {},
  billing_route: "/billing",
  pricing_route: "/pricing",
  tenant: {
    name: "acme-co",
    tenant_name: "Acme Co",
    slug: "acme-co",
    status: "active",
    plan: "pro",
    seat_limit: 10,
    seats_used: 3,
    company: "Acme Co",
    owner_user: "you@acme.co",
    datacenter: "us",
    subscription_status: "active",
    polar_customer_id: "cust_mock",
    polar_subscription_id: "sub_mock",
    current_period_end: new Date(Date.now() + 26 * 24 * 3600 * 1000).toISOString(),
    cancel_at_period_end: false
  },
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

export const MOCK_BOOT: Bootinfo = {
  logged_in: true,
  user: {
    name: "you@acme.co",
    full_name: "Alex Rivera",
    roles: ["System User", "Sales User", "Purchase User", "Item Manager"]
  },
  sysdefaults: { company: "Acme Co" },
  app_name: "Zivvy",
  app_logo_url: "/zivvy-logo.svg",
  website_title: "Zivvy",
  zivvy: MOCK_ZIVVY
};
