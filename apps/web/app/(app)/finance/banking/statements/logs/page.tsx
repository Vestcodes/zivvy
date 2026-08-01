import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Upload } from "lucide-react";
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
import { reportviewGet, type ListRow } from "@/lib/frappe-meta";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Statement imports — Zivvy" };

interface ImportRow extends ListRow {
  bank_account?: string;
  status?: string;
  creation?: string;
  no_of_records?: number;
  bank?: string;
}

interface Props {
  searchParams?: Promise<{ sort?: string; order?: "asc" | "desc" }>;
}

export default async function StatementLogsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const sortField = params.sort || "creation";
  const sortOrder = params.order || "desc";

  const res = await reportviewGet({
    doctype: "Bank Statement Import",
    fields: ["name", "bank_account", "status", "creation", "no_of_records", "bank"],
    order_by: `\`tabBank Statement Import\`.\`${sortField}\` ${sortOrder}`,
    page_length: 50,
  });

  const rows = (res?.values ?? []) as ImportRow[];

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
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Statement imports</h1>
          <p className="text-sm text-muted-foreground mt-1">History of bank statement imports.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/finance/banking/statements/import">
            <Upload className="h-4 w-4 mr-1.5" /> New import
          </Link>
        </Button>
      </header>

      <Card className="p-0">
        <CardHeader className="p-6 pb-4">
          <CardTitle>History</CardTitle>
          <CardDescription className="mt-1">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <FileText className="size-5" />
            </div>
            <p className="mt-3 font-display text-lg">No statement imports yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload a bank statement to see the import history and results here.
            </p>
            <Button asChild variant="polished" className="mt-4">
              <Link href="/finance/banking/statements/import">
                <Upload className="h-4 w-4" />
                Upload statement
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-medium">
                  <Link href={sortHref("name")} className="hover:text-foreground">
                    Import ID{sortIndicator("name")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">Bank account</TableHead>
                <TableHead className="font-medium">Bank</TableHead>
                <TableHead className="text-right font-medium">Records</TableHead>
                <TableHead className="text-right font-medium">
                  <Link href={sortHref("creation")} className="hover:text-foreground">
                    Created{sortIndicator("creation")}
                  </Link>
                </TableHead>
                <TableHead className="font-medium">
                  <Link href={sortHref("status")} className="hover:text-foreground">
                    Status{sortIndicator("status")}
                  </Link>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/finance/banking/statements/logs/${encodeURIComponent(r.name)}`}
                      className="hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{r.bank_account || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {r.bank || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.no_of_records ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(r.creation)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status || "Pending"} />
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
