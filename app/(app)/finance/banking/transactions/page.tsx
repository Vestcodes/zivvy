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
import { TransactionsFilterBar } from "@/components/banking/transactions-filter-bar";

export const metadata: Metadata = { title: "Bank transactions — Zivvy" };

interface Transaction extends ListRow {
  date?: string;
  description?: string;
  deposit?: number;
  withdrawal?: number;
  currency?: string;
  unallocated_amount?: number;
  status?: string;
  bank_account?: string;
}

interface Props {
  searchParams?: Promise<{
    bank_account?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }>;
}

export default async function BankTransactionsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const filters: Array<[string, string, string, string | number | boolean]> = [];
  if (params.bank_account) filters.push(["Bank Transaction", "bank_account", "=", params.bank_account]);
  if (params.status) filters.push(["Bank Transaction", "status", "=", params.status]);
  if (params.from_date) filters.push(["Bank Transaction", "date", ">=", params.from_date]);
  if (params.to_date) filters.push(["Bank Transaction", "date", "<=", params.to_date]);

  const res = await reportviewGet({
    doctype: "Bank Transaction",
    fields: [
      "name",
      "date",
      "description",
      "deposit",
      "withdrawal",
      "currency",
      "unallocated_amount",
      "status",
      "bank_account",
    ],
    filters,
    order_by: "date desc",
    page_length: 50,
  });

  const rows = (res?.values ?? []) as Transaction[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Bank transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All bank transactions across accounts.
        </p>
      </header>

      <TransactionsFilterBar
        initialBankAccount={params.bank_account}
        initialStatus={params.status}
        initialFromDate={params.from_date}
        initialToDate={params.to_date}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="mt-1">{rows.length} shown</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No transactions match these filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Deposit</TableHead>
                  <TableHead className="text-right">Withdrawal</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Unallocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(r.date)}
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="truncate" title={r.description}>
                        {r.description || r.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.deposit && r.deposit > 0 ? formatMoney(r.deposit, r.currency || "USD") : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.withdrawal && r.withdrawal > 0 ? formatMoney(r.withdrawal, r.currency || "USD") : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {r.currency || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.unallocated_amount !== undefined && r.unallocated_amount !== null
                        ? formatMoney(r.unallocated_amount, r.currency || "USD")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "Reconciled"
                            ? "default"
                            : r.status === "Unreconciled"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {r.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/banking/reconciliation?bank_account=${encodeURIComponent(r.bank_account ?? "")}`}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Reconcile"
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
