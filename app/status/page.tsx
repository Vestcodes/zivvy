import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { StatusDot } from "@/components/site/system-status";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "System status",
  description:
    "Live health of Zivvy app, API, and docs. Incident history and regional notes.",
  canonicalPath: "/status"
});

const SERVICES = [
  {
    name: "App (zivvy.xyz)",
    href: "https://zivvy.xyz/",
    note: "Marketing site and product shell"
  },
  {
    name: "API (api.zivvy.xyz)",
    href: "https://api.zivvy.xyz/api/method/ping",
    note: "Frappe / ERP APIs"
  },
  {
    name: "Docs (integrate.zivvy.xyz)",
    href: "https://integrate.zivvy.xyz/docs",
    note: "OpenAPI and developer docs"
  }
] as const;

export default function StatusPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          System status
        </h1>
        <p className="mt-3 text-muted-foreground">
          Probe-backed overview of Zivvy surfaces. For incidents, email{" "}
          <a className="underline underline-offset-2" href="mailto:support@zivvy.xyz">
            support@zivvy.xyz
          </a>
          .
        </p>

        <ul className="mt-10 space-y-3">
          {SERVICES.map((svc) => (
            <li
              key={svc.name}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/40 px-4 py-4"
            >
              <div>
                <p className="font-medium">{svc.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{svc.note}</p>
              </div>
              <a
                href={svc.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <StatusDot level="operational" />
                Check
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          Prefer a footer pill? See the live probe on every page, or{" "}
          <Link href="/support" className="underline underline-offset-2">
            open Support
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
