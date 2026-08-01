import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentRequestDetail } from "@/components/banking/payment-request-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${decodeURIComponent(id)} — Payment requests — Zivvy` };
}

export default async function PaymentRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/finance/payment-requests">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Link>
        </Button>
      </div>
      <PaymentRequestDetail name={name} />
    </div>
  );
}
