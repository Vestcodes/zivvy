import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { AddonSubscribeForm } from "@/components/site/marketing/addon-subscribe";
import {
  BreadcrumbJsonLd,
  FaqJsonLd
} from "@/components/site/marketing/seo-scripts";
import type { AddonDetail } from "@/lib/addons-content";
import { SITE_ORIGIN } from "@/lib/seo";

/**
 * Detail page for /addons/[slug]. Renders hero + price, benefits, a
 * shell curl example, and an FAQ. When `loggedIn` is true (parent RSC
 * detected a valid `sid` cookie), we also render the in-workspace
 * Subscribe form.
 */

interface AddonDetailPageProps {
  addon: AddonDetail;
  loggedIn: boolean;
}

const DASHBOARD_URL = "https://zivvy.xyz/settings/addons";

export function AddonDetailPage({ addon, loggedIn }: AddonDetailPageProps) {
  const canonicalPath = `/addons/${addon.slug}`;
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Add-ons", url: "/addons" },
    { name: addon.name, url: canonicalPath }
  ];
  const faqEntries = addon.faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer
  }));

  return (
    <>
      <SiteHeader />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FaqJsonLd faqs={faqEntries} />

      <main>
        <div className="mx-auto max-w-5xl px-6 pt-10">
          <nav aria-label="Breadcrumb" className="text-xs">
            <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3" />
              </li>
              <li>
                <Link href="/addons" className="hover:text-foreground">
                  Add-ons
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page" className="text-foreground">
                {addon.name}
              </li>
            </ol>
          </nav>
        </div>

        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <Badge
                variant="outline"
                className="border-border/60 bg-background/70 font-medium text-muted-foreground"
              >
                {addon.category} add-on
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {addon.hero}
              </h1>
              {addon.subtitle ? (
                <p className="mt-3 max-w-2xl text-lg italic text-muted-foreground">
                  {addon.subtitle}
                </p>
              ) : null}
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {addon.description}
              </p>
            </div>

            <aside className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Pricing
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                {addon.price}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {addon.billing}
              </p>
              <div className="mt-5 space-y-3">
                <Button asChild variant="polished" size="lg" className="w-full">
                  <a
                    href={DASHBOARD_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Subscribe from your dashboard
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Opens {DASHBOARD_URL.replace("https://", "")}
                </p>
              </div>

              {loggedIn ? (
                <div className="mt-5">
                  <AddonSubscribeForm
                    addonSlug={addon.slug}
                    addonName={addon.name}
                    price={addon.price}
                    method={addon.frappeMethod}
                  />
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            What you get
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {addon.benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Try it from the terminal
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {addon.code.language}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {addon.code.label}
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-muted/60">
            <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed">
              <code>{addon.code.code}</code>
            </pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Replace <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">API_KEY:API_SECRET</code>{" "}
            with a token from your workspace's API settings.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-6 rounded-xl border border-border/70 bg-card/60 px-2"
          >
            {addon.faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="border-border/60 last:border-b-0"
              >
                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ready to turn on {addon.name}?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Add-ons switch on per workspace. Cancel any time from the same
              dashboard.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
                  Subscribe from your dashboard
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/addons">See all add-ons</Link>
              </Button>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Canonical: {SITE_ORIGIN}
              {canonicalPath}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
