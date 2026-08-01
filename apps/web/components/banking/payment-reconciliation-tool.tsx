"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Play, Search } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Company {
  name: string;
}

interface UnreconciledEntry {
  reference_type: string;
  reference_name: string;
  invoice_number?: string;
  invoice_type?: string;
  invoice_date?: string;
  amount?: number;
  outstanding_amount?: number;
  currency?: string;
  posting_date?: string;
  allocated_amount?: number;
}

interface Allocation {
  invoice_key: string;
  payment_key: string;
  amount: number;
}

export function PaymentReconciliationTool() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState("");
  const [partyType, setPartyType] = useState("Customer");
  const [party, setParty] = useState("");
  const [receivableAccount, setReceivableAccount] = useState("");

  const [invoices, setInvoices] = useState<UnreconciledEntry[]>([]);
  const [payments, setPayments] = useState<UnreconciledEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [reconciliationDoc, setReconciliationDoc] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [invoiceSort, setInvoiceSort] = useState<{ key: "date" | "outstanding"; order: "asc" | "desc" }>(
    { key: "date", order: "desc" }
  );
  const [paymentSort, setPaymentSort] = useState<{ key: "date" | "amount"; order: "asc" | "desc" }>(
    { key: "date", order: "desc" }
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await frappeCall<Company[]>("frappe.client.get_list", {
          doctype: "Company",
          fields: JSON.stringify(["name"]),
          limit_page_length: 50,
        });
        setCompanies(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setCompany(data[0].name);
      } catch {
        toast.error("Failed to load companies");
      }
    })();
  }, []);

  const handleFetch = useCallback(async () => {
    if (!company || !party) {
      toast.error("Company and party are required");
      return;
    }
    setLoading(true);
    setInvoices([]);
    setPayments([]);
    setAllocations({});
    try {
      // Create a Payment Reconciliation controller doc that other endpoints can address.
      const created = await frappeCall<{ name: string }>("frappe.client.insert", {
        doc: JSON.stringify({
          doctype: "Payment Reconciliation",
          company,
          party_type: partyType,
          party,
          receivable_payable_account: receivableAccount || undefined,
        }),
      });
      const docName = created?.name;
      if (!docName) throw new Error("no name");
      setReconciliationDoc(docName);

      const data = await frappeCall<{
        invoices?: UnreconciledEntry[];
        payments?: UnreconciledEntry[];
      }>(
        "erpnext.accounts.doctype.payment_reconciliation.payment_reconciliation.get_unreconciled_entries",
        { docname: docName }
      );
      setInvoices(data?.invoices ?? []);
      setPayments(data?.payments ?? []);
    } catch {
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, [company, party, partyType, receivableAccount]);

  const invoiceKey = (e: UnreconciledEntry) => `${e.reference_type}::${e.reference_name}`;

  function ageDays(iso?: string): string {
    if (!iso) return "—";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "—";
    const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
    return `${days}d`;
  }

  const sortedInvoices = useMemo(() => {
    const arr = [...invoices];
    arr.sort((a, b) => {
      const dir = invoiceSort.order === "asc" ? 1 : -1;
      if (invoiceSort.key === "date") {
        const av = a.invoice_date || a.posting_date || "";
        const bv = b.invoice_date || b.posting_date || "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      }
      const av = a.outstanding_amount ?? a.amount ?? 0;
      const bv = b.outstanding_amount ?? b.amount ?? 0;
      return (av - bv) * dir;
    });
    return arr;
  }, [invoices, invoiceSort]);

  const sortedPayments = useMemo(() => {
    const arr = [...payments];
    arr.sort((a, b) => {
      const dir = paymentSort.order === "asc" ? 1 : -1;
      if (paymentSort.key === "date") {
        const av = a.posting_date || "";
        const bv = b.posting_date || "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      }
      const av = a.amount ?? 0;
      const bv = b.amount ?? 0;
      return (av - bv) * dir;
    });
    return arr;
  }, [payments, paymentSort]);

  function toggleInvoiceSort(key: "date" | "outstanding") {
    setInvoiceSort((prev) =>
      prev.key === key ? { key, order: prev.order === "asc" ? "desc" : "asc" } : { key, order: "desc" }
    );
  }

  function togglePaymentSort(key: "date" | "amount") {
    setPaymentSort((prev) =>
      prev.key === key ? { key, order: prev.order === "asc" ? "desc" : "asc" } : { key, order: "desc" }
    );
  }

  const invoiceTotal = useMemo(
    () => invoices.reduce((s, i) => s + (i.outstanding_amount ?? i.amount ?? 0), 0),
    [invoices]
  );
  const paymentTotal = useMemo(
    () => payments.reduce((s, p) => s + (p.amount ?? 0), 0),
    [payments]
  );

  const handleAllocate = async () => {
    if (!reconciliationDoc) {
      toast.error("Fetch entries first");
      return;
    }
    setBusy(true);
    try {
      const items: Allocation[] = Object.entries(allocations)
        .filter(([, v]) => Number(v) > 0)
        .map(([k, v]) => {
          const [pKey, iKey] = k.split("|");
          return { payment_key: pKey, invoice_key: iKey, amount: Number(v) };
        });
      if (items.length === 0) {
        toast.error("Enter at least one allocation amount");
        return;
      }
      await frappeCall(
        "erpnext.accounts.doctype.payment_reconciliation.payment_reconciliation.allocate_entries",
        {
          docname: reconciliationDoc,
          args: JSON.stringify(items),
        }
      );
      toast.success("Allocations saved");
    } catch {
      toast.error("Failed to allocate");
    } finally {
      setBusy(false);
    }
  };

  const handleReconcile = async () => {
    if (!reconciliationDoc) return;
    setBusy(true);
    try {
      await frappeCall(
        "erpnext.accounts.doctype.payment_reconciliation.payment_reconciliation.reconcile",
        { docname: reconciliationDoc }
      );
      toast.success("Reconciled");
      handleFetch();
    } catch {
      toast.error("Failed to reconcile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Payment reconciliation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Match unreconciled invoices with payments for a party.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs">Company</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Party type</Label>
              <Select value={partyType} onValueChange={setPartyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Party</Label>
              <Input value={party} onChange={(e) => setParty(e.target.value)} placeholder="Party name" />
            </div>
            <div>
              <Label className="text-xs">Receivable/Payable</Label>
              <Input
                value={receivableAccount}
                onChange={(e) => setReceivableAccount(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFetch} disabled={loading || !company || !party} className="w-full">
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Fetch entries
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : invoices.length === 0 && payments.length === 0 && reconciliationDoc ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No unreconciled entries for this party.
          </CardContent>
        </Card>
      ) : payments.length === 0 && invoices.length === 0 ? null : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0">
              <CardHeader className="p-6 pb-4">
                <CardTitle>Invoices</CardTitle>
                <CardDescription className="mt-1">
                  Outstanding invoices · total{" "}
                  <span className="tabular-nums">
                    {formatMoney(invoiceTotal, invoices[0]?.currency || "USD")}
                  </span>
                </CardDescription>
              </CardHeader>
              {invoices.length === 0 ? (
                <div className="pb-8 text-center text-sm text-muted-foreground">
                  No outstanding invoices.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead className="w-8 font-medium">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={
                            selectedInvoices.size === invoices.length && invoices.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(new Set(invoices.map(invoiceKey)));
                            } else {
                              setSelectedInvoices(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Invoice #</TableHead>
                      <TableHead
                        className="cursor-pointer font-medium hover:text-foreground"
                        onClick={() => toggleInvoiceSort("date")}
                      >
                        Date{invoiceSort.key === "date" ? (invoiceSort.order === "asc" ? " ▲" : " ▼") : ""}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer text-right font-medium hover:text-foreground"
                        onClick={() => toggleInvoiceSort("outstanding")}
                      >
                        Outstanding
                        {invoiceSort.key === "outstanding"
                          ? invoiceSort.order === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </TableHead>
                      <TableHead className="text-right font-medium">Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInvoices.map((i) => {
                      const k = invoiceKey(i);
                      const checked = selectedInvoices.has(k);
                      return (
                        <TableRow
                          key={k}
                          data-state={checked ? "selected" : undefined}
                          className="hover:bg-muted/40"
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="size-4 accent-primary"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedInvoices((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(k);
                                  else next.delete(k);
                                  return next;
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {i.invoice_type || i.reference_type ? (
                              <Badge variant="outline" className="text-xs">
                                {i.invoice_type || i.reference_type}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {i.invoice_number || i.reference_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(i.invoice_date || i.posting_date)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(
                              i.outstanding_amount ?? i.amount ?? 0,
                              i.currency || "USD"
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {ageDays(i.invoice_date || i.posting_date)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>

            <Card className="p-0">
              <CardHeader className="p-6 pb-4">
                <CardTitle>Payments</CardTitle>
                <CardDescription className="mt-1">
                  Unallocated payments and credits · total{" "}
                  <span className="tabular-nums">
                    {formatMoney(paymentTotal, payments[0]?.currency || "USD")}
                  </span>
                </CardDescription>
              </CardHeader>
              {payments.length === 0 ? (
                <div className="pb-8 text-center text-sm text-muted-foreground">
                  No unallocated payments.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead className="w-8 font-medium">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={
                            selectedPayments.size === payments.length && payments.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayments(new Set(payments.map(invoiceKey)));
                            } else {
                              setSelectedPayments(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="font-medium">Payment #</TableHead>
                      <TableHead
                        className="cursor-pointer font-medium hover:text-foreground"
                        onClick={() => togglePaymentSort("date")}
                      >
                        Date{paymentSort.key === "date" ? (paymentSort.order === "asc" ? " ▲" : " ▼") : ""}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer text-right font-medium hover:text-foreground"
                        onClick={() => togglePaymentSort("amount")}
                      >
                        Amount{paymentSort.key === "amount" ? (paymentSort.order === "asc" ? " ▲" : " ▼") : ""}
                      </TableHead>
                      <TableHead className="font-medium">Currency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPayments.map((p) => {
                      const k = invoiceKey(p);
                      const checked = selectedPayments.has(k);
                      return (
                        <TableRow
                          key={k}
                          data-state={checked ? "selected" : undefined}
                          className="hover:bg-muted/40"
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="size-4 accent-primary"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedPayments((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(k);
                                  else next.delete(k);
                                  return next;
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {p.reference_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(p.posting_date)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(p.amount ?? 0, p.currency || "USD")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.currency || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

          {invoices.length > 0 && payments.length > 0 ? (
            <Card className="p-0">
              <CardHeader className="flex-row items-center justify-between space-y-0 p-6 pb-4">
                <div>
                  <CardTitle>Allocation matrix</CardTitle>
                  <CardDescription className="mt-1">
                    Enter the amount from each payment to allocate against each invoice.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleAllocate} disabled={busy}>
                    Allocate
                  </Button>
                  <Button size="sm" onClick={handleReconcile} disabled={busy}>
                    <Play className="h-3.5 w-3.5 mr-1.5" /> Reconcile
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead
                        className={cn(
                          "sticky left-0 z-10 min-w-[200px] bg-secondary/40 font-medium"
                        )}
                      >
                        Payment ↓ / Invoice →
                      </TableHead>
                      {invoices.map((i) => (
                        <TableHead
                          key={invoiceKey(i)}
                          className="min-w-[120px] text-center font-mono text-xs"
                        >
                          {i.invoice_number || i.reference_name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => {
                      const rowTotal = invoices.reduce((sum, i) => {
                        const key = `${invoiceKey(p)}|${invoiceKey(i)}`;
                        return sum + (Number(allocations[key]) || 0);
                      }, 0);
                      return (
                        <TableRow key={invoiceKey(p)} className="hover:bg-muted/20">
                          <TableCell
                            className={cn(
                              "sticky left-0 z-10 min-w-[200px] bg-card"
                            )}
                          >
                            <div className="font-mono text-xs">{p.reference_name}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {formatMoney(p.amount ?? 0, p.currency || "USD")}
                              </Badge>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                allocated{" "}
                                {formatMoney(rowTotal, p.currency || "USD")}
                              </span>
                            </div>
                          </TableCell>
                          {invoices.map((i) => {
                            const key = `${invoiceKey(p)}|${invoiceKey(i)}`;
                            return (
                              <TableCell key={key} className="text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={allocations[key] ?? ""}
                                  onChange={(e) =>
                                    setAllocations((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  className="h-8 w-24 text-xs tabular-nums"
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
