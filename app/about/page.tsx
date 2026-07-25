import { AboutPageContent } from "@/components/site/marketing/about-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "About",
  description:
    "Zivvy builds owner-first ERP software — tenant-isolated, integrable and honest about pricing. Learn our mission, story and operating principles.",
  canonicalPath: "/about"
});

export default function AboutPage() {
  return <AboutPageContent />;
}
