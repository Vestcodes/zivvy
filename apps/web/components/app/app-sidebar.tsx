"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Lock, LayoutGrid } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/app/user-menu";
import { navForPath } from "@/components/app/sidebar-nav";
import { useZivvyBoot } from "@/components/boot-provider";
import { isItemGated } from "@/lib/gating";
import { useUpgradeDialog } from "@/components/billing/upgrade-affordance";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const nav = navForPath(pathname);
  const boot = useZivvyBoot();
  const upgrade = useUpgradeDialog(pathname);

  if (!nav) {
    return null;
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Back to Apps"
                className="text-sidebar-foreground/80 hover:text-sidebar-foreground"
              >
                <Link href="/apps">
                  <ArrowLeft />
                  <span>All apps</span>
                  <LayoutGrid className="ml-auto size-3.5 opacity-70" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-2 pt-2 pb-1">
            <p className="font-display text-lg leading-none tracking-tight">
              {nav.title}
            </p>
            {nav.subtitle && (
              <p className="mt-1 text-xs text-sidebar-foreground/60">
                {nav.subtitle}
              </p>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  const gate = isItemGated(
                    { module: item.module, minTier: item.minTier },
                    boot
                  );
                  const gated = gate.gated;
                  const gatedTooltip = gated
                    ? `Included in ${gate.requiredTier === "business" ? "Business" : "Pro"}`
                    : item.label;
                  return (
                    <SidebarMenuItem key={item.href}>
                      {gated ? (
                        <SidebarMenuButton
                          onClick={() =>
                            upgrade.open(item.label, gate.requiredTier ?? "pro")
                          }
                          tooltip={gatedTooltip}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <item.icon />
                          <span>{item.label}</span>
                          <Lock className="ml-auto size-3 text-sidebar-foreground/60" />
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
      {upgrade.element}
    </>
  );
}
