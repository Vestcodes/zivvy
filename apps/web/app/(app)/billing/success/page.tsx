import type { Metadata } from "next";
import { BillingSuccess } from "@/components/billing/billing-success";

export const metadata: Metadata = {
  title: "Confirming your plan — Zivvy"
};

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-lg py-8">
      <BillingSuccess />
    </div>
  );
}
