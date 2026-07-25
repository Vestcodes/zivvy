"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { frappeCall } from "@/lib/frappe-client";

interface BankRule {
  name: string;
  rule_name?: string;
  transaction_type?: string;
  description_rules?: string;
  priority?: number;
  company?: string;
  party_type?: string;
  party?: string;
  disabled?: 0 | 1;
}

interface FormState {
  rule_name: string;
  transaction_type: string;
  description_rules: string;
  priority: string;
  company: string;
  party_type: string;
  party: string;
}

const emptyForm: FormState = {
  rule_name: "",
  transaction_type: "Deposit",
  description_rules: "",
  priority: "1",
  company: "",
  party_type: "",
  party: "",
};

export function BankRulesPanel() {
  const [rows, setRows] = useState<BankRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BankRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankRule | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      const data = await frappeCall<BankRule[]>("frappe.client.get_list", {
        doctype: "Bank Transaction Rule",
        fields: JSON.stringify([
          "name",
          "rule_name",
          "transaction_type",
          "description_rules",
          "priority",
          "company",
          "party_type",
          "party",
          "disabled",
        ]),
        order_by: "priority asc",
        limit_page_length: 100,
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

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (r: BankRule) => {
    setEditing(r);
    setForm({
      rule_name: r.rule_name ?? "",
      transaction_type: r.transaction_type ?? "Deposit",
      description_rules: r.description_rules ?? "",
      priority: String(r.priority ?? 1),
      company: r.company ?? "",
      party_type: r.party_type ?? "",
      party: r.party ?? "",
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.rule_name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    setBusy(true);
    try {
      const doc = {
        doctype: "Bank Transaction Rule",
        rule_name: form.rule_name.trim(),
        transaction_type: form.transaction_type,
        description_rules: form.description_rules,
        priority: Number(form.priority) || 1,
        company: form.company,
        party_type: form.party_type,
        party: form.party,
      };
      if (editing) {
        await frappeCall("frappe.client.set_value", {
          doctype: "Bank Transaction Rule",
          name: editing.name,
          fieldname: JSON.stringify(doc),
        });
      } else {
        await frappeCall("frappe.client.insert", {
          doc: JSON.stringify(doc),
        });
      }
      toast.success(editing ? "Rule updated" : "Rule created");
      setEditorOpen(false);
      fetchRows();
    } catch {
      toast.error("Failed to save rule");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await frappeCall("frappe.client.delete", {
        doctype: "Bank Transaction Rule",
        name: deleteTarget.name,
      });
      toast.success("Rule deleted");
      setDeleteTarget(null);
      fetchRows();
    } catch {
      toast.error("Failed to delete rule");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Bank rules</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-classify bank transactions with rules.
        </p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Rules</CardTitle>
            <CardDescription className="mt-1">
              Applied in order of priority (lowest first).
            </CardDescription>
          </div>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1.5" /> New rule
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No rules yet. Create one to auto-classify transactions.
            </p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.rule_name || r.name}</span>
                      <Badge variant="outline" className="text-xs">Priority {r.priority ?? "—"}</Badge>
                      {r.transaction_type ? (
                        <Badge variant="secondary" className="text-xs">{r.transaction_type}</Badge>
                      ) : null}
                      {r.disabled ? (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      ) : null}
                    </div>
                    {r.description_rules ? (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {r.description_rules}
                      </div>
                    ) : null}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(r)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit rule" : "New rule"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the rule and save." : "Give this rule a name, match description, and priority."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Rule name</Label>
              <Input
                value={form.rule_name}
                onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                placeholder="e.g. Stripe payouts"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Transaction type</Label>
                <Select
                  value={form.transaction_type}
                  onValueChange={(v) => setForm({ ...form, transaction_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description rules</Label>
              <Textarea
                value={form.description_rules}
                onChange={(e) => setForm({ ...form, description_rules: e.target.value })}
                placeholder="Comma-separated substrings to match in the transaction description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Party type</Label>
                <Select
                  value={form.party_type || "none"}
                  onValueChange={(v) => setForm({ ...form, party_type: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Shareholder">Shareholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Party</Label>
                <Input
                  value={form.party}
                  onChange={(e) => setForm({ ...form, party: e.target.value })}
                  placeholder="Party name"
                />
              </div>
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={busy || !form.rule_name.trim()}>
              {busy ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.rule_name || deleteTarget?.name}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={busy}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
