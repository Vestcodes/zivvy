"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkField } from "@/components/auto/link-field";
import type { DocField } from "@/lib/frappe-meta";
import { cn } from "@/lib/utils";

interface Props {
  field: DocField;
  value: unknown;
  onChange: (next: unknown) => void;
  disabled?: boolean;
  error?: string;
}

export function FieldInput({ field, value, onChange, disabled, error }: Props) {
  const label = field.label ?? field.fieldname;
  const readOnly = field.read_only === 1 || disabled;
  const commonId = `field-${field.fieldname}`;
  const errorId = `${commonId}-error`;
  const invalid = Boolean(error);
  const isRequired = field.reqd === 1;

  if (field.fieldtype === "Check") {
    return (
      <div
        className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
        data-field={field.fieldname}
      >
        <Label
          htmlFor={commonId}
          className="cursor-pointer text-sm font-medium text-foreground"
        >
          {label}
        </Label>
        <button
          id={commonId}
          type="button"
          role="switch"
          aria-checked={Number(value ?? 0) === 1}
          onClick={() => !readOnly && onChange(Number(value ?? 0) === 1 ? 0 : 1)}
          disabled={readOnly}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors before:absolute before:-inset-y-2 before:inset-x-0 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            Number(value ?? 0) === 1 ? "bg-primary" : "bg-input"
          )}
        >
          <span
            className={cn(
              "pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
              Number(value ?? 0) === 1 ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }

  const control = () => {
    switch (field.fieldtype) {
      case "Currency":
      case "Float":
      case "Percent":
        return (
          <div className="relative">
            {field.fieldtype === "Currency" && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
            )}
            {field.fieldtype === "Percent" && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            )}
            <Input
              id={commonId}
              type="number"
              step="any"
              value={(value as string | number | undefined) ?? ""}
              onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
              disabled={readOnly}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              className={cn(
                "h-11 text-base font-mono tabular-nums md:h-10 md:text-sm",
                field.fieldtype === "Currency" && "pl-7",
                field.fieldtype === "Percent" && "pr-7"
              )}
            />
          </div>
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
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className="h-11 text-base font-mono tabular-nums md:h-10 md:text-sm"
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
            className="h-11 text-base md:h-10 md:text-sm"
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
            className="h-11 text-base md:h-10 md:text-sm"
          />
        );
      case "Select": {
        const options = (field.options ?? "").split("\n").filter(Boolean);
        return (
          <Select
            value={(value as string | undefined) ?? ""}
            onValueChange={(v) => onChange(v)}
            disabled={readOnly}
          >
            <SelectTrigger id={commonId} className="h-11 text-base md:h-10 md:text-sm">
              <SelectValue placeholder="Select..." />
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
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
      case "Link":
        return (
          <LinkField
            id={commonId}
            doctype={field.options ?? ""}
            value={(value as string | undefined) ?? ""}
            onChange={onChange}
            disabled={readOnly}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
          />
        );
      case "Data":
      case "Dynamic Link":
      default:
        return (
          <Input
            id={commonId}
            type="text"
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className="h-11 text-base md:h-10 md:text-sm"
          />
        );
    }
  };

  return (
    <div className="group grid gap-2" data-field={field.fieldname}>
      <Label
        htmlFor={commonId}
        className={cn(
          "text-sm font-medium",
          invalid ? "text-destructive" : "text-foreground/80"
        )}
      >
        {label}
        {isRequired && (
          <span className="ml-0.5 text-destructive" aria-label="required">*</span>
        )}
      </Label>
      {control()}
      {invalid && (
        <p id={errorId} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
