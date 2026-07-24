"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { CompareDetail } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Props = {
  sectionLabel: string;
  sectionHref: string;
  entry: CompareDetail;
};

export function CompareDetailPage({ sectionLabel, sectionHref, entry }: Props) {
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
        item: `https://zivvy.xyz${sectionHref}/${entry.slug}`
      }
    ]
  };

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(480px_circle_at_50%_-5%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-24">
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
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{entry.description}</p>

              <div className="mt-8 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="relative overflow-hidden rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-center">
                  <BorderBeam size={50} duration={6} colorFrom="#34d399" colorTo="#0f766e" />
                  <p className="text-sm font-semibold text-primary">Zivvy</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  vs
                </span>
                <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">{entry.comparedAgainst}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={entry.ctaHref}>
                    {entry.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-6">
          <BlurFade>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60">
              <BorderBeam
                size={100}
                duration={10}
                colorFrom="#34d399"
                colorTo="#0f766e"
                borderWidth={1.5}
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b border-border/60 bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Capability</th>
                      <th className="px-4 py-3 text-left font-medium text-primary">Zivvy</th>
                      <th className="px-4 py-3 text-left font-medium">{entry.comparedAgainst}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.rows.map((row, idx) => (
                      <tr
                        key={row.capability}
                        className={cn(
                          "border-b border-border/50 last:border-b-0",
                          idx % 2 === 1 ? "bg-muted/15" : undefined
                        )}
                      >
                        <td className="px-4 py-3 align-top font-medium">{row.capability}</td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          <span className="inline-flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            {row.zivvy}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">{row.other}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="h-full rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <h2 className="font-display text-xl font-semibold">Best-fit scenarios</h2>
              <div className="mt-4 space-y-3">
                {entry.bestFit.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </MagicCard>
          </BlurFade>
          <BlurFade delay={0.06}>
            <MagicCard
              className="h-full rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#64748b"
              gradientTo="#334155"
              gradientColor="rgba(100, 116, 139, 0.08)"
            >
              <h2 className="font-display text-xl font-semibold">Known limitations</h2>
              <div className="mt-4 space-y-3">
                {entry.limitations.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </MagicCard>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-20 pt-2 text-center">
          <BlurFade>
            <div className="relative mb-6 overflow-hidden rounded-xl border border-border/70 bg-card/60 px-4 py-4 text-sm text-muted-foreground">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={18} />
              <span className="font-medium text-foreground">How to read this:</span> choose Zivvy if
              execution speed, workflow clarity, and integrated operations matter most in your next
              6–12 months.
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Want a migration recommendation for your setup?
            </h2>
            <p className="mt-3 text-muted-foreground">
              We can map your current process and suggest a low-risk transition path.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href="/contact">Talk migration plan</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={entry.ctaHref}>{entry.ctaLabel}</Link>
              </Button>
            </div>
          </BlurFade>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
