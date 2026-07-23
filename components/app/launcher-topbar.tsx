"use client";

import Link from "next/link";
import { LogOut, Settings, CreditCard, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useBoot, useZivvyBoot } from "@/components/boot-provider";
import { frappeLogout } from "@/lib/frappe-client";

const TIER_STYLE: Record<string, string> = {
  free: "bg-muted text-foreground border-transparent",
  pro: "bg-primary text-primary-foreground border-transparent",
  business: "bg-foreground text-background border-transparent"
};

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business"
};

export function LauncherTopbar() {
  const boot = useBoot();
  const zivvy = useZivvyBoot();
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
    } catch {
      // ignore
    }
    toast.success("Signed out");
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
      <Link href="/apps" className="shrink-0">
        <Logo />
      </Link>
      {zivvy?.tenant?.company && (
        <span className="hidden text-sm text-muted-foreground md:inline">
          · {zivvy.tenant.company}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <AwesomebarTrigger />
        {zivvy && (
          <Badge className={TIER_STYLE[zivvy.tier] ?? TIER_STYLE.free}>
            {TIER_LABEL[zivvy.tier] ?? zivvy.tier}
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary-gradient text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-2">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{fullName}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <LifeBuoy />
                  Help
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
