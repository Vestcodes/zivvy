import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocField } from "@/lib/frappe-meta";

const CURRENCY = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatDate(value: unknown, withTime = false) {
  if (!value) return "";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function FieldView({ field, value }: { field: DocField; value: unknown }) {
  const label = field.label ?? field.fieldname;
  const render = (): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground">—</span>;
    }
    switch (field.fieldtype) {
      case "Currency":
        return (
          <span className="font-mono tabular-nums">
            {CURRENCY.format(Number(value))}
          </span>
        );
      case "Float":
      case "Percent":
        return (
          <span className="font-mono tabular-nums">
            {Number(value).toFixed(2)}
            {field.fieldtype === "Percent" ? "%" : ""}
          </span>
        );
      case "Int":
        return <span className="font-mono tabular-nums">{Number(value)}</span>;
      case "Date":
        return <span className="tabular-nums">{formatDate(value, false)}</span>;
      case "Datetime":
        return <span className="tabular-nums">{formatDate(value, true)}</span>;
      case "Check":
        return Number(value) === 1 ? (
          <Check className="size-4 text-primary" />
        ) : (
          <Minus className="size-4 text-muted-foreground/50" />
        );
      case "Select":
        return (
          <Badge variant="outline" className="border-border/70 bg-secondary/70 font-normal">
            {String(value)}
          </Badge>
        );
      case "Small Text":
      case "Text":
      case "Long Text":
        return <p className="whitespace-pre-wrap text-sm">{String(value)}</p>;
      default:
        return <span className="text-sm">{String(value)}</span>;
    }
  };

  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div>{render()}</div>
    </div>
  );
}
