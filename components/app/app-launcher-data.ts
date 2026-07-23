import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Contact,
  ScrollText,
  ShoppingCart,
  Receipt,
  Truck,
  Users,
  ClipboardList,
  Package,
  Boxes,
  Warehouse,
  Coins,
  BadgeDollarSign,
  Wrench,
  Factory,
  Handshake,
  Sparkles,
  KanbanSquare,
  UserRound,
  CalendarClock,
  CalendarCheck2,
  Wallet,
  Landmark,
  ShieldCheck,
  Barcode,
  Settings,
  CreditCard,
  LifeBuoy,
  MessagesSquare,
  UserCog,
  Store,
  Ticket,
  AlertOctagon,
  ShieldAlert,
  HardHat,
  Building2,
  Hammer,
  Wrench as WrenchIcon,
  ListChecks,
  Clock3,
  ClipboardCheck,
  Cog,
  BriefcaseBusiness,
  UsersRound,
  MessagesSquare as InterviewIcon,
  TrendingUp,
  Target,
  GraduationCap,
  Timer,
  Banknote,
  Ship,
  Package2,
  Route as RouteIcon,
  MapPinned
} from "lucide-react";
import type { ZivvyTier } from "@/lib/boot-types";

export interface AppTile {
  label: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  category: AppCategoryKey;
  module?: string;
  minTier?: ZivvyTier;
}

export type AppCategoryKey =
  | "workspace"
  | "sales"
  | "procurement"
  | "stock"
  | "shipping"
  | "accounting"
  | "people"
  | "talent"
  | "manufacturing"
  | "assets"
  | "projects"
  | "support"
  | "setup";

export interface AppCategory {
  key: AppCategoryKey;
  label: string;
}

export const CATEGORIES: AppCategory[] = [
  { key: "workspace",     label: "Workspace" },
  { key: "sales",         label: "Sales & CRM" },
  { key: "procurement",   label: "Procurement" },
  { key: "stock",         label: "Stock" },
  { key: "shipping",      label: "Shipping" },
  { key: "accounting",    label: "Accounting" },
  { key: "people",        label: "People (HR)" },
  { key: "talent",        label: "Talent" },
  { key: "manufacturing", label: "Manufacturing" },
  { key: "assets",        label: "Assets" },
  { key: "projects",      label: "Projects" },
  { key: "support",       label: "Support" },
  { key: "setup",         label: "Setup" }
];

export const APPS: AppTile[] = [
  // WORKSPACE
  { label: "Dashboard",         href: "/dashboard",              icon: LayoutDashboard,  gradient: "from-[#ff00c8] to-[#9000ff]", category: "workspace" },
  { label: "Messages",          href: "/messages",               icon: MessagesSquare,   gradient: "from-[#ec4899] to-[#8b5cf6]", category: "workspace" },

  // SALES & CRM
  { label: "CRM",               href: "/crm/leads",              icon: Sparkles,         gradient: "from-[#a855f7] to-[#7c3aed]", category: "sales", module: "CRM" },
  { label: "Customers",         href: "/sales/customers",        icon: Contact,          gradient: "from-[#ec4899] to-[#db2777]", category: "sales", module: "Selling" },
  { label: "Quotations",        href: "/sales/quotations",       icon: ScrollText,       gradient: "from-[#f472b6] to-[#c026d3]", category: "sales", module: "Selling" },
  { label: "Sales orders",      href: "/sales/orders",           icon: ShoppingCart,     gradient: "from-[#f43f5e] to-[#e11d48]", category: "sales", module: "Selling" },
  { label: "Invoices",          href: "/sales/invoices",         icon: Receipt,          gradient: "from-[#ff00c8] to-[#c026d3]", category: "sales", module: "Accounts" },
  { label: "Deliveries",        href: "/sales/deliveries",       icon: Truck,            gradient: "from-[#fb7185] to-[#be123c]", category: "sales", module: "Stock" },
  { label: "Point of Sale",     href: "/pos/invoices",           icon: Store,            gradient: "from-[#ec4899] to-[#831843]", category: "sales", module: "Accounts", minTier: "pro" },

  // PROCUREMENT
  { label: "Suppliers",         href: "/purchases/suppliers",    icon: Users,            gradient: "from-[#f59e0b] to-[#d97706]", category: "procurement", module: "Buying" },
  { label: "Purchase orders",   href: "/purchases/orders",       icon: ClipboardList,    gradient: "from-[#f97316] to-[#c2410c]", category: "procurement", module: "Buying" },
  { label: "Purchase invoices", href: "/purchases/invoices",     icon: Receipt,          gradient: "from-[#ea580c] to-[#9a3412]", category: "procurement", module: "Accounts" },
  { label: "RFQs",              href: "/purchases/rfqs",         icon: ScrollText,       gradient: "from-[#fb923c] to-[#c2410c]", category: "procurement", module: "Buying" },

  // STOCK
  { label: "Items",             href: "/stock/items",            icon: Package,          gradient: "from-[#eab308] to-[#ca8a04]", category: "stock", module: "Stock" },
  { label: "Warehouses",        href: "/stock/warehouses",       icon: Warehouse,        gradient: "from-[#facc15] to-[#a16207]", category: "stock", module: "Stock" },
  { label: "Stock entries",     href: "/stock/entries",          icon: Boxes,            gradient: "from-[#fde047] to-[#ca8a04]", category: "stock", module: "Stock" },
  { label: "Reorder",           href: "/stock/reorder",          icon: ListChecks,       gradient: "from-[#84cc16] to-[#4d7c0f]", category: "stock", module: "Stock" },
  { label: "Barcode",           href: "/stock/scan",             icon: Barcode,          gradient: "from-[#14b8a6] to-[#0d9488]", category: "stock", minTier: "pro" },

  // SHIPPING (erpnext-shipping app)
  { label: "Shipments",         href: "/shipping/shipments",     icon: Ship,             gradient: "from-[#0ea5e9] to-[#0369a1]", category: "shipping", module: "Stock" },
  { label: "Parcels",           href: "/shipping/parcels",       icon: Package2,         gradient: "from-[#38bdf8] to-[#075985]", category: "shipping", module: "Stock" },
  { label: "Shipping rules",    href: "/shipping/rules",         icon: RouteIcon,        gradient: "from-[#0284c7] to-[#0c4a6e]", category: "shipping", module: "Stock" },
  { label: "Carriers",          href: "/shipping/carriers",      icon: MapPinned,        gradient: "from-[#0891b2] to-[#164e63]", category: "shipping", module: "Stock" },

  // ACCOUNTING
  { label: "Accounting",        href: "/finance/accounts",       icon: Landmark,         gradient: "from-[#10b981] to-[#047857]", category: "accounting", module: "Accounts", minTier: "pro" },
  { label: "Payments",          href: "/finance/payments",       icon: BadgeDollarSign,  gradient: "from-[#22c55e] to-[#15803d]", category: "accounting", module: "Accounts", minTier: "pro" },
  { label: "Journal entries",   href: "/finance/journal",        icon: ScrollText,       gradient: "from-[#059669] to-[#065f46]", category: "accounting", module: "Accounts", minTier: "pro" },
  { label: "Reports",           href: "/finance/reports",        icon: ClipboardCheck,   gradient: "from-[#0d9488] to-[#115e59]", category: "accounting", module: "Accounts", minTier: "pro" },

  // PEOPLE (HR — hrms app)
  { label: "Employees",         href: "/hr/employees",           icon: UserRound,        gradient: "from-[#3b82f6] to-[#2563eb]", category: "people", minTier: "pro" },
  { label: "Time off",          href: "/hr/time-off",            icon: CalendarClock,    gradient: "from-[#6366f1] to-[#4f46e5]", category: "people", minTier: "pro" },
  { label: "Attendance",        href: "/hr/attendance",          icon: CalendarCheck2,   gradient: "from-[#8b5cf6] to-[#7c3aed]", category: "people", minTier: "pro" },
  { label: "Shifts",            href: "/hr/shifts",              icon: Timer,            gradient: "from-[#7c3aed] to-[#5b21b6]", category: "people", minTier: "pro" },
  { label: "Payroll",           href: "/hr/payroll",             icon: Coins,            gradient: "from-[#a855f7] to-[#9333ea]", category: "people", minTier: "pro" },
  { label: "Expenses",          href: "/hr/expenses",            icon: Wallet,           gradient: "from-[#d946ef] to-[#a21caf]", category: "people", minTier: "pro" },
  { label: "Loans",             href: "/hr/loans",               icon: Banknote,         gradient: "from-[#c026d3] to-[#701a75]", category: "people", minTier: "pro" },
  { label: "Onboarding",        href: "/hr/onboarding",          icon: Handshake,        gradient: "from-[#f43f5e] to-[#be123c]", category: "people", minTier: "pro" },

  // TALENT (recruitment, performance, learning — hrms app)
  { label: "Job openings",      href: "/talent/openings",        icon: BriefcaseBusiness, gradient: "from-[#3b82f6] to-[#1e3a8a]", category: "talent", minTier: "pro" },
  { label: "Applicants",        href: "/talent/applicants",      icon: UsersRound,       gradient: "from-[#2563eb] to-[#1e40af]", category: "talent", minTier: "pro" },
  { label: "Interviews",        href: "/talent/interviews",      icon: InterviewIcon,    gradient: "from-[#6366f1] to-[#312e81]", category: "talent", minTier: "pro" },
  { label: "Appraisals",        href: "/talent/appraisals",      icon: TrendingUp,       gradient: "from-[#8b5cf6] to-[#4c1d95]", category: "talent", minTier: "pro" },
  { label: "Goals",             href: "/talent/goals",           icon: Target,           gradient: "from-[#a855f7] to-[#6b21a8]", category: "talent", minTier: "pro" },
  { label: "Training",          href: "/talent/training",        icon: GraduationCap,    gradient: "from-[#7c3aed] to-[#4c1d95]", category: "talent", minTier: "pro" },

  // MANUFACTURING
  { label: "BOMs",              href: "/manufacturing/bom",              icon: WrenchIcon,   gradient: "from-[#ef4444] to-[#b91c1c]", category: "manufacturing", module: "Manufacturing", minTier: "business" },
  { label: "Work orders",       href: "/manufacturing/work-orders",      icon: Factory,      gradient: "from-[#dc2626] to-[#991b1b]", category: "manufacturing", module: "Manufacturing", minTier: "business" },
  { label: "Job cards",         href: "/manufacturing/job-cards",        icon: Hammer,       gradient: "from-[#f87171] to-[#991b1b]", category: "manufacturing", module: "Manufacturing", minTier: "business" },
  { label: "Subcontracting",    href: "/manufacturing/subcontracting",   icon: Cog,          gradient: "from-[#c026d3] to-[#701a75]", category: "manufacturing", module: "Subcontracting", minTier: "business" },
  { label: "Quality",           href: "/quality",                        icon: ShieldCheck,  gradient: "from-[#fb7185] to-[#9f1239]", category: "manufacturing", module: "Quality Management", minTier: "business" },

  // ASSETS
  { label: "Assets",            href: "/assets",                 icon: Building2,        gradient: "from-[#a16207] to-[#78350f]", category: "assets", module: "Assets" },
  { label: "Maintenance",       href: "/assets/maintenance",     icon: Wrench,           gradient: "from-[#d97706] to-[#92400e]", category: "assets", module: "Assets" },
  { label: "Movements",         href: "/assets/movements",       icon: Truck,            gradient: "from-[#ca8a04] to-[#78350f]", category: "assets", module: "Assets" },

  // PROJECTS
  { label: "Projects",          href: "/projects",               icon: KanbanSquare,     gradient: "from-[#06b6d4] to-[#0e7490]", category: "projects", module: "Projects", minTier: "pro" },
  { label: "Tasks",             href: "/projects/tasks",         icon: ListChecks,       gradient: "from-[#0ea5e9] to-[#0369a1]", category: "projects", module: "Projects", minTier: "pro" },
  { label: "Timesheets",        href: "/projects/timesheets",    icon: Clock3,           gradient: "from-[#3b82f6] to-[#1e40af]", category: "projects", module: "Projects", minTier: "pro" },

  // SUPPORT
  { label: "Tickets",           href: "/support/tickets",        icon: Ticket,           gradient: "from-[#f43f5e] to-[#9f1239]", category: "support", module: "Support" },
  { label: "Issues",            href: "/support/issues",         icon: AlertOctagon,     gradient: "from-[#e11d48] to-[#881337]", category: "support", module: "Support" },
  { label: "Warranty",          href: "/support/warranty",       icon: ShieldAlert,      gradient: "from-[#f59e0b] to-[#b45309]", category: "support", module: "Support" },
  { label: "SLAs",              href: "/support/slas",           icon: HardHat,          gradient: "from-[#fb7185] to-[#be123c]", category: "support", module: "Support" },

  // SETUP
  { label: "Team",              href: "/settings/team",          icon: UserCog,          gradient: "from-[#64748b] to-[#334155]", category: "setup" },
  { label: "Billing",           href: "/billing",                icon: CreditCard,       gradient: "from-[#94a3b8] to-[#475569]", category: "setup" },
  { label: "Settings",          href: "/settings",               icon: Settings,         gradient: "from-[#71717a] to-[#3f3f46]", category: "setup" },
  { label: "Help",              href: "/help",                   icon: LifeBuoy,         gradient: "from-[#a1a1aa] to-[#52525b]", category: "setup" }
];
