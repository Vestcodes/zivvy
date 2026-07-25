"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Landmark, Link2, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BankAccount {
  name: string;
  account_name?: string;
  account_currency?: string;
}

interface BankTransaction {
  name: string;
  date?: string;
  description?: string;
  deposit?: number;
  withdrawal?: number;
  currency?: string;
  unallocated_amount?: number;
  reference_number?: string;
  party_type?: string;
  party?: string;
}

interface MatchCandidate {
  name: string;
  doctype: string;
  reference_no?: string;
  posting_date?: string;
  amount?: number;
  party?: string;
  paid_amount?: number;
  rank?: number;
}

interface Props {
  initialBankAccount?: string;
}

const today = new Date().toISOString().slice(0, 10);
const monthAgo = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
})();

export function ReconciliationWorkbench({ initialBankAccount }: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bankAccount, setBankAccount] = useState(initialBankAccount ?? "");
  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);

  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [selected, setSelected] = useState<BankTransaction | null>(null);

  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [busy, setBusy] = useState(false);

  // Load bank accounts once
  useEffect(() => {
    (async () => {
      try {
        const data = await frappeCall<BankAccount[]>("frappe.client.get_list", {
          doctype: "Bank Account",
          fields: JSON.stringify(["name", "account_name", "account_currency"]),
          filters: JSON.stringify([["disabled", "=", 0]]),
          order_by: "account_name asc",
          limit_page_length: 100,
        });
        setAccounts(Array.isArray(data) ? data : []);
        if (!initialBankAccount && Array.isArray(data) && data.length > 0) {
          setBankAccount(data[0].name);
        }
      } catch {
        toast.error("Failed to load bank accounts");
      }
    })();
  }, [initialBankAccount]);

  const fetchTransactions = useCallback(async () => {
    if (!bankAccount) return;
    setLoadingTx(true);
    setSelected(null);
    setCandidates([]);
    try {
      const data = await frappeCall<BankTransaction[]>(
        "erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.get_bank_transactions",
        { bank_account: bankAccount, from_date: fromDate, to_date: toDate }
      );
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, [bankAccount, fromDate, toDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchCandidates = useCallback(async (tx: BankTransaction) => {
    setLoadingCandidates(true);
    setCandidates([]);
    try {
      const data = await frappeCall<{ vouchers?: MatchCandidate[] } | MatchCandidate[]>(
        "erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.get_linked_payments",
        {
          bank_transaction_name: tx.name,
          document_types: JSON.stringify([
            "payment_entry",
            "journal_entry",
            "purchase_invoice",
            "sales_invoice",
            "expense_claim",
          ]),
          from_date: fromDate,
          to_date: toDate,
        }
      );
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as { vouchers?: MatchCandidate[] })?.vouchers)
        ? (data as { vouchers: MatchCandidate[] }).vouchers
        : [];
      setCandidates(list);
    } catch {
      // Skeleton: candidate loading is best-effort.
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (selected) fetchCandidates(selected);
  }, [selected, fetchCandidates]);

  const handleCreatePaymentEntry = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await frappeCall(
        "erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.create_payment_entry_bts",
        { bank_transaction_name: selected.name }
      );
      toast.success("Payment Entry created");
      fetchTransactions();
    } catch {
      toast.error("Failed to create Payment Entry");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateJournalEntry = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await frappeCall(
        "erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.create_journal_entry_bts",
        { bank_transaction_name: selected.name }
      );
      toast.success("Journal Entry created");
      fetchTransactions();
    } catch {
      toast.error("Failed to create Journal Entry");
    } finally {
      setBusy(false);
    }
  };

  const handleMatch = async (candidate: MatchCandidate) => {
    if (!selected) return;
    setBusy(true);
    try {
      await frappeCall(
        "erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.update_bank_transaction",
        {
          bank_transaction_name: selected.name,
          reference_number: candidate.reference_no ?? "",
          party_type: selected.party_type ?? "",
          party: selected.party ?? "",
        }
      );
      toast.success("Matched");
      fetchTransactions();
    } catch {
      toast.error("Failed to match");
    } finally {
      setBusy(false);
    }
  };

  const selectedCurrency = useMemo(() => {
    return selected?.currency ?? accounts.find((a) => a.name === bankAccount)?.account_currency ?? "USD";
  }, [selected, accounts, bankAccount]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Reconciliation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Match bank transactions to payments and invoices.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Bank account</Label>
              <Select value={bankAccount} onValueChange={setBankAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.account_name || a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From date</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To date</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={fetchTransactions} disabled={!bankAccount || loadingTx} className="w-full">
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loadingTx && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Unreconciled transactions</CardTitle>
            <CardDescription className="mt-1">
              {transactions.length} in range · click one to see matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTx ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !bankAccount ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Landmark className="h-6 w-6 mx-auto mb-2" />
                Select a bank account to begin.
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No unreconciled transactions in this date range.
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const isSelected = selected?.name === tx.name;
                  return (
                    <button
                      key={tx.name}
                      onClick={() => setSelected(tx)}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50",
                        isSelected && "border-primary bg-muted/60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {tx.description || tx.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(tx.date)}
                            {tx.reference_number ? ` · ${tx.reference_number}` : ""}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {tx.deposit && tx.deposit > 0 ? (
                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                              +{formatMoney(tx.deposit, tx.currency || "USD")}
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                              −{formatMoney(tx.withdrawal ?? 0, tx.currency || "USD")}
                            </div>
                          )}
                          {tx.unallocated_amount !== undefined ? (
                            <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                              Unalloc: {formatMoney(tx.unallocated_amount, tx.currency || "USD")}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: candidates */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Match candidates</CardTitle>
            <CardDescription className="mt-1">
              {selected ? `For "${selected.description || selected.name}"` : "Select a transaction on the left"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No transaction selected.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleCreatePaymentEntry} disabled={busy}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Payment Entry
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCreateJournalEntry} disabled={busy}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Journal Entry
                  </Button>
                </div>

                {loadingCandidates ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No match candidates found. Use the actions above to create a new entry.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {candidates.map((c, idx) => (
                      <div
                        key={`${c.doctype}-${c.name}-${idx}`}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <Badge variant="outline" className="mr-1 text-xs">{c.doctype}</Badge>
                            {c.posting_date ? formatDate(c.posting_date) : "—"}
                            {c.party ? ` · ${c.party}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {c.amount !== undefined ? (
                            <div className="text-sm font-medium tabular-nums">
                              {formatMoney(c.amount, selectedCurrency)}
                            </div>
                          ) : c.paid_amount !== undefined ? (
                            <div className="text-sm font-medium tabular-nums">
                              {formatMoney(c.paid_amount, selectedCurrency)}
                            </div>
                          ) : null}
                          <Button size="sm" variant="ghost" onClick={() => handleMatch(c)} disabled={busy}>
                            <Link2 className="h-3.5 w-3.5 mr-1.5" /> Match
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
