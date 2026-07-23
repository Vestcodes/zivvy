import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocField } from "@/lib/frappe-meta";

const CURRENCY_FORMAT = new Intl.NumberFormat(undefined, {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const INT_FORMAT = new Intl.NumberFormat();

function formatDate(value: unknown, withTime = false) {
  if (!value) return "";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function FieldCell({
  field,
  value,
  rowHref
}: {
  field: DocField;
  value: unknown;
  rowHref?: string;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (field.fieldtype) {
    case "Currency":
      return (
        <span className="font-mono tabular-nums">
          {CURRENCY_FORMAT.format(Number(value))}
        </span>
      );

    case "Float":
    case "Percent": {
      const n = Number(value);
      return (
        <span className="font-mono tabular-nums">
          {n.toFixed(2)}
          {field.fieldtype === "Percent" ? "%" : ""}
        </span>
      );
    }

    case "Int":
      return (
        <span className="font-mono tabular-nums">
          {INT_FORMAT.format(Number(value))}
        </span>
      );

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

    case "Link":
      return (
        <span className="text-sm">{String(value)}</span>
      );

    case "Data":
    default:
      // If this is the first "identifier" column and we know the row's detail URL,
      // render it as a link. Handled at the row level via rowHref plumbing.
      if (rowHref && (field.fieldname === "name" || field.reqd)) {
        return (
          <Link
            href={rowHref}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {String(value)}
          </Link>
        );
      }
      return <span className={cn("text-sm", field.reqd && "font-medium")}>{String(value)}</span>;
  }
}
