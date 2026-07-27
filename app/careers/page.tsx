import { CareersPageContent } from "@/components/site/marketing/careers-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Careers",
  description: "Explore career opportunities at Zivvy and help build the future of operational software.",
  canonicalPath: "/careers",
});

export default function CareersPage() {
  return <CareersPageContent />;
}
