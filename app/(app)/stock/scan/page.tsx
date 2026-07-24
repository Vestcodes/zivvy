import type { Metadata } from "next";
import { BarcodeScanClient } from "@/components/stock/barcode-scan-client";

export const metadata: Metadata = {
  title: "Barcode scan — Zivvy",
  description: "Look up items by barcode for receiving, picking, and stock checks."
};

export default function StockScanPage() {
  return <BarcodeScanClient />;
}
