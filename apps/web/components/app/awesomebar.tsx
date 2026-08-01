"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Ticket,
  FileText,
  Loader2
} from "lucide-react";
import { frappeCall } from "@/lib/frappe-client";
import { SLUG_TO_DOCTYPE } from "@/lib/doctype-slugs";
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

// Reverse doctype → slug lookup for building deep-link URLs to found records.
const DOCTYPE_TO_SLUG: Record<string, string> = {};
for (const [slug, dt] of Object.entries(SLUG_TO_DOCTYPE)) {
  if (!DOCTYPE_TO_SLUG[dt]) DOCTYPE_TO_SLUG[dt] = `/${slug}`;
}

interface GlobalHit {
  doctype: string;
  name: string;
  content?: string;
}

/** Frappe returns each row as {doctype, name, content, ...}. Deep-link only
 *  when we have a slug mapping — otherwise the record isn't reachable via
 *  our routing and shouldn't be surfaced. */
function hitToHref(hit: GlobalHit): string | null {
  const base = DOCTYPE_TO_SLUG[hit.doctype];
  if (!base) return null;
  return `${base}/${encodeURIComponent(hit.name)}`;
}

export function AwesomebarTrigger({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GlobalHit[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Debounced live record search. Only fires when the query is >=2 chars
  // and the dialog is open — cancels any in-flight timer on new keystroke
  // + on close so we don't leak searches.
  useEffect(() => {
    if (!open) {
      setHits([]);
      setSearching(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const rows = await frappeCall<GlobalHit[]>(
          "frappe.utils.global_search.search",
          { text: q, start: 0, limit: 10 }
        );
        setHits(Array.isArray(rows) ? rows : []);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  // When the dialog closes reset the query so next open starts clean.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const routableHits = useMemo(
    () => hits.map((h) => ({ ...h, href: hitToHref(h) })).filter((h) => h.href),
    [hits]
  );

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

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={query.trim().length < 2}>
        <CommandInput
          placeholder="Search customers, invoices, actions…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {searching ? "Searching…" : query.trim().length >= 2 ? "Nothing matched." : "Nothing matched."}
          </CommandEmpty>

          {routableHits.length > 0 && (
            <>
              <CommandGroup heading={searching ? "Records (searching…)" : "Records"}>
                {routableHits.map((hit) => (
                  <CommandItem
                    key={`${hit.doctype}:${hit.name}`}
                    value={`record ${hit.doctype} ${hit.name} ${hit.content ?? ""}`}
                    onSelect={() => hit.href && go(hit.href)}
                  >
                    <FileText className="text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{hit.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {hit.doctype}
                        {hit.content ? ` · ${hit.content.replace(/<[^>]*>/g, "").slice(0, 80)}` : ""}
                      </span>
                    </div>
                    <CommandShortcut>
                      <ArrowRight className="size-3" />
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {searching && routableHits.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching records…
            </div>
          )}

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
