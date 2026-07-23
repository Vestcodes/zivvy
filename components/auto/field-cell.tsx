import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocField } from "@/lib/frappe-meta";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

const INT_FORMAT = new Intl.NumberFormat();

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
          {formatMoney(Number(value), "USD", { fractionDigits: 2 })}
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
      return <span className="tabular-nums">{formatDate(String(value))}</span>;

    case "Datetime":
      return <span className="tabular-nums">{formatDateTime(String(value))}</span>;

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
