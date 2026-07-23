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
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          {company ? (
            <>
              {company} <span className="text-muted-foreground/50">·</span>{" "}
              <span className="font-mono text-xs">{today}</span>
            </>
          ) : (
            today
          )}
        </p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Here's what's happening across your business today.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/sales/customers/new">
            <Plus />
            New customer
          </Link>
        </Button>
        <Button asChild variant="polished">
          <Link href="/sales/invoices/new">
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
