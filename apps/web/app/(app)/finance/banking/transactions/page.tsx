import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    sort?: string;
    order?: "asc" | "desc";
  }>;
}

export default async function BankTransactionsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const filters: Array<[string, string, string, string | number | boolean]> = [];
  if (params.bank_account) filters.push(["Bank Transaction", "bank_account", "=", params.bank_account]);
  if (params.status) filters.push(["Bank Transaction", "status", "=", params.status]);
  if (params.from_date) filters.push(["Bank Transaction", "date", ">=", params.from_date]);
  if (params.to_date) filters.push(["Bank Transaction", "date", "<=", params.to_date]);

  const sortField = params.sort || "date";
  const sortOrder = params.order || "desc";

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
    order_by: `\`tabBank Transaction\`.\`${sortField}\` ${sortOrder}`,
    page_length: 50,
  });

  const rows = (res?.values ?? []) as Transaction[];

  function sortHref(field: string): string {
    const next = params.sort === field && params.order === "asc" ? "desc" : "asc";
    const usp = new URLSearchParams();
    if (params.bank_account) usp.set("bank_account", params.bank_account);
    if (params.status) usp.set("status", params.status);
    if (params.from_date) usp.set("from_date", params.from_date);
    if (params.to_date) usp.set("to_date", params.to_date);
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

      <Card className="p-0">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="mt-1">{rows.length} shown</CardDescription>
        </CardHeader>
        {rows.length === 0 ? (
          <div className="px-6 pb-12 text-center text-sm text-muted-foreground">
            No transactions match these filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-medium">
                  <Link href={sortHref("date")} className="hover:text-foreground">
                    Date{sortIndicator("date")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Bank account</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Reference</TableHead>
                <TableHead className="text-right font-medium">Amount</TableHead>
                <TableHead className="font-medium">Currency</TableHead>
                <TableHead className="text-right font-medium">Unallocated</TableHead>
                <TableHead className="font-medium">
                  <Link href={sortHref("status")} className="hover:text-foreground">
                    Status{sortIndicator("status")}
                  </Link>
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const isDeposit = r.deposit && r.deposit > 0;
                const amount = isDeposit ? r.deposit ?? 0 : -(r.withdrawal ?? 0);
                return (
                  <TableRow key={r.name} className="group border-b hover:bg-muted/40">
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(r.date)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.bank_account ? (
                        <Link
                          href={`/finance/banking/accounts/${encodeURIComponent(r.bank_account)}`}
                          className="hover:underline"
                        >
                          {r.bank_account}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="truncate" title={r.description}>
                        {r.description || r.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.name}
                    </TableCell>
                    <TableCell
                      className={
                        "text-right tabular-nums " +
                        (isDeposit
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400")
                      }
                    >
                      {amount === 0
                        ? "—"
                        : `${isDeposit ? "+" : "−"}${formatMoney(Math.abs(amount), r.currency || "USD")}`}
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
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/banking/reconciliation?bank_account=${encodeURIComponent(r.bank_account ?? "")}`}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Reconcile"
                      >
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
