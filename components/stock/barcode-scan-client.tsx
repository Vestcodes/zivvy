"use client";

import { useState } from "react";
import Link from "next/link";
import { Barcode, Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { frappeCall } from "@/lib/frappe-client";

type ScanResult = {
  item_code?: string;
  item_name?: string;
  barcode?: string;
  [key: string]: unknown;
};

export function BarcodeScanClient() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    const barcode = code.trim();
    if (!barcode) {
      toast.error("Enter a barcode to scan");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const message = await frappeCall<ScanResult | string | null>(
        "erpnext.stock.utils.scan_barcode",
        { barcode }
      );
      if (!message || (typeof message === "object" && !message.item_code)) {
        toast.error("No item found for that barcode");
        return;
      }
      if (typeof message === "string") {
        setResult({ item_code: message, barcode });
      } else {
        setResult({ ...message, barcode });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Barcode scan
        </h1>
        <p className="mt-2 text-muted-foreground">
          Scan or type a barcode to look up the matching item.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Barcode className="size-4" />
            Scan barcode
          </CardTitle>
          <CardDescription>
            Use a USB/Bluetooth scanner in keyboard mode, or paste a code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onScan} className="flex flex-col gap-3 sm:flex-row">
            <Input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Scan or enter barcode"
              aria-label="Barcode"
              className="flex-1"
            />
            <Button type="submit" variant="polished" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Look up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result?.item_code ? (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageSearch className="size-4" />
              {String(result.item_name || result.item_code)}
            </CardTitle>
            <CardDescription>
              Item {String(result.item_code)}
              {result.barcode ? ` · barcode ${String(result.barcode)}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/stock/items/${encodeURIComponent(String(result.item_code))}`}>
                Open item
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/stock/entries?new=1">New stock entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
