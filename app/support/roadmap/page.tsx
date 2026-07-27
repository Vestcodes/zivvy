import { RoadmapPageContent } from "@/components/site/marketing/support-subpages";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Roadmap",
  description: "See what Zivvy is building now, next, and later across product and platform capabilities.",
  canonicalPath: "/support/roadmap",
});

export default function RoadmapPage() {
  return <RoadmapPageContent />;
}
