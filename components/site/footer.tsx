"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, ExternalLink, Heart, Mail } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

const API_DOCS_URL = "https://integrate.zivvy.xyz/docs";
const OPENAPI_URL = "https://integrate.zivvy.xyz/openapi.json";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/integrations", label: "Integrations" },
      { href: "/addons", label: "Add-ons" },
      { href: "/pricing#comparison", label: "Compare plans" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/security", label: "Security" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" }
    ]
  },
  {
    title: "Developers",
    links: [
      { href: API_DOCS_URL, label: "Docs", external: true },
      { href: OPENAPI_URL, label: "OpenAPI", external: true },
      { href: "/support", label: "Support" },
      { href: "/support/changelog", label: "Changelog" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/dpa", label: "DPA" },
      { href: "/cookies", label: "Cookies" },
      { href: "/refunds", label: "Billing & refunds" },
      { href: "/acceptable-use", label: "Acceptable use" }
    ]
  }
];

function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("That doesn't look like a valid email.");
      return;
    }
    setPending(true);
    // No backend wiring yet — communicate honestly.
    window.setTimeout(() => {
      toast("Coming soon", {
        description:
          "The Zivvy newsletter isn't live yet. We'll email you the moment it is."
      });
      setEmail("");
      setPending(false);
    }, 200);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <Mail className="size-3.5 text-primary" aria-hidden />
        Product notes, once a month
      </div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Ship logs, playbooks, launches. No spam.
      </p>
      <div className="mt-3 flex items-stretch gap-2">
        <label htmlFor="footer-newsletter" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 flex-1 rounded-lg border border-border/70 bg-background px-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-all",
            "hover:brightness-110 hover:shadow-elevation-sm disabled:pointer-events-none disabled:opacity-70"
          )}
        >
          {pending ? "…" : "Notify me"}
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer
      data-slot="site-footer"
      className="relative mt-16 overflow-hidden border-t border-border/60 bg-muted/25"
    >
      <DotPattern
        aria-hidden
        cr={0.9}
        className={cn(
          "[mask-image:radial-gradient(60%_50%_at_20%_0%,white,transparent)]",
          "text-muted-foreground/35"
        )}
        glow
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr_1.1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Zivvy is business software that works — the whole stack in one
              place, without the bloat.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                All systems go
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5">
                EU · US · IN regions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={`${col.title}-${link.href}-${link.label}`}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                          <ExternalLink className="size-3 opacity-70" aria-hidden />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:pl-6">
            <NewsletterCard />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} Vestcodes.</span>
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="size-3 text-rose-500" aria-hidden fill="currentColor" /> care
            </span>
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
            <a
              href="mailto:support@zivvy.xyz"
              className="transition-colors hover:text-foreground"
            >
              support@zivvy.xyz
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
