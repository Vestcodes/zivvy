import type { Metadata } from "next";
import { BankRulesPanel } from "@/components/banking/bank-rules-panel";

export const metadata: Metadata = { title: "Bank rules — Zivvy" };

export default function BankRulesPage() {
  return <BankRulesPanel />;
}
