"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeftRight, FileText, ListChecks, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatMoney } from "@/lib/format";

interface Props {
  bankAccount: string;
}

interface Transaction {
  name: string;
  date?: string;
  description?: string;
  deposit?: number;
  withdrawal?: number;
  currency?: string;
  status?: string;
  unallocated_amount?: number;
}

interface Statement {
  name: string;
  status?: string;
  creation?: string;
  no_of_records?: number;
}

interface Rule {
  name: string;
  rule_name?: string;
  priority?: number;
  transaction_type?: string;
  disabled?: 0 | 1;
}

export function BankAccountDetail({ bankAccount }: Props) {
  const [tab, setTab] = useState("transactions");

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{bankAccount}</h1>
        <p className="text-sm text-muted-foreground mt-1">Bank Account</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="statements" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Statements
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" /> Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionsTab bankAccount={bankAccount} />
        </TabsContent>
        <TabsContent value="statements">
          <StatementsTab bankAccount={bankAccount} />
        </TabsContent>
        <TabsContent value="rules">
          <RulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionsTab({ bankAccount }: { bankAccount: string }) {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      const data = await frappeCall<Transaction[]>("frappe.client.get_list", {
        doctype: "Bank Transaction",
        fields: JSON.stringify([
          "name",
          "date",
          "description",
          "deposit",
          "withdrawal",
          "currency",
          "status",
          "unallocated_amount",
        ]),
        filters: JSON.stringify([["bank_account", "=", bankAccount]]),
        order_by: "date desc",
        limit_page_length: 25,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [bankAccount]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns: Array<DataListColumn<Transaction>> = [
    {
      key: "date",
      header: "Date",
      sortKey: "date",
      cell: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(r.date)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (r) => (
        <div className="min-w-0 max-w-[320px]">
          <div className="truncate text-sm font-medium" title={r.description}>
            {r.description || r.name}
          </div>
          {!r.description ? (
            <div className="truncate font-mono text-xs text-muted-foreground">
              {r.name}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "deposit",
      header: "Deposit",
      align: "right",
      cell: (r) =>
        r.deposit && r.deposit > 0 ? (
          <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(r.deposit, r.currency || "USD")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "withdrawal",
      header: "Withdrawal",
      align: "right",
      cell: (r) =>
        r.withdrawal && r.withdrawal > 0 ? (
          <span className="tabular-nums text-red-600 dark:text-red-400">
            {formatMoney(r.withdrawal, r.currency || "USD")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "unallocated",
      header: "Unallocated",
      align: "right",
      cell: (r) =>
        r.unallocated_amount !== undefined && r.unallocated_amount !== null ? (
          <span className="tabular-nums text-xs text-muted-foreground">
            {formatMoney(r.unallocated_amount, r.currency || "USD")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="mt-1">Latest 25</CardDescription>
        </div>
        <Link
          href={`/finance/banking/transactions?bank_account=${encodeURIComponent(bankAccount)}`}
          className="text-xs text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <DataList<Transaction>
          columns={columns}
          rows={rows}
          loading={loading}
          loadingRowCount={3}
          rowKey={(r) => r.name}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          }
          rowActions={(r) => (
            <Button asChild variant="ghost" size="icon-sm" title="Reconcile">
              <Link
                href={`/finance/banking/reconciliation?bank_account=${encodeURIComponent(bankAccount)}&tx=${encodeURIComponent(r.name)}`}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        />
      </CardContent>
    </Card>
  );
}

function StatementsTab({ bankAccount }: { bankAccount: string }) {
  const [rows, setRows] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      const data = await frappeCall<Statement[]>("frappe.client.get_list", {
        doctype: "Bank Statement Import",
        fields: JSON.stringify(["name", "status", "creation", "no_of_records"]),
        filters: JSON.stringify([["bank_account", "=", bankAccount]]),
        order_by: "creation desc",
        limit_page_length: 25,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load statements");
    } finally {
      setLoading(false);
    }
  }, [bankAccount]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns: Array<DataListColumn<Statement>> = [
    {
      key: "name",
      header: "Import ID",
      sortKey: "name",
      cell: (r) => (
        <Link
          href={`/finance/banking/statements/logs/${encodeURIComponent(r.name)}`}
          className="font-mono text-xs hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "records",
      header: "Records",
      align: "right",
      cell: (r) => (
        <span className="tabular-nums text-sm">{r.no_of_records ?? "—"}</span>
      ),
    },
    {
      key: "creation",
      header: "Created",
      align: "right",
      sortKey: "creation",
      cell: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(r.creation)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      cell: (r) => <StatusBadge status={r.status || "Pending"} />,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Statements</CardTitle>
          <CardDescription className="mt-1">Recent imports for this account</CardDescription>
        </div>
        <Link href="/finance/banking/statements/import" className="text-xs text-primary hover:underline">
          Import statement
        </Link>
      </CardHeader>
      <CardContent>
        <DataList<Statement>
          columns={columns}
          rows={rows}
          loading={loading}
          loadingRowCount={2}
          rowKey={(r) => r.name}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No statement imports for this account yet.
            </div>
          }
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/finance/banking/statements/logs/${encodeURIComponent(r.name)}`}>
                    View log
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </CardContent>
    </Card>
  );
}

function RulesTab() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      const data = await frappeCall<Rule[]>("frappe.client.get_list", {
        doctype: "Bank Transaction Rule",
        fields: JSON.stringify(["name", "rule_name", "priority", "transaction_type", "disabled"]),
        order_by: "priority asc",
        limit_page_length: 25,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns: Array<DataListColumn<Rule>> = [
    {
      key: "priority",
      header: "Priority",
      align: "right",
      sortKey: "priority",
      cell: (r) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {r.priority ?? "—"}
        </span>
      ),
    },
    {
      key: "rule_name",
      header: "Rule name",
      sortKey: "rule_name",
      cell: (r) => (
        <span className="font-medium">{r.rule_name || r.name}</span>
      ),
    },
    {
      key: "transaction_type",
      header: "Match type",
      cell: (r) =>
        r.transaction_type ? (
          <Badge variant="secondary" className="text-xs">
            {r.transaction_type}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">any</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "disabled",
      cell: (r) => (
        <StatusBadge
          status={r.disabled ? "Disabled" : "Active"}
          tone={r.disabled ? "neutral" : "success"}
        />
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Rules</CardTitle>
          <CardDescription className="mt-1">Automatic classification rules</CardDescription>
        </div>
        <Link href="/finance/banking/rules" className="text-xs text-primary hover:underline">
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        <DataList<Rule>
          columns={columns}
          rows={rows}
          loading={loading}
          loadingRowCount={2}
          rowKey={(r) => r.name}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No rules defined.
            </div>
          }
          rowActions={(r) => (
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={`/finance/banking/rules?edit=${encodeURIComponent(r.name)}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Link>
            </Button>
          )}
        />
      </CardContent>
    </Card>
  );
}
