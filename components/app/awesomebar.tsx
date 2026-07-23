"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, PlusCircle, LayoutDashboard, CreditCard, LifeBuoy, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from "@/components/ui/command";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
  { label: "New sales invoice", href: "/sales/invoices/new", icon: PlusCircle },
  { label: "New customer", href: "/sales/customers/new", icon: PlusCircle },
  { label: "New purchase order", href: "/purchases/orders/new", icon: PlusCircle },
  { label: "New item", href: "/stock/items/new", icon: PlusCircle }
];

const JUMP = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Help", href: "/help", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function AwesomebarTrigger() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 w-full max-w-72 justify-between text-muted-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="size-4" />
          <span className="text-sm">Search or jump…</span>
        </span>
        <kbd className="pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          <span>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search customers, invoices, actions…" />
        <CommandList>
          <CommandEmpty>Nothing matched.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            {QUICK_ACTIONS.map((a) => (
              <CommandItem
                key={a.href}
                value={a.label}
                onSelect={() => go(a.href)}
              >
                <a.icon />
                {a.label}
                <CommandShortcut>
                  <ArrowRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Jump to">
            {JUMP.map((j) => (
              <CommandItem key={j.href} value={j.label} onSelect={() => go(j.href)}>
                <j.icon />
                {j.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {Object.values(MODULE_NAVS)
            .filter((m) => m.key !== "settings")
            .map((mod) => (
              <CommandGroup key={mod.key} heading={mod.title}>
                {mod.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${mod.title} ${item.label}`}
                    onSelect={() => go(item.href)}
                  >
                    <item.icon />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
