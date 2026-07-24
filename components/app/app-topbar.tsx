"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { AwesomebarTrigger } from "@/components/app/awesomebar";
import { NotificationBell } from "@/components/app/notifications";
import { useZivvyBoot } from "@/components/boot-provider";
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

export function AppTopbar({ notifications = [], unreadCount = 0 }: TopbarProps) {
  const pathname = usePathname();
  const boot = useZivvyBoot();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-1.5 border-b bg-background/90 px-3 backdrop-blur">
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

      <div className="ml-auto flex items-center gap-1.5">
        <AwesomebarTrigger />
        {boot && (
          <Badge
            className={cn(
              "h-6 px-2 text-[10px] font-medium uppercase tracking-wide",
              TIER_STYLE[boot.tier] ?? TIER_STYLE.free
            )}
          >
            {TIER_LABEL[boot.tier] ?? boot.tier}
          </Badge>
        )}
        {boot?.tenant?.company && (
          <span className="hidden truncate max-w-[160px] font-mono text-xs text-muted-foreground lg:inline">
            {boot.tenant.company}
          </span>
        )}
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
      </div>
    </header>
  );
}
