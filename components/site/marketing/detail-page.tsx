"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ExternalLink, Radio, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { CodeExample, MarketingDetail } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { AnimatedList } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Props = {
  sectionLabel: string;
  sectionHref: string;
  entry: MarketingDetail;
};

function CodeBlock({ example }: { example: CodeExample }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur hover:text-foreground"
        aria-label="Copy code"
      >
        <Copy className="size-3.5" />
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="max-h-[420px] overflow-auto rounded-xl border border-border/70 bg-muted/60 p-4 pr-16 font-mono text-[12.5px] leading-relaxed">
        <code>{example.code}</code>
      </pre>
    </div>
  );
}

export function MarketingDetailPage({ sectionLabel, sectionHref, entry }: Props) {
  const canonicalPath = `${sectionHref}/${entry.slug}`.replace(/\/{2,}/g, "/");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a }
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zivvy.xyz/" },
      { "@type": "ListItem", position: 2, name: sectionLabel, item: `https://zivvy.xyz${sectionHref}` },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `https://zivvy.xyz${canonicalPath}`
      }
    ]
  };

  const hasCode = (entry.codeExamples?.length ?? 0) > 0;
  const hasEndpoints = (entry.apiEndpoints?.length ?? 0) > 0;
  const hasEvents = (entry.webhookEvents?.length ?? 0) > 0;
  const showIntegrationSection = hasCode || hasEndpoints;
  const defaultTab = entry.codeExamples?.[0]?.language ?? "curl";

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {entry.addonRequired ? (
          <div className="border-b border-primary/20 bg-primary/5">
            <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <span>
                  Requires the{" "}
                  <span className="font-mono font-semibold">{entry.addonRequired}</span> add-on
                  {entry.addonPrice ? (
                    <>
                      {" · "}
                      <span className="font-medium">{entry.addonPrice}</span>
                    </>
                  ) : null}
                </span>
              </div>
              <Link
                href="/settings/addons"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Manage add-ons
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ) : null}

        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(480px_circle_at_20%_0%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-24">
            <BlurFade>
              <Link
                href={sectionHref}
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                {sectionLabel}
              </Link>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {entry.title}
              </TextAnimate>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={entry.ctaHref}>
                    {entry.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/product-tour">See product tour</Link>
                </Button>
                {entry.docsUrl ? (
                  <Button asChild variant="ghost" size="lg">
                    <a href={entry.docsUrl} target="_blank" rel="noreferrer">
                      Read API docs
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-6 md:grid-cols-2">
          <BlurFade>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6">
              <ShineBorder shineColor={["#34d399", "#0f766e", "#34d399"]} duration={12} />
              <h2 className="font-display text-xl font-semibold">The snag</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.problem}</p>
            </div>
          </BlurFade>
          <BlurFade delay={0.08}>
            <div className="relative h-full overflow-hidden rounded-2xl">
              <MagicCard
                className="h-full rounded-2xl border border-border/70 bg-card/70 p-6"
                gradientFrom="#34d399"
                gradientTo="#0f766e"
                gradientColor="rgba(27, 152, 114, 0.1)"
              >
                <BorderBeam size={70} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                <h2 className="font-display text-xl font-semibold">How Zivvy helps</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.solution}</p>
              </MagicCard>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                What you get
              </h2>
              <ul className="mt-6 space-y-3">
                {entry.benefits.map((benefit, idx) => (
                  <BlurFade key={benefit} delay={0.03 + idx * 0.03}>
                    <li className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  </BlurFade>
                ))}
              </ul>
            </div>
            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
                <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={16} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Workflow stream
                </p>
                <div className="mt-4 min-h-[11rem]">
                  <AnimatedList delay={1400} className="gap-2">
                    {entry.useCases.map((useCase) => (
                      <div
                        key={useCase}
                        className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm text-foreground/90 shadow-sm"
                      >
                        {useCase}
                      </div>
                    ))}
                  </AnimatedList>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Common uses</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {entry.useCases.slice(0, 3).map((useCase, idx) => (
              <BlurFade key={useCase} delay={0.04 + idx * 0.04}>
                <li className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4">
                  {idx === 0 ? (
                    <BorderBeam size={50} duration={6} colorFrom="#34d399" colorTo="#0f766e" />
                  ) : null}
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/90">{useCase}</p>
                </li>
              </BlurFade>
            ))}
          </ol>
        </section>

        {showIntegrationSection ? (
          <section className="mx-auto max-w-5xl px-6 py-8">
            <BlurFade>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Integration code
                </h2>
                {entry.docsUrl ? (
                  <a
                    href={entry.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Open API reference
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
              {hasCode ? (
                <div className="mt-5 rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-5">
                  <Tabs defaultValue={defaultTab} className="gap-4">
                    <TabsList className="flex-wrap">
                      {entry.codeExamples!.map((ex) => (
                        <TabsTrigger key={ex.language} value={ex.language}>
                          <span className="font-mono text-[11px] uppercase tracking-wide">
                            {ex.language}
                          </span>
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            · {ex.label}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {entry.codeExamples!.map((ex) => (
                      <TabsContent key={ex.language} value={ex.language} className="mt-0">
                        <p className="mb-2 text-xs text-muted-foreground">{ex.label}</p>
                        <CodeBlock example={ex} />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              ) : null}
              {hasEndpoints ? (
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    API endpoints
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.apiEndpoints!.map((endpoint) => (
                      <Badge
                        key={endpoint}
                        variant="outline"
                        className="font-mono text-[11px] font-medium"
                      >
                        {endpoint}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </BlurFade>
          </section>
        ) : null}

        {hasEvents ? (
          <section className="mx-auto max-w-5xl px-6 py-6">
            <BlurFade>
              <div className="rounded-2xl border border-border/70 bg-card/50 p-5">
                <div className="flex items-center gap-2">
                  <Radio className="size-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    Events emitted
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  HMAC-SHA256 signed webhooks, retried for 24 hours.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {entry.webhookEvents!.map((event) => (
                    <li key={event}>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px] font-medium"
                      >
                        {event}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          </section>
        ) : null}

        <section className="mx-auto max-w-5xl px-6 py-8">
          <BlurFade>
            <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/50 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={2} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">free seats forever</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={0} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">card required to start</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">1</p>
                <p className="mt-1 text-xs text-muted-foreground">workspace for the workflow</p>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-8 rounded-xl border border-border/70 bg-card/60 px-2"
          >
            {entry.faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-border/60 last:border-b-0">
                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-3xl font-semibold tracking-tight">Ready to try it?</h2>
            <p className="mt-3 text-muted-foreground">Free plan. Two seats. No card.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href={entry.ctaHref}>{entry.ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <Link href={sectionHref} className="hover:text-foreground">
                More {sectionLabel.toLowerCase()}
              </Link>
              <span>·</span>
              <Link href="/compare" className="hover:text-foreground">
                Compare
              </Link>
              <span>·</span>
              <Link href="/solutions" className="hover:text-foreground">
                Solutions
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
