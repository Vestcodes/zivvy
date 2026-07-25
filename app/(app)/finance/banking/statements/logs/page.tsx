import type { Metadata } from "next";
import Link from "next/link";
import { Upload } from "lucide-react";
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
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Statement imports — Zivvy" };

interface ImportRow extends ListRow {
  bank_account?: string;
  status?: string;
  creation?: string;
  no_of_records?: number;
  bank?: string;
}

export default async function StatementLogsPage() {
  const res = await reportviewGet({
    doctype: "Bank Statement Import",
    fields: ["name", "bank_account", "status", "creation", "no_of_records", "bank"],
    order_by: "creation desc",
    page_length: 50,
  });

  const rows = (res?.values ?? []) as ImportRow[];

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

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription className="mt-1">{rows.length} record{rows.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No imports yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bank account</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-mono text-xs">{r.name}</TableCell>
                    <TableCell>{r.bank_account || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.bank || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.no_of_records ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(r.creation)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "Success"
                            ? "default"
                            : r.status === "Error" || r.status === "Failed"
                            ? "destructive"
                            : r.status === "Partial Success"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {r.status || "Pending"}
                      </Badge>
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
