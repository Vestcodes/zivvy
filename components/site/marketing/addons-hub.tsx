"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BrandLogo } from "@/components/site/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BackgroundBeams,
  CardBody,
  CardContainer,
  CardItem,
  HoverBorderGradient,
  MovingBorderButton,
  TextGenerateEffect
} from "@/components/ui/aceternity";
import type { AddonDetail } from "@/lib/addons-content";

/**
 * Hub grid for /addons. Cards link to /addons/[slug]. Now a client
 * component because it composes several motion-based Aceternity
 * primitives (BackgroundBeams, CardContainer, HoverBorderGradient,
 * MovingBorderButton). Data still comes from the RSC parent.
 */

interface AddonsHubProps {
  addons: AddonDetail[];
}

const DASHBOARD_URL = "https://zivvy.xyz/settings/addons";

/**
 * Which brand marks to show on each addon card. Keyed by addon slug so
 * new addons can be wired up here without touching the card JSX.
 */
const ADDON_BRAND_SLUGS: Record<string, string[]> = {
  "ecommerce-integrations": ["shopify", "amazon", "unicommerce"],
  "erpnext-datev": ["datev"],
  "digital-signer": ["digital-signer"],
  "payments-processor": ["payments-processor"]
};

export function AddonsHub({ addons }: AddonsHubProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <BackgroundBeams className="opacity-70 [mask-image:radial-gradient(60%_60%_at_50%_20%,white_0%,transparent_100%)]" />
          <div className="relative mx-auto max-w-4xl px-6 pb-6 pt-20 text-center sm:pt-24">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Add-ons · billed monthly
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Add-ons that pay for themselves
            </h1>
            <div className="mx-auto mt-4 max-w-2xl">
              <TextGenerateEffect
                words="Optional modules for teams that need commerce sync, German tax filing, in-ERP signing, or batch payouts. Turn them on per workspace — off just as easily."
                className="[&_div>div]:text-base [&_div>div]:font-normal [&_span]:text-muted-foreground sm:[&_div>div]:text-lg"
              />
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MovingBorderButton
                as="a"
                href={DASHBOARD_URL}
                target="_blank"
                rel="noreferrer"
                borderRadius="9999px"
                containerClassName="h-12 w-auto !md:col-span-1"
                className="border-primary/40 bg-primary/90 px-6 text-sm font-semibold text-primary-foreground dark:bg-primary/90"
                borderClassName="bg-[radial-gradient(theme(colors.emerald.400)_40%,transparent_60%)]"
                duration={3500}
              >
                <span className="inline-flex items-center gap-2">
                  Start subscribing
                  <ArrowRight className="size-4" />
                </span>
              </MovingBorderButton>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <Link href="/pricing">See core pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {addons.map((addon) => (
              <HoverBorderGradient
                key={addon.slug}
                as="div"
                containerClassName="!w-full !rounded-3xl !bg-border/40 dark:!bg-white/10 hover:!bg-border/50"
                className="!w-full !rounded-[calc(1.5rem-2px)] !bg-transparent !p-0 !text-foreground"
                innerBackdropClassName="!bg-card/80 !rounded-[calc(1.5rem-2px)] !inset-[1px]"
                duration={2.5}
              >
                <CardContainer
                  containerClassName="py-0 flex w-full"
                  className="w-full"
                >
                  <CardBody className="group/card relative h-auto w-full rounded-3xl border-none bg-card/60 p-6 sm:p-7">
                    <CardItem
                      translateZ={20}
                      className="flex w-full items-start justify-between gap-3"
                    >
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-background/70 font-medium text-muted-foreground"
                      >
                        {addon.category}
                      </Badge>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
                          {addon.price}
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          per workspace
                        </div>
                      </div>
                    </CardItem>

                    <CardItem
                      as="h2"
                      translateZ={40}
                      className="mt-6 block w-full font-display text-2xl font-semibold tracking-tight text-foreground"
                    >
                      {addon.name}
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ={30}
                      className="mt-2 block w-full text-sm font-medium text-foreground/80"
                    >
                      {addon.hero}
                    </CardItem>
                    {addon.subtitle ? (
                      <CardItem
                        as="p"
                        translateZ={25}
                        className="mt-1 block w-full text-xs italic text-muted-foreground"
                      >
                        {addon.subtitle}
                      </CardItem>
                    ) : null}
                    <CardItem
                      as="p"
                      translateZ={20}
                      className="mt-3 block w-full text-sm leading-relaxed text-muted-foreground"
                    >
                      {addon.description}
                    </CardItem>

                    {ADDON_BRAND_SLUGS[addon.slug]?.length ? (
                      <CardItem
                        translateZ={35}
                        className="mt-4 flex w-full items-center gap-2"
                      >
                        {ADDON_BRAND_SLUGS[addon.slug]!.map((brandSlug) => (
                          <span
                            key={brandSlug}
                            className="flex size-8 items-center justify-center rounded-md border border-border/50 bg-background/60"
                          >
                            <BrandLogo
                              slug={brandSlug}
                              className="size-6 text-muted-foreground"
                            />
                          </span>
                        ))}
                      </CardItem>
                    ) : null}

                    <CardItem
                      translateZ={30}
                      className="mt-5 flex w-full flex-wrap gap-1.5"
                    >
                      {addon.benefits.slice(0, 3).map((benefit) => (
                        <span
                          key={benefit.title}
                          className="rounded-full border border-border/50 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {benefit.title}
                        </span>
                      ))}
                    </CardItem>

                    <CardItem
                      as={Link}
                      href={`/addons/${addon.slug}`}
                      translateZ={40}
                      className="mt-6 inline-flex w-full items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      Read the details
                      <ArrowRight className="size-4 transition-transform group-hover/card:translate-x-0.5" />
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </HoverBorderGradient>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-3 text-center">
            <MovingBorderButton
              as="a"
              href={DASHBOARD_URL}
              target="_blank"
              rel="noreferrer"
              borderRadius="9999px"
              containerClassName="h-12 w-auto !md:col-span-1"
              className="border-primary/40 bg-primary/90 px-6 text-sm font-semibold text-primary-foreground dark:bg-primary/90"
              borderClassName="bg-[radial-gradient(theme(colors.emerald.400)_40%,transparent_60%)]"
              duration={3500}
            >
              <span className="inline-flex items-center gap-2">
                Start subscribing
                <ArrowRight className="size-4" />
              </span>
            </MovingBorderButton>
            <p className="text-xs text-muted-foreground">
              Opens {DASHBOARD_URL.replace("https://", "")}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
