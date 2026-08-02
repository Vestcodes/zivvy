import { CareersPageContent } from "@/components/site/marketing/careers-page";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Careers at Zivvy, Join Our Growing Team",
  description: "Join the Zivvy team building modern cloud ERP for founder-led businesses. See open roles in engineering, design, sales and customer success across India and EU.",
  canonicalPath: "/careers",
});

export default function CareersPage() {
  return <CareersPageContent />;
}
