"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { AwesomebarTrigger } from "@/components/app/awesomebar";
import { useZivvyBoot } from "@/components/boot-provider";

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

function humanize(segment: string): string {
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function AppTopbar() {
  const pathname = usePathname();
  const boot = useZivvyBoot();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
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
                      <BreadcrumbPage>{humanize(seg)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{humanize(seg)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <AwesomebarTrigger />
        {boot && (
          <>
            <Badge className={TIER_STYLE[boot.tier] ?? TIER_STYLE.free}>
              {TIER_LABEL[boot.tier] ?? boot.tier}
            </Badge>
            {boot.tenant?.company && (
              <span className="hidden font-mono text-xs text-muted-foreground md:inline">
                · {boot.tenant.company}
              </span>
            )}
          </>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell />
        </Button>
      </div>
    </header>
  );
}
