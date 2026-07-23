"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DocField } from "@/lib/frappe-meta";

interface Props {
  field: DocField;
  value: unknown;
  onChange: (next: unknown) => void;
  disabled?: boolean;
}

export function FieldInput({ field, value, onChange, disabled }: Props) {
  const label = field.label ?? field.fieldname;
  const readOnly = field.read_only === 1 || disabled;
  const commonId = `field-${field.fieldname}`;

  const control = () => {
    switch (field.fieldtype) {
      case "Currency":
      case "Float":
      case "Percent":
        return (
          <Input
            id={commonId}
            type="number"
            step="any"
            value={(value as string | number | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            disabled={readOnly}
            className="font-mono tabular-nums"
          />
        );
      case "Int":
        return (
          <Input
            id={commonId}
            type="number"
            step="1"
            value={(value as string | number | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
            disabled={readOnly}
            className="font-mono tabular-nums"
          />
        );
      case "Date":
        return (
          <Input
            id={commonId}
            type="date"
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
          />
        );
      case "Datetime":
        return (
          <Input
            id={commonId}
            type="datetime-local"
            value={((value as string | undefined) ?? "").slice(0, 16)}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
          />
        );
      case "Check":
        return (
          <div className="flex h-9 items-center">
            <input
              id={commonId}
              type="checkbox"
              checked={Number(value ?? 0) === 1}
              onChange={(e) => onChange(e.target.checked ? 1 : 0)}
              disabled={readOnly}
              className="size-4 rounded border-input accent-primary"
            />
          </div>
        );
      case "Select": {
        const options = (field.options ?? "").split("\n").filter(Boolean);
        return (
          <Select
            value={(value as string | undefined) ?? ""}
            onValueChange={(v) => onChange(v)}
            disabled={readOnly}
          >
            <SelectTrigger id={commonId}>
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      case "Text":
      case "Small Text":
      case "Long Text":
        return (
          <Textarea
            id={commonId}
            rows={field.fieldtype === "Small Text" ? 2 : 4}
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
          />
        );
      case "Data":
      case "Link":
      case "Dynamic Link":
      default:
        return (
          <Input
            id={commonId}
            type="text"
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={commonId} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {field.reqd === 1 && <span className="text-destructive">*</span>}
      </Label>
      {control()}
    </div>
  );
}
