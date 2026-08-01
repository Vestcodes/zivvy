"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownAZ, ArrowUpAZ, Check, ListFilter, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { DocField } from "@/lib/frappe-meta";

type FilterTuple = [string, string, string, string | number | boolean];

function parseFilters(raw: string | null): FilterTuple[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function AutoListControls({ doctype, fields }: { doctype: string; fields: DocField[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilters = useMemo(() => parseFilters(searchParams.get("filters")), [searchParams]);
  const sortField = searchParams.get("sort") ?? "";
  const sortOrder = searchParams.get("order") === "ASC" ? "ASC" : "DESC";
  const [fieldname, setFieldname] = useState(fields[0]?.fieldname ?? "");
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  function replaceParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    mutator(params);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  function handleAddFilter() {
    if (!fieldname || !value.trim()) return;
    const field = fields.find((item) => item.fieldname === fieldname);
    const operator = field?.fieldtype === "Data" || field?.fieldtype === "Text" ? "like" : "=";
    const nextValue = operator === "like" ? `%${value.trim()}%` : value.trim();
    replaceParams((params) => params.set(
      "filters",
      JSON.stringify([...currentFilters, [doctype, fieldname, operator, nextValue]])
    ));
    setValue("");
    setOpen(false);
  }

  function handleRemoveFilter(index: number) {
    const next = currentFilters.filter((_, itemIndex) => itemIndex !== index);
    replaceParams((params) => {
      if (next.length > 0) params.set("filters", JSON.stringify(next));
      else params.delete("filters");
    });
  }

  function handleSort(nextField: string, nextOrder: "ASC" | "DESC") {
    replaceParams((params) => {
      params.set("sort", nextField);
      params.set("order", nextOrder);
    });
  }

  function handleReset() {
    replaceParams((params) => {
      params.delete("filters");
      params.delete("sort");
      params.delete("order");
      params.delete("view");
    });
  }

  const hasControls = currentFilters.length > 0 || Boolean(sortField);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="h-10">
            <ListFilter className="size-4" />
            Filter
            {currentFilters.length > 0 ? (
              <Badge className="min-w-5 justify-center bg-primary px-1.5 text-primary-foreground">{currentFilters.length}</Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
          <PopoverHeader>
            <PopoverTitle>Filter {doctype}</PopoverTitle>
            <PopoverDescription>Keep the view focused on the records that need action.</PopoverDescription>
          </PopoverHeader>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="filter-field">Field</Label>
              <Select value={fieldname} onValueChange={setFieldname}>
                <SelectTrigger id="filter-field" className="h-10">
                  <SelectValue placeholder="Choose a field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.fieldname} value={field.fieldname}>
                      {field.label ?? field.fieldname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-value">Value</Label>
              <Input
                id="filter-value"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Enter a value"
                className="h-10"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddFilter();
                  }
                }}
              />
            </div>
            <Button type="button" variant="polished" onClick={handleAddFilter} disabled={!fieldname || !value.trim()}>
              Apply filter
            </Button>
          </div>
          {currentFilters.length > 0 ? (
            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</p>
              <div className="grid gap-1.5">
                {currentFilters.map((filter, index) => {
                  const field = fields.find((item) => item.fieldname === filter[1]);
                  return (
                    <div key={`${filter[1]}-${index}`} className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-2 text-xs">
                      <span className="min-w-0 flex-1 truncate">
                        <strong>{field?.label ?? filter[1]}</strong> {filter[2] === "like" ? "contains" : "is"} {String(filter[3]).replaceAll("%", "")}
                      </span>
                      <button type="button" onClick={() => handleRemoveFilter(index)} aria-label={`Remove ${field?.label ?? filter[1]} filter`} className="grid size-7 place-items-center rounded hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-10">
            {sortOrder === "ASC" ? <ArrowUpAZ className="size-4" /> : <ArrowDownAZ className="size-4" />}
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 w-56 overflow-y-auto">
          <DropdownMenuLabel>Sort records</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {fields.map((field) => (
            <DropdownMenuItem key={field.fieldname} onSelect={() => handleSort(field.fieldname, sortField === field.fieldname && sortOrder === "DESC" ? "ASC" : "DESC")}>
              {sortField === field.fieldname ? <Check className="size-4 text-primary" /> : <span className="size-4" />}
              <span className="flex-1 truncate">{field.label ?? field.fieldname}</span>
              {sortField === field.fieldname ? (sortOrder === "ASC" ? "A–Z" : "Z–A") : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasControls ? (
        <Button type="button" variant="ghost" size="icon" onClick={handleReset} aria-label="Clear filters and sorting">
          <RotateCcw className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
