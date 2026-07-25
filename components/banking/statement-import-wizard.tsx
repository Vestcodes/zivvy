"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, Landmark, Upload, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { frappeCall } from "@/lib/frappe-client";
import { cn } from "@/lib/utils";

interface BankAccount {
  name: string;
  account_name?: string;
}

interface PreviewData {
  columns?: string[];
  data?: Array<Array<string | number>>;
  warnings?: string[];
}

type Step = 1 | 2 | 3;

export function StatementImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bankAccount, setBankAccount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importDocName, setImportDocName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await frappeCall<BankAccount[]>("frappe.client.get_list", {
          doctype: "Bank Account",
          fields: JSON.stringify(["name", "account_name"]),
          filters: JSON.stringify([["disabled", "=", 0]]),
          order_by: "account_name asc",
          limit_page_length: 100,
        });
        setAccounts(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load bank accounts");
      }
    })();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !bankAccount) return;
    setBusy(true);
    try {
      // 1. Create Bank Statement Import doc.
      const created = await frappeCall<{ name: string }>("frappe.client.insert", {
        doc: JSON.stringify({
          doctype: "Bank Statement Import",
          bank_account: bankAccount,
          reference_doctype: "Bank Transaction",
          import_type: "Insert New Records",
        }),
      });
      const docName = created?.name;
      if (!docName) throw new Error("no name");
      setImportDocName(docName);

      // 2. Upload file attached to that doc.
      const csrf = (document.cookie.match(/csrf_token=([^;]+)/) ?? [])[1] ?? "";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("is_private", "1");
      fd.append("folder", "Home");
      fd.append("doctype", "Bank Statement Import");
      fd.append("docname", docName);
      fd.append("fieldname", "import_file");
      const uploadRes = await fetch("/api/method/upload_file", {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "X-Frappe-CSRF-Token": decodeURIComponent(csrf) } : {},
        body: fd,
      });
      if (!uploadRes.ok) throw new Error("upload failed");

      // 3. Fetch preview.
      const previewData = await frappeCall<PreviewData>(
        "frappe.core.doctype.data_import.data_import.get_preview_from_template",
        { data_import: docName }
      );
      setPreview(previewData ?? null);
      setStep(3);
      toast.success("File uploaded");
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setBusy(false);
    }
  }, [file, bankAccount]);

  const handleStart = useCallback(async () => {
    if (!importDocName) return;
    setBusy(true);
    try {
      await frappeCall("frappe.core.doctype.data_import.data_import.form_start_import", {
        data_import: importDocName,
      });
      toast.success("Import started");
      router.push("/finance/banking/statements/logs");
    } catch {
      toast.error("Failed to start import");
    } finally {
      setBusy(false);
    }
  }, [importDocName, router]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <header>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Import bank statement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV, XLSX, or MT940 file to import transactions.
        </p>
      </header>

      <Stepper step={step} />

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Bank account</CardTitle>
            <CardDescription className="mt-1">Which account are these transactions for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Bank account</Label>
              <Select value={bankAccount} onValueChange={setBankAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No bank accounts
                    </SelectItem>
                  ) : (
                    accounts.map((a) => (
                      <SelectItem key={a.name} value={a.name}>
                        {a.account_name || a.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!bankAccount}>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Upload file</CardTitle>
            <CardDescription className="mt-1">
              CSV, XLSX, or MT940 files exported from your bank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>File</Label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.mt940,.sta,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80"
              />
              {file ? (
                <p className="text-xs text-muted-foreground mt-2">
                  {file.name} · {(file.size / 1024).toFixed(1)} KB
                </p>
              ) : null}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleUpload} disabled={!file || busy}>
                <Upload className="h-4 w-4 mr-1.5" />
                {busy ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Preview & start</CardTitle>
            <CardDescription className="mt-1">
              Review the parsed rows and start the import when ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview ? (
              preview.columns && preview.data ? (
                <div className="max-h-96 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {preview.columns.map((c, i) => (
                          <TableHead key={i}>{c}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.data.slice(0, 20).map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => (
                            <TableCell key={ci} className="text-xs">
                              {String(cell)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Preview unavailable.</p>
              )
            ) : (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            )}
            {preview?.warnings?.length ? (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
                <div className="font-medium mb-1">Warnings</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            ) : null}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleStart} disabled={busy || !importDocName}>
                <Check className="h-4 w-4 mr-1.5" />
                {busy ? "Starting…" : "Start import"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items: Array<{ n: Step; label: string; icon: LucideIcon }> = [
    { n: 1, label: "Account", icon: Landmark },
    { n: 2, label: "Upload", icon: Upload },
    { n: 3, label: "Preview", icon: Check },
  ];
  return (
    <ol className="flex items-center gap-2 text-xs">
      {items.map((it, idx) => {
        const active = step === it.n;
        const done = step > it.n;
        const Icon = it.icon;
        return (
          <li key={it.n} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-emerald-500 bg-emerald-500 text-white",
                !active && !done && "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className={cn(active ? "font-medium" : "text-muted-foreground")}>{it.label}</span>
            {idx < items.length - 1 ? (
              <span className="mx-2 h-px w-8 bg-border" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
