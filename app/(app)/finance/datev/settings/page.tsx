"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Settings2,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { frappeCall } from "@/lib/frappe-client";
import { AddonLock } from "@/components/site/addon-lock";
import type { ActiveAddon } from "@/components/settings/addons-manager";

const DATEV_ADDON_SLUG = "erpnext-datev";

interface DatevSettings {
  name?: string;
  client?: string;
  client_number?: string;
  consultant_number?: string;
  consultant?: string;
  account_number_length?: number;
  temporary_against_account_number?: string;
  opening_against_account_number?: string;
}

export default function DatevSettingsPage() {
  const [addonStatus, setAddonStatus] = useState<
    "loading" | "active" | "inactive"
  >("loading");
  const [companies, setCompanies] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [settings, setSettings] = useState<DatevSettings>({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const addons = await frappeCall<ActiveAddon[]>(
          "zivvy_brand.api.addons.list_my_addons"
        );
        const isActive = (addons ?? []).some(
          (a) =>
            a.addon_slug === DATEV_ADDON_SLUG &&
            a.status !== "cancelled" &&
            a.status !== "past_due"
        );
        setAddonStatus(isActive ? "active" : "inactive");

        if (isActive) {
          const [compRes, suppRes] = await Promise.all([
            frappeCall<Array<{ name: string }>>(
              "frappe.client.get_list",
              {
                doctype: "Company" as unknown as string,
                fields: JSON.stringify(["name"]) as unknown as string,
                limit_page_length: 100 as unknown as string,
              } as Record<string, string>
            ),
            frappeCall<Array<{ name: string }>>(
              "frappe.client.get_list",
              {
                doctype: "Supplier" as unknown as string,
                fields: JSON.stringify(["name"]) as unknown as string,
                limit_page_length: 200 as unknown as string,
              } as Record<string, string>
            ),
          ]);
          const compNames = (compRes ?? []).map((c) => c.name);
          const suppNames = (suppRes ?? []).map((s) => s.name);
          setCompanies(compNames);
          setSuppliers(suppNames);
          if (compNames.length === 1) {
            setSelectedCompany(compNames[0]);
          }
        }
      } catch {
        setAddonStatus("inactive");
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedCompany || addonStatus !== "active") return;

    async function loadSettings() {
      setLoadingSettings(true);
      try {
        const res = await frappeCall<DatevSettings>(
          "frappe.client.get_value",
          {
            doctype: "DATEV Settings" as unknown as string,
            filters: JSON.stringify({
              client: selectedCompany,
            }) as unknown as string,
            fieldname: JSON.stringify([
              "name",
              "client",
              "client_number",
              "consultant_number",
              "consultant",
              "account_number_length",
              "temporary_against_account_number",
              "opening_against_account_number",
            ]) as unknown as string,
          } as Record<string, string>
        );

        if (res && res.name) {
          setSettings(res);
          setIsNew(false);
        } else {
          setSettings({
            client: selectedCompany,
            account_number_length: 4,
            temporary_against_account_number: "9090",
            opening_against_account_number: "9000",
          });
          setIsNew(true);
        }
      } catch {
        setSettings({
          client: selectedCompany,
          account_number_length: 4,
          temporary_against_account_number: "9090",
          opening_against_account_number: "9000",
        });
        setIsNew(true);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, [selectedCompany, addonStatus]);

  const handleSave = useCallback(async () => {
    if (!selectedCompany || !settings.client_number || !settings.consultant_number) {
      toast.error("Company, client number, and consultant number are required");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await frappeCall("frappe.client.insert", {
          doc: JSON.stringify({
            doctype: "DATEV Settings",
            client: selectedCompany,
            client_number: settings.client_number,
            consultant_number: settings.consultant_number,
            consultant: settings.consultant || undefined,
            account_number_length: settings.account_number_length ?? 4,
            temporary_against_account_number:
              settings.temporary_against_account_number || "9090",
            opening_against_account_number:
              settings.opening_against_account_number || "9000",
          }) as unknown as string,
        } as Record<string, string>);
      } else {
        await frappeCall("frappe.client.set_value", {
          doctype: "DATEV Settings" as unknown as string,
          name: settings.name as unknown as string,
          fieldname: JSON.stringify({
            client_number: settings.client_number,
            consultant_number: settings.consultant_number,
            consultant: settings.consultant || "",
            account_number_length: settings.account_number_length ?? 4,
            temporary_against_account_number:
              settings.temporary_against_account_number || "9090",
            opening_against_account_number:
              settings.opening_against_account_number || "9000",
          }) as unknown as string,
        } as Record<string, string>);
      }
      toast.success("DATEV settings saved");
      setIsNew(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [selectedCompany, settings, isNew]);

  const update = (field: keyof DatevSettings, value: string | number) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  if (addonStatus === "loading") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 py-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (addonStatus === "inactive") {
    return (
      <AddonLock
        addonSlug={DATEV_ADDON_SLUG}
        addonTitle="DATEV Export"
        addonPrice={19}
        moduleName="DATEV Settings"
        description="Configure your DATEV client and consultant numbers to start exporting."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/finance/datev">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to export
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            DATEV Settings
          </h1>
          <Badge variant="secondary" className="text-xs">
            Add-on
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure client and consultant numbers for DATEV CSV export.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company</CardTitle>
          <CardDescription>
            Each company has its own DATEV configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
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
        </CardContent>
      </Card>

      {selectedCompany && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {isNew ? "New" : ""} DATEV configuration
              </CardTitle>
            </div>
            <CardDescription>
              Your Steuerberater provides these numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingSettings ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">
                      Mandantennummer (Client number){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={settings.client_number ?? ""}
                      onChange={(e) =>
                        update("client_number", e.target.value.slice(0, 5))
                      }
                      placeholder="e.g. 12345"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5 digits
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">
                      Beraternummer (Consultant number){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={settings.consultant_number ?? ""}
                      onChange={(e) =>
                        update(
                          "consultant_number",
                          e.target.value.slice(0, 7)
                        )
                      }
                      placeholder="e.g. 1234567"
                      maxLength={7}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 7 digits
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">
                    Steuerberater (Tax consultant)
                  </Label>
                  <Select
                    value={settings.consultant ?? "none"}
                    onValueChange={(v) =>
                      update("consultant", v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional — link a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">
                      Sachkontenlänge (Account number length)
                    </Label>
                    <Select
                      value={String(settings.account_number_length ?? 4)}
                      onValueChange={(v) =>
                        update("account_number_length", parseInt(v, 10))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} digits
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">
                      Verrechnungskonto (Against account)
                    </Label>
                    <Input
                      value={
                        settings.temporary_against_account_number ?? "9090"
                      }
                      onChange={(e) =>
                        update(
                          "temporary_against_account_number",
                          e.target.value
                        )
                      }
                      placeholder="9090"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Eröffnungskonto (Opening account)
                    </Label>
                    <Input
                      value={
                        settings.opening_against_account_number ?? "9000"
                      }
                      onChange={(e) =>
                        update(
                          "opening_against_account_number",
                          e.target.value
                        )
                      }
                      placeholder="9000"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1.5" />
                        {isNew ? "Create settings" : "Save changes"}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
