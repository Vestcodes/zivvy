import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/acceptable-use", label: "Acceptable use" },
  { href: "/refunds", label: "Billing & refunds" },
  { href: "/dpa", label: "DPA" },
  { href: "/security", label: "Security" }
] as const;

export function LegalShell({
  title,
  updated,
  summary,
  children
}: {
  title: string;
  updated: string;
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-24">
          <header className="mb-10 border-b border-border/60 pb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Legal
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
            {summary ? (
              <p className="mt-4 max-w-2xl text-base text-muted-foreground">{summary}</p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          </header>

          <nav
            aria-label="Legal documents"
            className="mb-10 flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/30 p-3"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="prose prose-neutral max-w-none text-[15px] leading-7 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-4 [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_li]:my-1 [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px]">
            {children}
          </div>

          <aside className="mt-14 rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Questions about these documents?</p>
            <p className="mt-2">
              Email{" "}
              <a
                href="mailto:support@zivvy.xyz"
                className="text-primary underline-offset-2 hover:underline"
              >
                support@zivvy.xyz
              </a>
              . We reply as humans — usually within one business day.
            </p>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
