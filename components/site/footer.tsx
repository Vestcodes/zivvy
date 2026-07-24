import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Separator } from "@/components/ui/separator";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/integrations", label: "Integrations" },
      { href: "/product-tour", label: "Product tour" },
      { href: "/pricing", label: "Pricing" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions/startups", label: "Startups" },
      { href: "/solutions/agencies", label: "Agencies" },
      { href: "/industries/manufacturing", label: "Manufacturing" },
      { href: "/use-cases/crm-automation", label: "CRM automation" }
    ]
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resource center" },
      { href: "/blog", label: "Blog" },
      { href: "/support", label: "Support" },
      { href: "/support/changelog", label: "Changelog" }
    ]
  },
  {
    title: "Compare",
    links: [
      { href: "/compare", label: "Compare" },
      { href: "/alternatives", label: "Alternatives" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/security", label: "Security" },
      { href: "/careers", label: "Careers" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
      { href: "/acceptable-use", label: "Acceptable use" },
      { href: "/refunds", label: "Billing & refunds" },
      { href: "/dpa", label: "DPA" }
    ]
  },
  {
    title: "Get started",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/login#signup", label: "Start free" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          <div className="sm:col-span-2 md:col-span-1 xl:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Zivvy — business software that works.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Zivvy. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <a href="mailto:support@zivvy.xyz" className="hover:text-foreground">
              support@zivvy.xyz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
