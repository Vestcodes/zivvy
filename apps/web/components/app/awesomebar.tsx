"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  PlusCircle,
  LayoutDashboard,
  CreditCard,
  LifeBuoy,
  Settings,
  UserCog,
  ShieldCheck,
  Package,
  Code,
  Landmark,
  KanbanSquare,
  Sparkles,
  Receipt,
  Users,
  ClipboardList,
  ScrollText,
  ShoppingCart,
  Truck,
  Boxes,
  UserRound,
  Ticket
} from "lucide-react";
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
  { label: "New sales invoice", href: "/sales/invoices?new=1", icon: Receipt },
  { label: "New customer", href: "/sales/customers?new=1", icon: Users },
  { label: "New quotation", href: "/sales/quotations?new=1", icon: ScrollText },
  { label: "New sales order", href: "/sales/orders?new=1", icon: ShoppingCart },
  { label: "New lead", href: "/crm/leads?new=1", icon: Sparkles },
  { label: "New opportunity", href: "/crm/opportunities?new=1", icon: KanbanSquare },
  { label: "New purchase order", href: "/purchases/orders?new=1", icon: ClipboardList },
  { label: "New purchase invoice", href: "/purchases/invoices?new=1", icon: Receipt },
  { label: "New supplier", href: "/purchases/suppliers?new=1", icon: Users },
  { label: "New item", href: "/stock/items?new=1", icon: PlusCircle },
  { label: "New stock entry", href: "/stock/entries?new=1", icon: Boxes },
  { label: "New delivery note", href: "/sales/deliveries?new=1", icon: Truck },
  { label: "New employee", href: "/hr/employees?new=1", icon: UserRound },
  { label: "New support ticket", href: "/service/tickets?new=1", icon: Ticket }
];

const JUMP = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Banking", href: "/finance/banking", icon: Landmark },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Help", href: "/help", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Team", href: "/settings/team", icon: UserCog },
  { label: "Roles", href: "/settings/roles", icon: ShieldCheck },
  { label: "Add-ons", href: "/settings/addons", icon: Package },
  { label: "Developer settings", href: "/settings/developer", icon: Code }
];

export function AwesomebarTrigger({ compact = false }: { compact?: boolean }) {
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
        size={compact ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        className={compact ? "size-10 text-muted-foreground" : "w-full max-w-56 justify-between text-muted-foreground"}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Search className="size-4 shrink-0" />
          {!compact ? <span className="truncate text-sm">Search…</span> : null}
        </span>
        {!compact ? (
          <kbd className="pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <span>⌘</span>K
          </kbd>
        ) : null}
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
