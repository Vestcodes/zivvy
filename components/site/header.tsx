"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem
} from "@/components/ui/navbar-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PRODUCT_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/integrations", label: "Integrations" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" }
];

const SOLUTIONS_LINKS = [
  { href: "/solutions/startups", label: "For startups" },
  { href: "/solutions/agencies", label: "For agencies" },
  { href: "/solutions/enterprises", label: "For enterprises" },
  { href: "/solutions/hr-teams", label: "For HR teams" },
  { href: "/solutions/marketing-teams", label: "For marketing" },
  { href: "/solutions/developers", label: "For developers" }
];

const SOLUTIONS_SECONDARY = [
  { href: "/use-cases", label: "Use cases" },
  { href: "/industries", label: "Industries" }
];

const RESOURCES_LINKS = [
  { href: "/resources", label: "Resource center" },
  { href: "/blog", label: "Blog" },
  { href: "/support/docs", label: "Documentation" },
  { href: "/support/help-center", label: "Help center" },
  { href: "/support/changelog", label: "Changelog" },
  { href: "/support/roadmap", label: "Roadmap" }
];

const COMPARE_LINKS = [
  { href: "/compare", label: "Compare tools" },
  { href: "/compare/odoo", label: "Zivvy vs Odoo" },
  { href: "/compare/zoho", label: "Zivvy vs Zoho" },
  { href: "/alternatives", label: "Alternatives" }
];

const MOBILE_SECTIONS = [
  { title: "Product", links: [...PRODUCT_LINKS, { href: "/product-tour", label: "Product tour" }] },
  { title: "Solutions", links: [...SOLUTIONS_LINKS, ...SOLUTIONS_SECONDARY] },
  { title: "Resources", links: RESOURCES_LINKS },
  { title: "Compare", links: COMPARE_LINKS },
  { title: "Company", links: [{ href: "/contact", label: "Contact" }, { href: "/pricing", label: "Pricing" }] }
];

function DesktopNav() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Menu setActive={setActive} className="hidden md:flex">
      <MenuItem setActive={setActive} active={active} item="Product">
        <div className="flex gap-6">
          <div className="flex flex-col space-y-3">
            <ProductItem
              title="Product tour"
              description="See Business-tier Zivvy in a short walkthrough."
              href="/product-tour"
              src="/videos/zivvy-product-tour-poster.jpg"
            />
            <ProductItem
              title="Features"
              description="Sales, stock, accounting, HR, manufacturing."
              href="/features"
              src="/videos/zivvy-product-tour-poster.jpg"
            />
          </div>
          <div className="flex min-w-[10rem] flex-col space-y-3 border-l border-border/60 pl-5">
            {PRODUCT_LINKS.map((item) => (
              <HoveredLink key={item.href} href={item.href}>
                {item.label}
              </HoveredLink>
            ))}
          </div>
        </div>
      </MenuItem>

      <MenuItem setActive={setActive} active={active} item="Solutions">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {SOLUTIONS_LINKS.map((item) => (
            <HoveredLink key={item.href} href={item.href}>
              {item.label}
            </HoveredLink>
          ))}
          <div className="col-span-2 mt-2 border-t border-border/60 pt-3">
            <div className="flex gap-6">
              {SOLUTIONS_SECONDARY.map((item) => (
                <HoveredLink key={item.href} href={item.href} className="font-medium text-foreground">
                  {item.label}
                </HoveredLink>
              ))}
            </div>
          </div>
        </div>
      </MenuItem>

      <MenuItem setActive={setActive} active={active} item="Resources">
        <div className="flex min-w-[12rem] flex-col space-y-3">
          {RESOURCES_LINKS.map((item) => (
            <HoveredLink key={item.href} href={item.href}>
              {item.label}
            </HoveredLink>
          ))}
        </div>
      </MenuItem>

      <MenuItem setActive={setActive} active={active} item="Compare">
        <div className="flex min-w-[12rem] flex-col space-y-3">
          {COMPARE_LINKS.map((item) => (
            <HoveredLink key={item.href} href={item.href}>
              {item.label}
            </HoveredLink>
          ))}
        </div>
      </MenuItem>

      <Link
        href="/pricing"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={() => setActive(null)}
      >
        Pricing
      </Link>
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
      <SheetContent side="right" className="w-[min(100%,20rem)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-display">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {MOBILE_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="polished" className="hidden sm:inline-flex">
            <Link href="/login#signup">Start free</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
