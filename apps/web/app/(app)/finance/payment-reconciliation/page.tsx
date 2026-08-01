import type { Metadata } from "next";
import { PaymentReconciliationTool } from "@/components/banking/payment-reconciliation-tool";

export const metadata: Metadata = { title: "Payment reconciliation — Zivvy" };

export default function PaymentReconciliationPage() {
  return <PaymentReconciliationTool />;
}
