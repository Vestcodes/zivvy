import type { Metadata } from "next";
import { AddonsHub } from "@/components/site/marketing/addons-hub";
import { addonDetails } from "@/lib/addons-content";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Add-ons",
  description:
    "Optional Zivvy modules for commerce sync, German DATEV filing, in-ERP contract signing, and batch payments.",
  canonicalPath: "/addons"
});

export default function AddonsHubPage() {
  return <AddonsHub addons={addonDetails} />;
}
