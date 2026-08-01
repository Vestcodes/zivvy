"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoot, useZivvyBoot } from "@/components/boot-provider";

export function DashboardHero() {
  const boot = useBoot();
  const zivvy = useZivvyBoot();
  const firstName = boot.user?.full_name?.split(" ")[0];
  const greeting = getGreeting();
  const company = zivvy?.tenant?.company;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {company ? (
            <>
              <span className="font-medium text-foreground/80">{company}</span>
              <span className="text-muted-foreground/50"> · </span>
              <span className="font-mono">{today}</span>
            </>
          ) : (
            today
          )}
        </p>
        <h1 className="type-page-title">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </h1>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/sales/customers?new=1">
            <Plus />
            New customer
          </Link>
        </Button>
        <Button asChild variant="polished" size="sm">
          <Link href="/sales/invoices?new=1">
            <Plus />
            New invoice
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
