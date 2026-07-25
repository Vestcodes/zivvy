import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PrintButton } from "@/components/site/marketing/print-button";

/**
 * LegalShell — shared shell for /privacy, /terms, /dpa, /cookies,
 * /refunds, /acceptable-use.
 *
 * Renders SiteHeader + SiteFooter, a breadcrumb, a sticky "On this
 * page" sidebar auto-generated from h2/h3 in the body, prose
 * typography (max-w-3xl, leading-relaxed), a last-updated banner, and
 * print-friendly CSS. Legal copy is preserved verbatim from the pages
 * — this component only supplies chrome and navigation.
 */

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/acceptable-use", label: "Acceptable use" },
  { href: "/refunds", label: "Billing & refunds" },
  { href: "/dpa", label: "DPA" },
  { href: "/security", label: "Security" }
] as const;

type Heading = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function nodeToText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return nodeToText(props.children);
  }
  return "";
}

function annotateHeadings(
  children: React.ReactNode,
  headings: Heading[],
  seen: Map<string, number>
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const type = child.type;
    if (type === "h2" || type === "h3") {
      const props = child.props as {
        id?: string;
        children?: React.ReactNode;
      };
      const text = nodeToText(props.children).trim();
      let base = props.id ?? slugify(text);
      if (!base) base = "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count > 0 ? `${base}-${count}` : base;
      headings.push({ id, text, level: type === "h2" ? 2 : 3 });
      return React.cloneElement(child as React.ReactElement<{ id?: string }>, {
        id
      });
    }
    return child;
  });
}

const PRINT_CSS = `
@media print {
  header[data-slot], footer[data-slot] { display: none !important; }
  .legal-print-hide { display: none !important; }
  .legal-print-full { max-width: 100% !important; padding: 0 !important; }
  body { color: #000 !important; background: #fff !important; }
  a[href^="http"]::after, a[href^="mailto:"]::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #444;
  }
  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
  article { max-width: 100% !important; }
  .legal-shell-root { padding: 0 !important; }
}
`;

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
  const headings: Heading[] = [];
  const withIds = annotateHeadings(children, headings, new Map());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <SiteHeader />
      <main>
        <div className="legal-shell-root mx-auto max-w-6xl px-6 pt-10 sm:pt-14">
          <nav
            aria-label="Breadcrumb"
            className="legal-print-hide mb-6 text-xs"
          >
            <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-muted-foreground/60">
                <ChevronRight className="size-3" />
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Legal
                </Link>
              </li>
              <li aria-hidden className="text-muted-foreground/60">
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page" className="text-foreground">
                {title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="legal-print-hide hidden lg:block" aria-label="On this page">
              <div className="sticky top-24">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  On this page
                </p>
                {headings.length > 0 ? (
                  <ul className="border-l border-border/60">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className={
                            h.level === 2
                              ? "-ml-px block border-l-2 border-transparent py-1 pl-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                              : "-ml-px block border-l-2 border-transparent py-1 pl-6 text-[12px] text-muted-foreground/80 transition-colors hover:border-primary/60 hover:text-foreground"
                          }
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/70">
                    No sections yet.
                  </p>
                )}

                <p className="mt-8 mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Legal documents
                </p>
                <ul className="space-y-0.5">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-md px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className="legal-print-full max-w-3xl pb-24">
              <header className="mb-10 border-b border-border/60 pb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Legal
                </p>
                <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  {title}
                </h1>
                {summary ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    {summary}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <span
                      className="size-1.5 rounded-full bg-primary/70"
                      aria-hidden
                    />
                    Last updated:{" "}
                    <span className="font-medium text-foreground">{updated}</span>
                  </span>
                  <PrintButton />
                </div>
              </header>

              <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:scroll-mt-28 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground [&_li]:my-1 [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px]">
                {withIds}
              </div>

              <aside className="legal-print-hide mt-14 rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  Questions about these documents?
                </p>
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
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

