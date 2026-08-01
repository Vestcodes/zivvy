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
      return <span className="text-muted-foreground/60">--</span>;
    }
    switch (field.fieldtype) {
      case "Currency":
        return (
          <span className="font-mono tabular-nums text-foreground">
            {CURRENCY.format(Number(value))}
          </span>
        );
      case "Float":
      case "Percent":
        return (
          <span className="font-mono tabular-nums text-foreground">
            {Number(value).toFixed(2)}
            {field.fieldtype === "Percent" ? "%" : ""}
          </span>
        );
      case "Int":
        return <span className="font-mono tabular-nums text-foreground">{Number(value)}</span>;
      case "Date":
        return <span className="tabular-nums text-foreground">{formatDate(value, false)}</span>;
      case "Datetime":
        return <span className="tabular-nums text-foreground">{formatDate(value, true)}</span>;
      case "Check":
        return Number(value) === 1 ? (
          <div className="flex items-center gap-2">
            <div className="grid size-5 place-items-center rounded-full bg-primary/10">
              <Check className="size-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">Yes</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="grid size-5 place-items-center rounded-full bg-muted">
              <Minus className="size-3 text-muted-foreground/50" />
            </div>
            <span className="text-sm text-muted-foreground">No</span>
          </div>
        );
      case "Select":
        return (
          <Badge variant="outline" className="border-border/70 bg-secondary/50 font-normal">
            {String(value)}
          </Badge>
        );
      case "Small Text":
      case "Text":
      case "Long Text":
        return <p className="whitespace-pre-wrap text-sm text-foreground">{String(value)}</p>;
      default:
        return <span className="text-sm text-foreground">{String(value)}</span>;
    }
  };

  return (
    <div className="grid gap-1.5">
      <div className="text-sm font-medium text-foreground/60">
        {label}
      </div>
      <div>{render()}</div>
    </div>
  );
}
