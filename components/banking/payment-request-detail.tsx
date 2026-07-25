"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatMoney } from "@/lib/format";

interface PaymentRequest {
  name: string;
  status?: string;
  party_type?: string;
  party?: string;
  reference_doctype?: string;
  reference_name?: string;
  grand_total?: number;
  currency?: string;
  transaction_date?: string;
  payment_url?: string;
  email_to?: string;
  subject?: string;
  message?: string;
  mode_of_payment?: string;
}

export function PaymentRequestDetail({ name }: { name: string }) {
  const [doc, setDoc] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchDoc = useCallback(async () => {
    try {
      const data = await frappeCall<PaymentRequest>("frappe.client.get", {
        doctype: "Payment Request",
        name,
      });
      setDoc(data ?? null);
    } catch {
      toast.error("Failed to load payment request");
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const copyLink = () => {
    if (!doc?.payment_url) return;
    navigator.clipboard.writeText(doc.payment_url);
    toast.success("Link copied");
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      await frappeCall("erpnext.accounts.doctype.payment_request.payment_request.resend_payment_email", {
        docname: name,
      });
      toast.success("Payment email sent");
    } catch {
      toast.error("Failed to resend email");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!doc) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Payment request not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{doc.name}</h1>
          <Badge
            variant={
              doc.status === "Paid"
                ? "default"
                : doc.status === "Requested" || doc.status === "Initiated"
                ? "secondary"
                : doc.status === "Cancelled" || doc.status === "Failed"
                ? "destructive"
                : "outline"
            }
          >
            {doc.status || "—"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Payment Request</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Party</CardDescription>
            <CardTitle className="text-lg">{doc.party || "—"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {doc.party_type || "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount</CardDescription>
            <CardTitle className="text-lg tabular-nums">
              {doc.grand_total !== undefined ? formatMoney(doc.grand_total, doc.currency || "USD") : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {formatDate(doc.transaction_date)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Reference doctype" value={doc.reference_doctype} />
          <Row label="Reference name" value={doc.reference_name} />
          <Row label="Mode of payment" value={doc.mode_of_payment} />
          <Row label="Email to" value={doc.email_to} />
          <Row label="Subject" value={doc.subject} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Payment link</CardTitle>
            <CardDescription className="mt-1">Share this URL with the payer.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyLink} disabled={!doc.payment_url}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
            </Button>
            <Button size="sm" onClick={handleResend} disabled={busy}>
              <Send className="h-3.5 w-3.5 mr-1.5" /> Resend
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {doc.payment_url ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-xs font-mono break-all">
                {doc.payment_url}
              </code>
              <a
                href={doc.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Open link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No payment URL yet. The link is generated once the request is submitted with a valid payment gateway.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
