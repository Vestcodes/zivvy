import type { Metadata } from "next";
import { AddonsHub } from "@/components/site/marketing/addons-hub";
import { addonDetails } from "@/lib/addons-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Add-ons for DATEV, Payments, Signing and More",
  description:
    "Extend Zivvy with add-ons for DATEV export, payment processing, digital signing, e-invoicing and more. Install from the marketplace in one click.",
  canonicalPath: "/addons"
});

export default function AddonsHubPage() {
  return <AddonsHub addons={addonDetails} />;
}
