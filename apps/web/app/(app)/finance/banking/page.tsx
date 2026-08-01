import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Landmark, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import { frappeGetCount, reportviewGet, type ListRow } from "@/lib/frappe-meta";

export const metadata: Metadata = { title: "Banking — Zivvy" };

interface BankAccount extends ListRow {
  account_name?: string;
  bank?: string;
  account?: string;
  account_currency?: string;
  is_default?: 0 | 1;
  disabled?: 0 | 1;
}

interface RecentImport extends ListRow {
  bank_account?: string;
  status?: string;
  creation?: string;
  no_of_records?: number;
}

export default async function BankingDashboardPage() {
  const [accountsRes, unreconciledCount, importsRes] = await Promise.all([
    reportviewGet({
      doctype: "Bank Account",
      fields: ["name", "account_name", "bank", "account", "account_currency", "is_default", "disabled"],
      filters: [["Bank Account", "disabled", "=", 0]],
      order_by: "modified desc",
      page_length: 24,
    }),
    frappeGetCount("Bank Transaction", { status: "Unreconciled" }),
    reportviewGet({
      doctype: "Bank Statement Import",
      fields: ["name", "bank_account", "status", "creation", "no_of_records"],
      order_by: "creation desc",
      page_length: 5,
    }),
  ]);

  const accounts = (accountsRes?.values ?? []) as BankAccount[];
  const imports = (importsRes?.values ?? []) as RecentImport[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Banking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bank accounts, transactions, and reconciliation.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bank accounts</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{accounts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/finance/banking/accounts" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unreconciled</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{unreconciledCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/finance/banking/reconciliation" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Reconcile <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent imports</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{imports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/finance/banking/statements/logs" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View history <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quick actions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild size="sm" className="w-full justify-start">
              <Link href="/finance/banking/statements/import">
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload statement
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full justify-start">
              <Link href="/finance/banking/reconciliation">
                <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" /> Start reconciliation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Your bank accounts</CardTitle>
            <CardDescription className="mt-1">Click a card to open its detail.</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/finance/banking/accounts">Manage</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="py-12 text-center">
              <Landmark className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No bank accounts yet. Add one to start tracking transactions.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/finance/banking/accounts">Add bank account</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((acc) => (
                <Link
                  key={acc.name}
                  href={`/finance/banking/accounts/${encodeURIComponent(acc.name)}`}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {acc.account_name || acc.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {acc.bank || "—"}
                      </div>
                    </div>
                    {acc.is_default ? (
                      <Badge variant="default" className="text-xs shrink-0">Default</Badge>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{acc.account_currency || "—"}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Recent statement imports</CardTitle>
          <CardDescription className="mt-1">Latest 5 bank statement imports.</CardDescription>
        </CardHeader>
        {imports.length === 0 ? (
          <div className="pb-8 text-center text-sm text-muted-foreground">
            No statement imports yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-medium">Import ID</TableHead>
                <TableHead className="font-medium">Bank account</TableHead>
                <TableHead className="text-right font-medium">Records</TableHead>
                <TableHead className="text-right font-medium">Created</TableHead>
                <TableHead className="font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((imp) => (
                <TableRow key={imp.name} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/finance/banking/statements/logs/${encodeURIComponent(imp.name)}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {imp.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{imp.bank_account || "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {imp.no_of_records ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(imp.creation)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={imp.status || "Pending"} />
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

