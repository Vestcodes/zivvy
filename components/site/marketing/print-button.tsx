"use client";

import { Printer } from "lucide-react";

/**
 * Tiny client-side print trigger. Kept in its own file so LegalShell
 * can stay a pure server component and still let readers export a
 * page to PDF from the browser.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="legal-print-hide inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      aria-label="Print this page"
    >
      <Printer className="size-3" />
      Print
    </button>
  );
}
