import type { Metadata } from "next";
import { ReconciliationWorkbench } from "@/components/banking/reconciliation-workbench";

export const metadata: Metadata = { title: "Bank reconciliation — Zivvy" };

interface Props {
  searchParams?: Promise<{ bank_account?: string }>;
}

export default async function ReconciliationPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  return <ReconciliationWorkbench initialBankAccount={params.bank_account} />;
}
