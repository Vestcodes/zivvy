import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessagesSquare,
  Sparkles,
  Users,
  ShoppingCart,
  Package,
  Boxes,
  Warehouse,
  Coins,
  Factory,
  Wrench,
  ClipboardList,
  UserCog,
  Settings,
  CreditCard,
  LifeBuoy,
  Contact,
  Receipt,
  ScrollText,
  Truck,
  BadgeDollarSign,
  UserRound,
  CalendarClock,
  CalendarCheck2,
  Wallet,
  Handshake,
  KanbanSquare,
  ShieldCheck,
  Landmark,
  Barcode,
  Store,
  Ticket,
  AlertOctagon,
  ShieldAlert,
  HardHat,
  Building2,
  Hammer,
  Code,
  ListChecks,
  Clock3,
  ClipboardCheck,
  Cog,
  BriefcaseBusiness,
  UsersRound,
  TrendingUp,
  Target,
  GraduationCap,
  Timer,
  Banknote,
  Ship,
  Package2,
  Route as RouteIcon,
  MapPinned,
  BookOpen,
  Hash,
  Headphones,
  BarChart3,
  LineChart,
  ShoppingBag,
  Tags,
  FileText,
  MessageSquare,
  Users2
} from "lucide-react";
import type { ZivvyTier } from "@/lib/boot-types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  module?: string;
  minTier?: ZivvyTier;
  exact?: boolean;
}

export interface ModuleNav {
  key: string;
  title: string;
  subtitle?: string;
  items: NavItem[];
}

export const MODULE_NAVS: Record<string, ModuleNav> = {
  dashboard: {
    key: "dashboard",
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Messages", href: "/messages", icon: MessagesSquare }
    ]
  },

  sales: {
    key: "sales",
    title: "Sales",
    subtitle: "Customers, quotes, orders, invoices",
    items: [
      { label: "Customers", href: "/sales/customers", icon: Contact, module: "Selling" },
      { label: "Quotations", href: "/sales/quotations", icon: ScrollText, module: "Selling" },
      { label: "Sales orders", href: "/sales/orders", icon: ShoppingCart, module: "Selling" },
      { label: "Invoices", href: "/sales/invoices", icon: Receipt, module: "Accounts" },
      { label: "Deliveries", href: "/sales/deliveries", icon: Truck, module: "Stock" }
    ]
  },

  crm: {
    key: "crm",
    title: "CRM",
    subtitle: "Pipeline, deals, campaigns, appointments",
    items: [
      { label: "Leads", href: "/crm/leads", icon: Sparkles, module: "CRM" },
      { label: "Pipeline", href: "/crm/opportunities?view=kanban", icon: KanbanSquare, module: "CRM" },
      { label: "Opportunities", href: "/crm/opportunities", icon: ScrollText, module: "CRM" },
      { label: "Prospects", href: "/crm/prospects", icon: Users, module: "CRM" },
      { label: "Campaigns", href: "/crm/campaigns", icon: Handshake, module: "CRM", minTier: "pro" },
      { label: "Appointments", href: "/crm/appointments", icon: CalendarClock, module: "CRM", minTier: "pro" }
    ]
  },

  pos: {
    key: "pos",
    title: "Point of Sale",
    subtitle: "Retail checkout, profiles, sessions",
    items: [
      { label: "POS invoices", href: "/pos/invoices", icon: Receipt, module: "Accounts", minTier: "pro" },
      { label: "Profiles", href: "/pos/profiles", icon: Store, module: "Accounts", minTier: "pro" },
      { label: "Opening", href: "/pos/opening", icon: ClipboardList, module: "Accounts", minTier: "pro" },
      { label: "Closing", href: "/pos/closing", icon: ClipboardCheck, module: "Accounts", minTier: "pro" }
    ]
  },

  purchases: {
    key: "purchases",
    title: "Procurement",
    subtitle: "Suppliers, POs, bills",
    items: [
      { label: "Suppliers", href: "/purchases/suppliers", icon: Users, module: "Buying" },
      { label: "RFQs", href: "/purchases/rfqs", icon: ScrollText, module: "Buying" },
      { label: "Purchase orders", href: "/purchases/orders", icon: ClipboardList, module: "Buying" },
      { label: "Purchase invoices", href: "/purchases/invoices", icon: Receipt, module: "Accounts" }
    ]
  },

  stock: {
    key: "stock",
    title: "Stock",
    subtitle: "Items, warehouses, movements",
    items: [
      { label: "Items", href: "/stock/items", icon: Package, module: "Stock" },
      { label: "Warehouses", href: "/stock/warehouses", icon: Warehouse, module: "Stock" },
      { label: "Stock entries", href: "/stock/entries", icon: Boxes, module: "Stock" },
      { label: "Reorder", href: "/stock/reorder", icon: ListChecks, module: "Stock" },
      { label: "Barcode scan", href: "/stock/scan", icon: Barcode, minTier: "pro" }
    ]
  },

  shipping: {
    key: "shipping",
    title: "Shipping",
    subtitle: "Shipments, carriers, tracking",
    items: [
      { label: "Shipments", href: "/shipping/shipments", icon: Ship, module: "Stock" },
      { label: "Parcels", href: "/shipping/parcels", icon: Package2, module: "Stock" },
      { label: "Shipping rules", href: "/shipping/rules", icon: RouteIcon, module: "Stock" },
      { label: "Carriers", href: "/shipping/carriers", icon: MapPinned, module: "Stock" }
    ]
  },

  finance: {
    key: "finance",
    title: "Accounting",
    subtitle: "Books, tax, payments, reports",
    items: [
      { label: "Chart of accounts", href: "/finance/accounts", icon: Landmark, module: "Accounts", minTier: "pro" },
      { label: "Payments", href: "/finance/payments", icon: BadgeDollarSign, module: "Accounts", minTier: "pro" },
      { label: "Journal entries", href: "/finance/journal", icon: ScrollText, module: "Accounts", minTier: "pro" },
      { label: "Reports", href: "/finance/reports", icon: ClipboardCheck, module: "Accounts", minTier: "pro" }
    ]
  },

  hr: {
    key: "hr",
    title: "People",
    subtitle: "Employees, leave, shifts, payroll (hrms)",
    items: [
      { label: "Employees", href: "/hr/employees", icon: UserRound, minTier: "pro" },
      { label: "Time off", href: "/hr/time-off", icon: CalendarClock, minTier: "pro" },
      { label: "Attendance", href: "/hr/attendance", icon: CalendarCheck2, minTier: "pro" },
      { label: "Shifts", href: "/hr/shifts", icon: Timer, minTier: "pro" },
      { label: "Payroll", href: "/hr/payroll", icon: Coins, minTier: "pro" },
      { label: "Expenses", href: "/hr/expenses", icon: Wallet, minTier: "pro" },
      { label: "Loans", href: "/hr/loans", icon: Banknote, minTier: "pro" },
      { label: "Onboarding", href: "/hr/onboarding", icon: Handshake, minTier: "pro" }
    ]
  },

  talent: {
    key: "talent",
    title: "Talent",
    subtitle: "Recruitment, performance, learning (hrms)",
    items: [
      { label: "Job openings", href: "/talent/openings", icon: BriefcaseBusiness, minTier: "pro" },
      { label: "Applicants", href: "/talent/applicants", icon: UsersRound, minTier: "pro" },
      { label: "Interviews", href: "/talent/interviews", icon: MessagesSquare, minTier: "pro" },
      { label: "Appraisals", href: "/talent/appraisals", icon: TrendingUp, minTier: "pro" },
      { label: "Goals", href: "/talent/goals", icon: Target, minTier: "pro" },
      { label: "Training", href: "/talent/training", icon: GraduationCap, minTier: "pro" }
    ]
  },

  projects: {
    key: "projects",
    title: "Projects",
    subtitle: "Tasks, timesheets, budgets",
    items: [
      { label: "All projects", href: "/projects", icon: KanbanSquare, module: "Projects", minTier: "pro" },
      { label: "Tasks", href: "/projects/tasks", icon: ListChecks, module: "Projects", minTier: "pro" },
      { label: "Timesheets", href: "/projects/timesheets", icon: Clock3, module: "Projects", minTier: "pro" }
    ]
  },

  manufacturing: {
    key: "manufacturing",
    title: "Manufacturing",
    subtitle: "BOMs, work orders, shop floor",
    items: [
      { label: "BOMs", href: "/manufacturing/bom", icon: Wrench, module: "Manufacturing", minTier: "business" },
      { label: "Work orders", href: "/manufacturing/work-orders", icon: Factory, module: "Manufacturing", minTier: "business" },
      { label: "Job cards", href: "/manufacturing/job-cards", icon: Hammer, module: "Manufacturing", minTier: "business" },
      { label: "Subcontracting", href: "/manufacturing/subcontracting", icon: Cog, module: "Subcontracting", minTier: "business" }
    ]
  },

  quality: {
    key: "quality",
    title: "Quality",
    subtitle: "Inspections & compliance",
    items: [
      { label: "Inspections", href: "/quality", icon: ShieldCheck, module: "Quality Management", minTier: "business" }
    ]
  },

  assets: {
    key: "assets",
    title: "Assets",
    subtitle: "Fixed assets, maintenance, depreciation",
    items: [
      { label: "Assets", href: "/assets", icon: Building2, module: "Assets" },
      { label: "Maintenance", href: "/assets/maintenance", icon: Wrench, module: "Assets" },
      { label: "Movements", href: "/assets/movements", icon: Truck, module: "Assets" },
      { label: "Depreciation", href: "/assets/depreciation", icon: ClipboardCheck, module: "Assets" }
    ]
  },

  support: {
    key: "support",
    title: "Support",
    subtitle: "Tickets, SLA, warranty",
    items: [
      { label: "Tickets", href: "/support/tickets", icon: Ticket, module: "Support" },
      { label: "Issues", href: "/support/issues", icon: AlertOctagon, module: "Support" },
      { label: "Warranty", href: "/support/warranty", icon: ShieldAlert, module: "Support" },
      { label: "SLAs", href: "/support/slas", icon: HardHat, module: "Support" }
    ]
  },

  helpdesk: {
    key: "helpdesk",
    title: "Helpdesk",
    subtitle: "Customer tickets, knowledge base, teams",
    items: [
      { label: "Tickets", href: "/helpdesk/tickets", icon: Ticket, module: "Helpdesk", minTier: "pro" },
      { label: "Knowledge base", href: "/helpdesk/kb", icon: BookOpen, module: "Helpdesk", minTier: "pro" },
      { label: "Teams", href: "/helpdesk/teams", icon: Users2, module: "Helpdesk", minTier: "pro" },
      { label: "Contracts", href: "/helpdesk/contracts", icon: FileText, module: "Helpdesk", minTier: "pro" }
    ]
  },

  raven: {
    key: "raven",
    title: "Chat",
    subtitle: "Channels, DMs, threads",
    items: [
      { label: "Channels", href: "/raven/channels", icon: Hash, module: "Raven", minTier: "pro" },
      { label: "Direct messages", href: "/raven/dms", icon: MessageSquare, module: "Raven", minTier: "pro" },
      { label: "Threads", href: "/raven/threads", icon: MessagesSquare, module: "Raven", minTier: "pro" }
    ]
  },

  insights: {
    key: "insights",
    title: "Insights",
    subtitle: "Dashboards, queries, charts",
    items: [
      { label: "Dashboards", href: "/insights/dashboards", icon: BarChart3, module: "Insights", minTier: "business" },
      { label: "Charts", href: "/insights/charts", icon: LineChart, module: "Insights", minTier: "business" },
      { label: "Queries", href: "/insights/queries", icon: ScrollText, module: "Insights", minTier: "business" }
    ]
  },

  wiki: {
    key: "wiki",
    title: "Wiki",
    subtitle: "Team knowledge, docs, playbooks",
    items: [
      { label: "Pages", href: "/wiki/pages", icon: BookOpen, module: "Wiki" },
      { label: "Spaces", href: "/wiki/spaces", icon: FileText, module: "Wiki" }
    ]
  },

  webshop: {
    key: "webshop",
    title: "Webshop",
    subtitle: "Storefront, catalog, promotions",
    items: [
      { label: "Products", href: "/webshop/products", icon: ShoppingBag, module: "Webshop", minTier: "business" },
      { label: "Categories", href: "/webshop/categories", icon: Tags, module: "Webshop", minTier: "business" },
      { label: "Orders", href: "/webshop/orders", icon: ShoppingCart, module: "Webshop", minTier: "business" }
    ]
  },

  settings: {
    key: "settings",
    title: "Setup",
    subtitle: "Team, billing, preferences",
    items: [
      { label: "Team", href: "/settings/team", icon: UserCog },
      { label: "Developer", href: "/settings/developer", icon: Code },
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help", href: "/help", icon: LifeBuoy }
    ]
  }
};

const ALIAS: Record<string, string> = {
  billing: "settings",
  help: "settings",
  messages: "dashboard"
};

export function navForPath(pathname: string): ModuleNav | null {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return null;
  const resolved = ALIAS[segment] ?? segment;
  return MODULE_NAVS[resolved] ?? null;
}
