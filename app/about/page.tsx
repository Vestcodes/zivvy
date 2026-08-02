import { AboutPageContent } from "@/components/site/marketing/about-page";
import { BreadcrumbJsonLd } from "@/components/site/marketing/seo-scripts";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "About Zivvy, Cloud ERP for Growing Teams",
  description:
    "Zivvy builds owner-first ERP software — tenant-isolated, integrable and honest about pricing. Learn our mission, story and operating principles.",
  canonicalPath: "/about"
});

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "About", url: "/about" }
      ]} />
      <AboutPageContent />
    </>
  );
}
