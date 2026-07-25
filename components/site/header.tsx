"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  BookOpen,
  Code2,
  ExternalLink,
  Factory,
  FileText,
  Globe2,
  Headphones,
  LayoutDashboard,
  Layers,
  Menu as MenuIcon,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  Users,
  Wallet,
  Webhook,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import {
  Menu,
  MenuItem
} from "@/components/ui/navbar-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Client-side logged-in probe. Frappe sets a non-httpOnly `user_id`
 * cookie on login and clears it on logout. Empty / "Guest" means
 * anonymous. Only reads once on mount — good enough for a marketing
 * header CTA, and never blocks SSR.
 */
function useLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
    const userId = match ? decodeURIComponent(match[1]) : "";
    setLoggedIn(Boolean(userId) && userId !== "Guest");
  }, []);
  return loggedIn;
}

const ANNOUNCEMENT_KEY = "zivvy_ann_banking_v1";
const API_DOCS_URL = "https://integrate.zivvy.xyz/docs";

type IconType = React.ComponentType<{ className?: string }>;

type MegaLink = {
  href: string;
  label: string;
  description?: string;
  icon: IconType;
  external?: boolean;
};

type MegaColumn = {
  heading: string;
  links: MegaLink[];
};

const PRODUCT_MEGA: MegaColumn[] = [
  {
    heading: "Modules",
    links: [
      {
        href: "/features",
        label: "CRM",
        description: "Pipeline, leads, deals.",
        icon: UserRound
      },
      {
        href: "/features",
        label: "Sales",
        description: "Quotes, orders, invoices.",
        icon: ShoppingBag
      },
      {
        href: "/features",
        label: "Banking",
        description: "Feeds, reconciliation.",
        icon: Wallet
      },
      {
        href: "/features",
        label: "HR",
        description: "People, payroll, leave.",
        icon: Users
      },
      {
        href: "/features",
        label: "Manufacturing",
        description: "BOMs, work orders, plans.",
        icon: Factory
      },
      {
        href: "/support",
        label: "Support",
        description: "Tickets, SLAs, docs.",
        icon: Headphones
      }
    ]
  },
  {
    heading: "Solutions",
    links: [
      {
        href: "/solutions/startups",
        label: "SMB",
        description: "Under 50 people, moving fast.",
        icon: Sparkles
      },
      {
        href: "/industries",
        label: "Ecommerce",
        description: "Shopify, Amazon, marketplaces.",
        icon: Store
      },
      {
        href: "/solutions",
        label: "DE Mittelstand",
        description: "DATEV, GoBD, ELSTER-ready.",
        icon: Globe2
      },
      {
        href: "/solutions",
        label: "USA-first",
        description: "USD, ACH, US sales tax.",
        icon: Globe2
      }
    ]
  },
  {
    heading: "Resources",
    links: [
      {
        href: API_DOCS_URL,
        label: "Docs",
        description: "Guides, tutorials, references.",
        icon: BookOpen,
        external: true
      },
      {
        href: API_DOCS_URL,
        label: "API",
        description: "REST + OpenAPI reference.",
        icon: Code2,
        external: true
      },
      {
        href: "/developers/webhooks",
        label: "Webhooks",
        description: "Event delivery — coming soon.",
        icon: Webhook
      },
      {
        href: "/blog",
        label: "Blog",
        description: "Product notes and playbooks.",
        icon: Newspaper
      },
      {
        href: "/support/changelog",
        label: "Changelog",
        description: "What shipped and when.",
        icon: FileText
      }
    ]
  }
];

const INTEGRATIONS_MENU: MegaLink[] = [
  {
    href: "/integrations",
    label: "All integrations",
    description: "Browse the full catalog.",
    icon: Layers
  },
  {
    href: "/integrations",
    label: "Payments",
    description: "Stripe, Polar, GoCardless.",
    icon: Wallet
  },
  {
    href: "/integrations",
    label: "Ecommerce",
    description: "Shopify, Amazon, Unicommerce.",
    icon: ShoppingBag
  },
  {
    href: "/integrations",
    label: "Accounting",
    description: "QuickBooks, Xero, DATEV.",
    icon: FileText
  },
  {
    href: "/integrations",
    label: "Comms",
    description: "Slack, Twilio, Postmark.",
    icon: MessageSquare
  },
  {
    href: "/integrations",
    label: "Productivity",
    description: "Notion, Airtable, GitHub.",
    icon: Boxes
  }
];

const MOBILE_SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/product-tour", label: "Product tour" },
      { href: "/integrations", label: "Integrations" },
      { href: "/addons", label: "Add-ons" },
      { href: "/security", label: "Security" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions/startups", label: "For SMB" },
      { href: "/industries", label: "For ecommerce" },
      { href: "/solutions", label: "For DE Mittelstand" },
      { href: "/solutions", label: "For USA-first" }
    ]
  },
  {
    title: "Developers",
    links: [
      { href: API_DOCS_URL, label: "Docs", external: true },
      { href: API_DOCS_URL, label: "API reference", external: true },
      { href: "/developers/webhooks", label: "Webhooks" },
      { href: "/support/changelog", label: "Changelog" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" }
    ]
  }
];

function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setDismissed(window.localStorage.getItem(ANNOUNCEMENT_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(ANNOUNCEMENT_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  };

  if (!ready || dismissed) return null;

  return (
    <div className="relative border-b border-border/60 bg-background text-foreground">
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-center gap-2 px-6 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          New
        </span>
        <Link
          href="/features"
          className="group relative inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Banking + Reconciliation is live</span>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-[1.5px] overflow-hidden"
          >
            <motion.span
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{
                duration: 2.8,
                ease: "linear",
                repeat: Infinity
              }}
            />
          </span>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}

function MegaLinkItem({ link, onClick }: { link: MegaLink; onClick?: () => void }) {
  const Icon = link.icon;
  const cls =
    "group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none";
  const content = (
    <>
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1 text-[13.5px] font-medium text-foreground">
          {link.label}
          {link.external ? (
            <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
          ) : null}
        </span>
        {link.description ? (
          <span className="text-[12.5px] leading-snug text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
    </>
  );
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls} onClick={onClick}>
      {content}
    </Link>
  );
}

function DesktopNav() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Menu setActive={setActive} className="hidden md:flex">
      <MenuItem setActive={setActive} active={active} item="Product">
        <div className="grid w-[46rem] grid-cols-3 gap-x-6 gap-y-1">
          {PRODUCT_MEGA.map((col) => (
            <div key={col.heading} className="flex min-w-0 flex-col">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {col.heading}
              </p>
              <div className="flex flex-col gap-0.5">
                {col.links.map((link) => (
                  <MegaLinkItem key={`${col.heading}-${link.label}`} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </MenuItem>

      <MenuItem setActive={setActive} active={active} item="Integrations">
        <div className="grid w-[28rem] grid-cols-2 gap-1">
          {INTEGRATIONS_MENU.map((link) => (
            <MegaLinkItem key={`int-${link.label}`} link={link} />
          ))}
        </div>
      </MenuItem>

      <Link
        href="/addons"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={() => setActive(null)}
      >
        Add-ons
      </Link>
      <Link
        href="/pricing"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={() => setActive(null)}
      >
        Pricing
      </Link>
      <a
        href={API_DOCS_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={() => setActive(null)}
      >
        API
        <ExternalLink className="size-3" aria-hidden />
      </a>
      <Link
        href="/contact"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={() => setActive(null)}
      >
        Contact
      </Link>
    </Menu>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const loggedIn = useLoggedIn();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100%,22rem)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-display">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {MOBILE_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.links.map((link) => {
                  const external = "external" in link && link.external;
                  const className =
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-accent";
                  return (
                    <li key={`${section.title}-${link.href}-${link.label}`}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={() => setOpen(false)}
                          className={className}
                        >
                          {link.label}
                          <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={className}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
            {loggedIn ? (
              <Button asChild variant="polished">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="size-4" />
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="polished">
                  <Link href="/login#signup" onClick={() => setOpen(false)}>
                    Start free
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const loggedIn = useLoggedIn();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full" data-slot="site-header">
      <AnnouncementBar />
      <header
        className={cn(
          "w-full border-b transition-all duration-200",
          scrolled
            ? "border-border/70 bg-background/85 backdrop-blur-lg shadow-elevation-sm"
            : "border-border/40 bg-background/70 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="shrink-0" aria-label="Zivvy — home">
            <Logo />
          </Link>

          <DesktopNav />

          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Button asChild size="sm" variant="polished" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" variant="polished" className="hidden sm:inline-flex">
                  <Link href="/login#signup">Start free</Link>
                </Button>
              </>
            )}
            <MobileNav />
          </div>
        </div>
      </header>
    </div>
  );
}

