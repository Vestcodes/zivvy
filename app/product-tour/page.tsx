import type { Metadata } from "next";
import { ProductTourPageContent } from "@/components/site/product-tour-page";
import { JsonLd } from "@/components/site/marketing/seo-scripts";
import {
  arcadeTours,
  heroArcadeTour,
  moduleArcadeTours
} from "@/lib/arcade-tours";
import {
  breadcrumbJsonLd,
  makeMetadata,
  tourItemListJsonLd,
  videoJsonLd
} from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Product Tour",
  description:
    "Watch Zivvy’s Business-tier product tour — full CRM-to-manufacturing walkthrough plus module tours for sales, stock, accounting, HR, banking, and integrations.",
  canonicalPath: "/product-tour"
});

function ProductTourJsonLd() {
  const heroContent =
    heroArcadeTour.arcadeEmbedUrl ||
    heroArcadeTour.arcadeViewUrl ||
    "/videos/zivvy-product-tour.mp4";

  const schemas: Array<Record<string, unknown>> = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Product tour", url: "/product-tour" }
    ]),
    videoJsonLd({
      name: heroArcadeTour.title,
      description: heroArcadeTour.description,
      contentUrl: heroContent,
      thumbnailUrl: heroArcadeTour.thumbnailSrc,
      duration: "PT2M"
    }),
    tourItemListJsonLd(
      arcadeTours.map((tour, i) => ({
        name: tour.title,
        url: `/product-tour#${tour.anchor}`,
        position: i + 1
      }))
    ),
    ...moduleArcadeTours
      .filter((t) => t.arcadeEmbedUrl || t.arcadeViewUrl)
      .map((tour) =>
        videoJsonLd({
          name: `${tour.title} — Zivvy`,
          description: tour.description,
          contentUrl: (tour.arcadeEmbedUrl || tour.arcadeViewUrl) as string,
          thumbnailUrl: tour.thumbnailSrc,
          duration: "PT1M"
        })
      )
  ];

  return <JsonLd data={schemas} />;
}

export default function ProductTourPage() {
  return (
    <>
      <ProductTourJsonLd />
      <ProductTourPageContent />
    </>
  );
}
