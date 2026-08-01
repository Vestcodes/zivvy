"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BentoGrid,
  BentoGridItem,
  CardBody,
  CardContainer,
  CardItem,
  DirectionAwareHover,
  HoverEffect,
  MovingBorderButton,
  Spotlight
} from "@/components/ui/aceternity";
import { AddonSubscribeForm } from "@/components/site/marketing/addon-subscribe";
import { BrandLogo } from "@/components/site/brand-logo";
import { LocalisedPrice } from "@/components/pricing/localised-price";
import {
  BreadcrumbJsonLd,
  FaqJsonLd
} from "@/components/site/marketing/seo-scripts";
import type { AddonDetail } from "@/lib/addons-content";
import { SITE_ORIGIN } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Detail page for /addons/[slug]. Now a client component so it can host
 * the motion-heavy Aceternity primitives (Spotlight, CardContainer,
 * DirectionAwareHover, MovingBorder). The RSC parent still handles
 * cookie inspection and passes `loggedIn` down as a plain prop.
 */

interface AddonDetailPageProps {
  addon: AddonDetail;
  loggedIn: boolean;
}

const DASHBOARD_URL = "/signup?redirect=/settings/addons";

/** Brand marks to feature at the top of each addon's detail hero. */
const ADDON_BRAND_SLUGS: Record<string, string[]> = {
  "ecommerce-integrations": ["shopify", "amazon", "unicommerce"],
  "erpnext-datev": ["datev"],
  "digital-signer": ["digital-signer"],
  "payments-processor": ["payments-processor"]
};

/**
 * A palette of gradient SVGs used as DirectionAwareHover images for
 * FAQ items. Serialized as data URIs so we don't need to ship image
 * files. Emerald-forward to match the Zivvy accent.
 */
const FAQ_GRADIENTS = [
  ["#0f766e", "#059669", "#34d399"],
  ["#065f46", "#10b981", "#a7f3d0"],
  ["#064e3b", "#0d9488", "#5eead4"],
  ["#134e4a", "#0e7490", "#22d3ee"]
];

function gradientDataUri(colors: string[]): string {
  const [a, b, c] = colors;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0%' stop-color='${a}'/>` +
    `<stop offset='55%' stop-color='${b}'/>` +
    `<stop offset='100%' stop-color='${c}'/>` +
    `</linearGradient>` +
    `<radialGradient id='r' cx='30%' cy='20%' r='75%'>` +
    `<stop offset='0%' stop-color='rgba(255,255,255,0.35)'/>` +
    `<stop offset='100%' stop-color='rgba(255,255,255,0)'/>` +
    `</radialGradient></defs>` +
    `<rect width='800' height='500' fill='url(#g)'/>` +
    `<rect width='800' height='500' fill='url(#r)'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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

        <Spotlight
          className="relative overflow-hidden"
          fill="color-mix(in oklab, var(--primary) 45%, transparent)"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% -10%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 75%)"
            }}
          />
          <section className="mx-auto max-w-5xl px-6 pb-10 pt-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div>
                <Badge
                  variant="outline"
                  className="border-border/60 bg-background/70 font-medium text-muted-foreground"
                >
                  {addon.category} add-on
                </Badge>
                {ADDON_BRAND_SLUGS[addon.slug]?.length ? (
                  <div
                    className="mt-5 flex items-center gap-3"
                    aria-label="Tools unlocked by this add-on"
                  >
                    {ADDON_BRAND_SLUGS[addon.slug]!.map((brandSlug) => (
                      <span
                        key={brandSlug}
                        className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/70 shadow-sm"
                      >
                        <BrandLogo
                          slug={brandSlug}
                          className="size-8 text-foreground/80"
                        />
                      </span>
                    ))}
                  </div>
                ) : null}
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

              <aside className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card/70 p-6 shadow-lg shadow-emerald-500/5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pricing
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <LocalisedPrice
                    amountCents={addon.priceUsd * 100}
                    className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
                  />
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    / mo
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {addon.billing}
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    asChild
                    variant="polished"
                    size="lg"
                    className="w-full"
                  >
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
        </Spotlight>

        <section
          className="mx-auto max-w-6xl px-6 py-12"
          aria-labelledby="addon-benefits"
        >
          <h2
            id="addon-benefits"
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            What you get
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each tile maps to a shipped feature — no marketing filler.
          </p>
          <BentoGrid className="mt-6 max-w-none gap-4 md:auto-rows-[13rem] md:grid-cols-2">
            {addon.benefits.map((benefit, index) => (
              <BentoGridItem
                key={benefit.title}
                className={cn(
                  "border-border/70 bg-card/60 dark:bg-card/40",
                  // Give the first benefit a little more visual weight
                  index === 0 && "md:col-span-2"
                )}
                title={
                  <span className="text-base font-semibold text-foreground">
                    {benefit.title}
                  </span>
                }
                description={
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </span>
                }
              />
            ))}
          </BentoGrid>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 py-8"
          aria-labelledby="addon-included"
        >
          <h2
            id="addon-included"
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            What&apos;s included
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The shipped surface — hover to focus a bundle.
          </p>
          <HoverEffect
            className="mt-2 py-4 [&_a>div]:bg-card/70 [&_a>div]:border-border/60 [&_a>div]:dark:border-border/60"
            items={addon.benefits.map((benefit) => ({
              title: benefit.title,
              description: benefit.description,
              link: "#addon-included"
            }))}
          />
        </section>

        <section
          className="mx-auto max-w-5xl px-6 py-12"
          aria-labelledby="addon-code"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="addon-code"
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Try it from the terminal
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {addon.code.language}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {addon.code.label}
          </p>

          <div className="mt-2">
            <CardContainer
              containerClassName="py-6"
              className="w-full max-w-full"
            >
              <CardBody className="group/card relative h-auto w-full rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-6">
                <CardItem
                  translateZ={30}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-400/70" />
                    <span className="size-2.5 rounded-full bg-amber-400/70" />
                    <span className="size-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    {addon.code.language}
                  </span>
                </CardItem>
                <CardItem translateZ={50} className="mt-3 w-full">
                  <pre className="max-h-[420px] w-full overflow-auto rounded-xl bg-muted/70 p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
                    <code>{addon.code.code}</code>
                  </pre>
                </CardItem>
                <CardItem
                  translateZ={20}
                  className="mt-3 w-full text-xs text-muted-foreground"
                >
                  Replace{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                    API_KEY:API_SECRET
                  </code>{" "}
                  with a token from your workspace&apos;s API settings.
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 py-12"
          aria-labelledby="addon-faq"
        >
          <div className="text-center">
            <h2
              id="addon-faq"
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Frequently asked
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hover a card to reveal the answer.
            </p>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {addon.faqs.map((faq, index) => (
              <li key={faq.question} className="flex justify-center">
                <div className="w-full max-w-md">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    {faq.question}
                  </p>
                  <DirectionAwareHover
                    imageUrl={gradientDataUri(
                      FAQ_GRADIENTS[index % FAQ_GRADIENTS.length]
                    )}
                    className="h-56 w-full rounded-2xl md:h-64 md:w-full"
                    imageClassName="rounded-2xl"
                    childrenClassName="left-5 right-5 bottom-5"
                  >
                    <p className="max-w-full text-sm leading-relaxed text-white">
                      {faq.answer}
                    </p>
                  </DirectionAwareHover>
                </div>
              </li>
            ))}
          </ul>
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
              <MovingBorderButton
                as="a"
                href={DASHBOARD_URL}
                target="_blank"
                rel="noreferrer"
                borderRadius="9999px"
                containerClassName="h-12 w-auto md:!col-span-1"
                className="border-primary/40 bg-primary/90 px-6 text-sm font-semibold text-primary-foreground dark:bg-primary/90"
                borderClassName="bg-[radial-gradient(theme(colors.emerald.400)_40%,transparent_60%)]"
                duration={3500}
              >
                <span className="inline-flex items-center gap-2">
                  Subscribe from your dashboard
                  <ArrowRight className="size-4" />
                </span>
              </MovingBorderButton>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
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
