import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reportviewGet, type ListRow } from "@/lib/frappe-meta";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Payment requests — Zivvy" };

interface PaymentRequest extends ListRow {
  status?: string;
  party_type?: string;
  party?: string;
  reference_doctype?: string;
  reference_name?: string;
  grand_total?: number;
  currency?: string;
  transaction_date?: string;
}

export default async function PaymentRequestsPage() {
  const res = await reportviewGet({
    doctype: "Payment Request",
    fields: [
      "name",
      "status",
      "party_type",
      "party",
      "reference_doctype",
      "reference_name",
      "grand_total",
      "currency",
      "transaction_date",
    ],
    order_by: "creation desc",
    page_length: 50,
  });

  const rows = (res?.values ?? []) as PaymentRequest[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Payment requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Payment links sent to customers and suppliers.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription className="mt-1">{rows.length} shown</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No payment requests yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/finance/payment-requests/${encodeURIComponent(r.name)}`}
                        className="hover:underline"
                      >
                        {r.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{r.party || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.party_type || "—"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {r.reference_name || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.grand_total !== undefined ? formatMoney(r.grand_total, r.currency || "USD") : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(r.transaction_date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "Paid"
                            ? "default"
                            : r.status === "Requested" || r.status === "Initiated"
                            ? "secondary"
                            : r.status === "Cancelled" || r.status === "Failed"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {r.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/payment-requests/${encodeURIComponent(r.name)}`}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Open"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
