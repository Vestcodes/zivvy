import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BillingSuccess } from "@/components/billing/billing-success";

export const metadata: Metadata = {
  title: "Confirming your plan — Zivvy"
};

export default function BillingSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-24">
        <BillingSuccess />
      </main>
      <SiteFooter />
    </>
  );
}
