"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Printer,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { frappeCall } from "@/lib/frappe-client";

interface Props {
  doctype: string;
  docname: string;
}

const FRAPPE_ORIGIN =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ?? "");

export function PrintButton({ doctype, docname }: Props) {
  const [open, setOpen] = useState(false);
  const [formats, setFormats] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("Standard");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadFormats() {
      try {
        const result = await frappeCall<string[]>(
          "frappe.client.get_list",
          {
            doctype: "Print Format",
            filters: JSON.stringify({ doc_type: doctype, disabled: 0 }),
            fields: JSON.stringify(["name"]),
            limit_page_length: 50
          }
        );
        if (!cancelled && Array.isArray(result)) {
          const names = result.map((r: any) => String(r.name ?? r));
          setFormats(["Standard", ...names]);
        }
      } catch {
        if (!cancelled) setFormats(["Standard"]);
      }
    }
    void loadFormats();
    return () => { cancelled = true; };
  }, [open, doctype]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setHtmlContent(null);

    async function loadPreview() {
      try {
        const html = await frappeCall<string>(
          "frappe.www.printview.get_html_and_style",
          {
            doc: docname,
            doctype,
            print_format: selectedFormat,
            no_letterhead: "0"
          }
        );
        if (!cancelled) {
          if (typeof html === "string") {
            setHtmlContent(html);
          } else if (html && typeof html === "object" && "html" in (html as any)) {
            setHtmlContent((html as any).html);
          }
        }
      } catch {
        if (!cancelled) {
          setHtmlContent(`<div style="padding:2rem;text-align:center;color:#666;">
            <p>Print preview is not available for this document.</p>
            <p style="font-size:13px;margin-top:8px;">Try the direct print link instead.</p>
          </div>`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreview();
    return () => { cancelled = true; };
  }, [open, doctype, docname, selectedFormat]);

  const printUrl = `/api/method/frappe.utils.print_format.download_pdf?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(docname)}&format=${encodeURIComponent(selectedFormat)}&no_letterhead=0`;

  const handlePrint = useCallback(() => {
    const iframe = document.getElementById("print-frame") as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.open(printUrl, "_blank");
    }
  }, [printUrl]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Printer className="size-4" />
        Print
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-3xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Print preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 border-b pb-3">
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Print format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={printUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-3.5" />
                  PDF
                </a>
              </Button>
              <Button variant="polished" size="sm" onClick={handlePrint}>
                <Printer className="size-3.5" />
                Print
              </Button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-md border bg-white">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {htmlContent ? (
              <iframe
                id="print-frame"
                srcDoc={`<!DOCTYPE html><html><head><style>
                  body { margin: 0; padding: 20px; font-family: -apple-system, sans-serif; font-size: 13px; color: #333; }
                  @media print { body { padding: 0; } }
                  table { border-collapse: collapse; width: 100%; }
                  td, th { padding: 4px 8px; border: 1px solid #ddd; }
                </style></head><body>${htmlContent}</body></html>`}
                className="h-[60vh] w-full border-0"
                title="Print preview"
              />
            ) : !loading ? (
              <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
                Select a print format to preview
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
