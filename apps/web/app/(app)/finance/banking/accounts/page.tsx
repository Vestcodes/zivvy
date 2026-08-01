import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AutoListNewButton } from "@/components/auto/auto-list-new-button";
import {
  getDoctypeMeta,
  groupFieldsForForm,
  reportviewGet,
  type ListRow,
} from "@/lib/frappe-meta";

export const metadata: Metadata = { title: "Bank accounts — Zivvy" };

interface BankAccount extends ListRow {
  account_name?: string;
  bank?: string;
  bank_account_no?: string;
  account_currency?: string;
  is_default?: 0 | 1;
  disabled?: 0 | 1;
}

interface Props {
  searchParams?: Promise<{ sort?: string; order?: "asc" | "desc"; new?: string }>;
}

function maskAccountNumber(no?: string): string {
  if (!no) return "—";
  if (no.length <= 4) return `••${no}`;
  return `${"•".repeat(Math.max(0, no.length - 4))}${no.slice(-4)}`;
}

function statusFor(row: BankAccount): { label: string; tone: "success" | "neutral" | "info" } {
  if (row.disabled) return { label: "Disabled", tone: "neutral" };
  if (row.is_default) return { label: "Default", tone: "info" };
  return { label: "Active", tone: "success" };
}

export default async function BankAccountsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const sortField = params.sort || "account_name";
  const sortOrder = params.order || "asc";

  const [res, meta] = await Promise.all([
    reportviewGet({
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
      order_by: `\`tabBank Account\`.\`${sortField}\` ${sortOrder}`,
      page_length: 100,
    }),
    getDoctypeMeta("Bank Account"),
  ]);

  const rows = (res?.values ?? []) as BankAccount[];
  const newGroups = meta ? groupFieldsForForm(meta, { isNew: true }) : [];

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
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Bank accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All bank accounts linked to your companies.
          </p>
        </div>
        {meta ? (
          <AutoListNewButton
            meta={meta}
            groups={newGroups}
            basePath="/finance/banking/accounts"
            title="Bank accounts"
            defaultOpen={params.new === "1"}
          />
        ) : null}
      </header>

      <Card className="p-0">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Accounts</CardTitle>
          <CardDescription className="mt-1">
            {rows.length} account{rows.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <Landmark className="size-5" />
            </div>
            <p className="mt-3 font-display text-lg">No bank accounts yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first bank account to start tracking transactions and running reconciliations.
            </p>
            <Button asChild variant="polished" className="mt-4">
              <Link href="/finance/banking/accounts?new=1">Add bank account</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-medium">
                  <Link href={sortHref("account_name")} className="hover:text-foreground">
                    Account name{sortIndicator("account_name")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">
                  <Link href={sortHref("bank")} className="hover:text-foreground">
                    Bank{sortIndicator("bank")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Account number</TableHead>
                <TableHead className="text-right font-medium">Currency</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const status = statusFor(row);
                return (
                  <TableRow key={row.name} className="group border-b hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <Link
                        href={`/finance/banking/accounts/${encodeURIComponent(row.name)}`}
                        className="hover:underline"
                      >
                        {row.account_name || row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.bank || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {maskAccountNumber(row.bank_account_no)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {row.account_currency || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status.label} tone={status.tone} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/finance/banking/accounts/${encodeURIComponent(row.name)}`}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Open"
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
