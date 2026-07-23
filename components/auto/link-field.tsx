"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { frappeCall } from "@/lib/frappe-client";
import { cn } from "@/lib/utils";

interface Props {
  doctype: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface LinkOption {
  value: string;
  description?: string;
}

export function LinkField({
  doctype,
  value,
  onChange,
  placeholder,
  disabled,
  id,
  ...ariaProps
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [options, setOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (txt: string) => {
    setLoading(true);
    try {
      const result = await frappeCall<Array<Record<string, unknown>>>(
        "frappe.desk.search.search_link",
        {
          doctype,
          txt,
          page_length: 10
        }
      );
      if (Array.isArray(result)) {
        setOptions(
          result.map((r) => ({
            value: String(r.value ?? r.name ?? ""),
            description: r.description ? String(r.description) : undefined
          }))
        );
      } else {
        setOptions([]);
      }
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [doctype]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, search]);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const selectOption = useCallback((opt: LinkOption) => {
    setQuery(opt.value);
    onChange(opt.value);
    setOpen(false);
    setHighlightIdx(-1);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < options.length) {
          selectOption(options[highlightIdx]);
        } else if (query.trim()) {
          onChange(query.trim());
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setHighlightIdx(-1);
        break;
      case "Tab":
        setOpen(false);
        setHighlightIdx(-1);
        break;
    }
  }, [open, options, highlightIdx, selectOption, query, onChange]);

  const handleClear = useCallback(() => {
    setQuery("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setHighlightIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? `Search ${doctype.toLowerCase()}…`}
          disabled={disabled}
          className="pl-8 pr-16"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          {...ariaProps}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          {query && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
          <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
        </div>
      </div>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md"
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loading ? "Searching…" : query ? "No results found" : `Type to search ${doctype}`}
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setHighlightIdx(i)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    i === highlightIdx && "bg-accent",
                    opt.value === value && "font-medium"
                  )}
                >
                  {opt.value === value && (
                    <Check className="size-3.5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{opt.value}</span>
                    {opt.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
