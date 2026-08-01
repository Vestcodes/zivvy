import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankAccountDetail } from "@/components/banking/bank-account-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${decodeURIComponent(id)} — Bank accounts — Zivvy` };
}

export default async function BankAccountDetailPage({ params }: Props) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/finance/banking/accounts">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/finance/banking/reconciliation?bank_account=${encodeURIComponent(name)}`}>
            <ClipboardCheck className="h-4 w-4 mr-1.5" /> Reconcile
          </Link>
        </Button>
      </div>
      <BankAccountDetail bankAccount={name} />
    </div>
  );
}
