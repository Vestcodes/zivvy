"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeftRight, FileText, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

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
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate">{r.description || r.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(r.date)}</div>
                </div>
                <div className="text-right">
                  {r.deposit && r.deposit > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatMoney(r.deposit, r.currency || "USD")}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 tabular-nums">
                      −{formatMoney(r.withdrawal ?? 0, r.currency || "USD")}
                    </span>
                  )}
                  {r.status ? (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">{r.status}</Badge>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

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
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No statement imports for this account yet.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(r.creation)}</div>
                </div>
                <Badge
                  variant={r.status === "Success" ? "default" : r.status === "Error" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {r.status || "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        )}
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

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
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No rules defined.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{r.rule_name || r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Priority {r.priority ?? "—"} · {r.transaction_type || "any"}
                  </div>
                </div>
                <Badge variant={r.disabled ? "secondary" : "default"} className="text-xs">
                  {r.disabled ? "Disabled" : "Active"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
