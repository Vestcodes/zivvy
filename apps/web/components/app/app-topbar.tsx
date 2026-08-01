"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LifeBuoy, LogOut, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AwesomebarTrigger } from "@/components/app/awesomebar";
import { NotificationBell } from "@/components/app/notifications";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { useZivvyBoot, useBoot } from "@/components/boot-provider";
import { frappeLogout } from "@/lib/frappe-client";
import { purgeAllSavedViews } from "@/lib/saved-views";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";

const TIER_STYLE: Record<string, string> = {
  free: "bg-muted text-foreground border-transparent",
  pro: "bg-primary-gradient text-primary-foreground border-transparent",
  business: "bg-foreground text-background border-transparent"
};

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business"
};

const SEGMENT_LABELS: Record<string, string> = {
  rfqs: "RFQs",
  slas: "SLAs",
  sla: "SLA",
  pos: "POS",
  crm: "CRM",
  hr: "HR",
  kpi: "KPI",
  kpis: "KPIs",
  bom: "BOM",
  boms: "BOMs",
  faq: "FAQ",
  faqs: "FAQs",
  api: "API",
  ceo: "CEO",
  cfo: "CFO",
  cto: "CTO"
};

function humanize(segment: string): string {
  const key = segment.toLowerCase();
  if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key];
  return segment
    .split("-")
    .map((s) => (SEGMENT_LABELS[s.toLowerCase()] ?? (s.charAt(0).toUpperCase() + s.slice(1))))
    .join(" ");
}

interface TopbarProps {
  notifications?: Notification[];
  unreadCount?: number;
}

// Compact avatar + dropdown for the top-right of the app shell.
function TopbarUserAvatar() {
  const boot = useBoot();
  const fullName = boot.user?.full_name ?? "Signed out";
  const email = boot.user?.name ?? "";
  const initials = (fullName || email || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function onLogout() {
    try {
      await frappeLogout();
    } catch (err) {
      // Still clear client state and bounce — session cookies may already be dead.
      console.error(err);
    }
    try {
      purgeAllSavedViews();
    } catch {
      // localStorage may be unavailable
    }
    window.location.href = "/login";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="ml-0.5 grid size-10 place-items-center rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{fullName}</span>
          {email && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="size-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing">
              <CreditCard className="size-4" /> Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/help">
              <LifeBuoy className="size-4" /> Help
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppTopbar({ notifications = [], unreadCount = 0 }: TopbarProps) {
  const pathname = usePathname();
  const boot = useZivvyBoot();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 grid h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b bg-background/90 px-2 backdrop-blur sm:px-3">
      {/* Left — sidebar trigger + breadcrumb */}
      <div className="flex min-w-0 items-center gap-1.5">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Breadcrumb className="hidden min-w-0 flex-shrink sm:block">
          <BreadcrumbList className="flex-nowrap">
            {segments.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              segments.map((seg, i) => {
                const isLast = i === segments.length - 1;
                const href = "/" + segments.slice(0, i + 1).join("/");
                return (
                  <span key={href} className="inline-flex items-center gap-1.5">
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="truncate max-w-[220px]">
                          {humanize(seg)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={href} className="truncate max-w-[120px]">
                            {humanize(seg)}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center — global search */}
      <div className="mx-auto w-full max-w-md justify-self-center">
        <div className="sm:hidden"><AwesomebarTrigger compact /></div>
        <div className="hidden sm:block"><AwesomebarTrigger /></div>
      </div>

      {/* Right — tier, tenant, bell, avatar */}
      <div className="flex items-center justify-end gap-1.5">
        {boot && (
          <Badge
            className={cn(
              "hidden h-6 shrink-0 px-2 text-[10px] font-medium uppercase tracking-wide sm:inline-flex",
              TIER_STYLE[boot.tier] ?? TIER_STYLE.free
            )}
          >
            {TIER_LABEL[boot.tier] ?? boot.tier}
          </Badge>
        )}
        {boot?.tenant?.company && (
          <span className="hidden truncate max-w-[140px] font-mono text-xs text-muted-foreground lg:inline">
            {boot.tenant.company}
          </span>
        )}
        <ThemeToggle />
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <TopbarUserAvatar />
      </div>
    </header>
  );
}
