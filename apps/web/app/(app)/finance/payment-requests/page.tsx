import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
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

interface Props {
  searchParams?: Promise<{ sort?: string; order?: "asc" | "desc" }>;
}

export default async function PaymentRequestsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const sortField = params.sort || "creation";
  const sortOrder = params.order || "desc";

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
    order_by: `\`tabPayment Request\`.\`${sortField}\` ${sortOrder}`,
    page_length: 50,
  });

  const rows = (res?.values ?? []) as PaymentRequest[];

  function sortHref(field: string): string {
    const next = params.sort === field && params.order === "asc" ? "desc" : "asc";
    const usp = new URLSearchParams();
    usp.set("sort", field);
    usp.set("order", next);
    return `?${usp.toString()}`;
  }

  function sortIndicator(field: string): string {
    if (params.sort !== field) return "";
    return params.order === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Payment requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Payment links sent to customers and suppliers.
        </p>
      </header>

      <Card className="p-0">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Requests</CardTitle>
          <CardDescription className="mt-1">{rows.length} shown</CardDescription>
        </CardHeader>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <Receipt className="size-5" />
            </div>
            <p className="mt-3 font-display text-lg">No payment requests yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Payment requests you send to customers or suppliers will show up here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-medium">
                  <Link href={sortHref("name")} className="hover:text-foreground">
                    ID{sortIndicator("name")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Party type</TableHead>
                <TableHead className="font-medium">
                  <Link href={sortHref("party")} className="hover:text-foreground">
                    Party{sortIndicator("party")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Reference</TableHead>
                <TableHead className="text-right font-medium">
                  <Link href={sortHref("grand_total")} className="hover:text-foreground">
                    Amount{sortIndicator("grand_total")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Currency</TableHead>
                <TableHead className="text-right font-medium">
                  <Link href={sortHref("transaction_date")} className="hover:text-foreground">
                    Sent{sortIndicator("transaction_date")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">
                  <Link href={sortHref("status")} className="hover:text-foreground">
                    Status{sortIndicator("status")}
                  </Link>
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name} className="group border-b hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/finance/payment-requests/${encodeURIComponent(r.name)}`}
                      className="hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs uppercase tracking-wide text-muted-foreground">
                    {r.party_type || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{r.party || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.reference_doctype && r.reference_name ? (
                      <div className="min-w-0 max-w-[200px]">
                        <div className="truncate uppercase tracking-wide">
                          {r.reference_doctype}
                        </div>
                        <div className="truncate font-mono text-foreground">
                          {r.reference_name}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.grand_total !== undefined
                      ? formatMoney(r.grand_total, r.currency || "USD")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.currency || "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(r.transaction_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/finance/payment-requests/${encodeURIComponent(r.name)}`}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Open"
                    >
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
