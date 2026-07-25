import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
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
import { reportviewGet, type ListRow } from "@/lib/frappe-meta";

export const metadata: Metadata = { title: "Bank accounts — Zivvy" };

interface BankAccount extends ListRow {
  account_name?: string;
  bank?: string;
  bank_account_no?: string;
  account_currency?: string;
  is_default?: 0 | 1;
  disabled?: 0 | 1;
}

function maskAccountNumber(no?: string): string {
  if (!no) return "—";
  if (no.length <= 4) return `••${no}`;
  return `${"•".repeat(Math.max(0, no.length - 4))}${no.slice(-4)}`;
}

export default async function BankAccountsPage() {
  const res = await reportviewGet({
    doctype: "Bank Account",
    fields: [
      "name",
      "account_name",
      "bank",
      "bank_account_no",
      "account_currency",
      "is_default",
      "disabled",
    ],
    order_by: "account_name asc",
    page_length: 100,
  });

  const rows = (res?.values ?? []) as BankAccount[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Bank accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All bank accounts linked to your companies.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/finance/banking/accounts/new">
            <Plus className="h-4 w-4 mr-1.5" /> New
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription className="mt-1">{rows.length} account{rows.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No bank accounts yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account number</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/finance/banking/accounts/${encodeURIComponent(row.name)}`}
                        className="hover:underline"
                      >
                        {row.account_name || row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.bank || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {maskAccountNumber(row.bank_account_no)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.account_currency || "—"}</TableCell>
                    <TableCell>
                      {row.is_default ? (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/banking/accounts/${encodeURIComponent(row.name)}`}
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
