"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Settings2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { frappeCall } from "@/lib/frappe-client";
import { AddonLock } from "@/components/site/addon-lock";
import { useAddonEntitlement } from "@/components/boot-provider";

const DATEV_ADDON_SLUG = "erpnext-datev";

const VOUCHER_TYPES = [
  { value: "all", label: "All voucher types" },
  { value: "Sales Invoice", label: "Sales Invoice" },
  { value: "Purchase Invoice", label: "Purchase Invoice" },
  { value: "Payment Entry", label: "Payment Entry" },
  { value: "Journal Entry", label: "Journal Entry" },
  { value: "Expense Claim", label: "Expense Claim" },
  { value: "Payroll Entry", label: "Payroll Entry" },
  { value: "Stock Entry", label: "Stock Entry" },
  { value: "Asset", label: "Asset" },
] as const;

const EXPORT_FILES = [
  {
    name: "Buchungsstapel",
    description: "Transaction postings with account, counter-account, amount, and posting text.",
    icon: FileSpreadsheet,
  },
  {
    name: "Kontenbeschriftungen",
    description: "Account names mapped to your chart of accounts (SKR03/SKR04).",
    icon: FileSpreadsheet,
  },
  {
    name: "Debitoren (Kunden)",
    description: "Customer master data with DATEV debtor numbers.",
    icon: Users,
  },
  {
    name: "Kreditoren (Lieferanten)",
    description: "Supplier master data with DATEV creditor numbers.",
    icon: Users,
  },
];

function defaultFromDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function defaultToDate(): string {
  const d = new Date();
  d.setDate(0);
  return d.toISOString().slice(0, 10);
}

export default function DatevExportPage() {
  const { active: addonActive } = useAddonEntitlement(DATEV_ADDON_SLUG);
  const [companies, setCompanies] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [voucherType, setVoucherType] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [hasSettings, setHasSettings] = useState<boolean | null>(null);

  useEffect(() => {
    if (!addonActive) return;
    async function init() {
      try {
        const res = await frappeCall<{ keys?: string[] }>(
          "frappe.client.get_list",
          {
            doctype: "Company" as unknown as string,
            fields: JSON.stringify(["name"]) as unknown as string,
            limit_page_length: 100 as unknown as string,
          } as Record<string, string>
        );
        const names = ((res as unknown as Array<{ name: string }>) ?? []).map(
          (c) => c.name
        );
        setCompanies(names);
        if (names.length === 1) setCompany(names[0]);

        try {
          const settings = await frappeCall<unknown[]>(
            "frappe.client.get_list",
            {
              doctype: "DATEV Settings" as unknown as string,
              limit_page_length: 1 as unknown as string,
            } as Record<string, string>
          );
          setHasSettings(
            Array.isArray(settings) && settings.length > 0
          );
        } catch {
          setHasSettings(false);
        }
      } catch {
        // silently fail — page will still render
      }
    }
    init();
  }, [addonActive]);

  const handleDownload = useCallback(async () => {
    if (!company || !fromDate || !toDate) {
      toast.error("Please select a company and date range");
      return;
    }

    setDownloading(true);
    try {
      const filters = JSON.stringify({
        company,
        from_date: fromDate,
        to_date: toDate,
        ...(voucherType !== "all" ? { voucher_type: voucherType } : {}),
      });

      const url = `/api/method/erpnext_datev.erpnext_datev.report.datev.datev.download_datev_csv?filters=${encodeURIComponent(filters)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("DATEV export started — check your downloads");
    } catch {
      toast.error("Export failed. Check your DATEV settings.");
    } finally {
      setDownloading(false);
    }
  }, [company, fromDate, toDate, voucherType]);

  const canDownload = company && fromDate && toDate;

  if (!addonActive) {
    return (
      <AddonLock
        addonSlug={DATEV_ADDON_SLUG}
        addonTitle="DATEV Export"
        addonPrice={19}
        moduleName="DATEV Export"
        description="Export your Zivvy bookings in the exact DATEV format your Steuerberater expects — HGB-compliant, SKR03 or SKR04, no spreadsheet gymnastics."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
              DATEV Export
            </h1>
            <Badge variant="secondary" className="text-xs">
              Add-on
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Export GL entries as DATEV-format CSV — ready for your
            Steuerberater.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/finance/datev/settings">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Link>
        </Button>
      </header>

      {hasSettings === false && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Settings2 className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">Setup required.</span>{" "}
              Configure your DATEV client and consultant numbers before
              exporting.
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/finance/datev/settings">Configure</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export period</CardTitle>
          <CardDescription>
            Select the company, date range, and optional voucher type filter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Company</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Voucher type</Label>
              <Select value={voucherType} onValueChange={setVoucherType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOUCHER_TYPES.map((vt) => (
                    <SelectItem key={vt.value} value={vt.value}>
                      {vt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleDownload}
              disabled={!canDownload || downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Download DATEV CSV
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Downloads a ZIP with 4 DATEV-format CSV files
            </span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          What&apos;s in the export
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXPORT_FILES.map(({ name, description, icon: Icon }) => (
            <Card key={name} className="border-border/70">
              <CardContent className="flex items-start gap-3 py-4">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
