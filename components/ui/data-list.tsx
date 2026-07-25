import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DataListAlign = "left" | "right" | "center";

export interface DataListColumn<T> {
  /** Stable key for React and for the sort URL param. */
  key: string;
  /** Header label. */
  header: React.ReactNode;
  /** Optional extra classes on the <TableCell>. */
  className?: string;
  /** Optional extra classes on the <TableHead>. */
  headerClassName?: string;
  /** Column alignment. Defaults to "left". */
  align?: DataListAlign;
  /** Cell renderer. */
  cell: (row: T, index: number) => React.ReactNode;
  /** Field to write to ?sort= when the header is clicked. */
  sortKey?: string;
}

export interface DataListProps<T> {
  columns: Array<DataListColumn<T>>;
  rows: T[];
  /** Unique row key. Defaults to (row as any).name ?? index. */
  rowKey?: (row: T, index: number) => string | number;
  loading?: boolean;
  loadingRowCount?: number;
  /** Rendered inside the Card when rows.length === 0 && !loading. */
  emptyState?: React.ReactNode;
  /** Right-pinned actions column (dropdown menu, buttons, etc). */
  rowActions?: (row: T, index: number) => React.ReactNode;
  /** If provided, clicking the row calls this (nav happens via <Link> when possible). */
  onRowClick?: (row: T, index: number) => void;
  /** Optional selection column: if provided, receives (row, checked). */
  onRowSelect?: (row: T, checked: boolean) => void;
  isRowSelected?: (row: T) => boolean;
  /** When true, we render a leading checkbox column. */
  selectable?: boolean;
  /** Sort state driven by the parent (usually from URL). */
  sort?: { key: string; order: "asc" | "desc" } | null;
  /** Called when the user clicks a sortable header. */
  onSortChange?: (key: string, order: "asc" | "desc") => void;
  /** Extra classes on the outer Card. */
  className?: string;
  /** Sticky header — enable when the table sits inside a scroll container. */
  stickyHeader?: boolean;
}

function alignClass(align: DataListAlign | undefined, isHead = false): string {
  switch (align) {
    case "right":
      return isHead ? "text-right" : "text-right";
    case "center":
      return "text-center";
    default:
      return "text-left";
  }
}

export function DataList<T>({
  columns,
  rows,
  rowKey,
  loading,
  loadingRowCount = 5,
  emptyState,
  rowActions,
  onRowClick,
  onRowSelect,
  isRowSelected,
  selectable,
  sort,
  onSortChange,
  className,
  stickyHeader,
}: DataListProps<T>) {
  const hasActions = Boolean(rowActions);
  const hasSelect = Boolean(selectable);
  const colCount = columns.length + (hasSelect ? 1 : 0) + (hasActions ? 1 : 0);

  const headerCells = (
    <TableRow
      className={cn(
        "bg-secondary/40 hover:bg-secondary/40 border-b",
        stickyHeader && "sticky top-0 z-10"
      )}
    >
      {hasSelect ? (
        <TableHead className="w-8 font-medium">
          <span className="sr-only">Select</span>
        </TableHead>
      ) : null}
      {columns.map((col) => {
        const sortable = Boolean(col.sortKey && onSortChange);
        const isActive = sort?.key === col.sortKey;
        const nextOrder: "asc" | "desc" = isActive && sort?.order === "asc" ? "desc" : "asc";
        return (
          <TableHead
            key={col.key}
            className={cn(
              "font-medium",
              alignClass(col.align, true),
              sortable && "cursor-pointer select-none hover:text-foreground",
              col.headerClassName
            )}
            onClick={
              sortable
                ? () => onSortChange!(col.sortKey!, nextOrder)
                : undefined
            }
            aria-sort={
              !sortable
                ? undefined
                : isActive
                  ? sort?.order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
            }
          >
            <span className="inline-flex items-center gap-1">
              {col.header}
              {sortable && isActive ? (
                <span aria-hidden className="text-xs text-muted-foreground">
                  {sort?.order === "asc" ? "▲" : "▼"}
                </span>
              ) : null}
            </span>
          </TableHead>
        );
      })}
      {hasActions ? <TableHead className="w-8" /> : null}
    </TableRow>
  );

  const body = loading ? (
    Array.from({ length: loadingRowCount }).map((_, i) => (
      <TableRow key={`skeleton-${i}`} className="border-b">
        {hasSelect ? (
          <TableCell>
            <Skeleton className="h-4 w-4 rounded" />
          </TableCell>
        ) : null}
        {columns.map((c) => (
          <TableCell key={c.key} className={cn(alignClass(c.align), c.className)}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        ))}
        {hasActions ? (
          <TableCell>
            <Skeleton className="h-4 w-4 rounded" />
          </TableCell>
        ) : null}
      </TableRow>
    ))
  ) : rows.length === 0 ? (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colCount} className="p-0">
        {emptyState ?? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nothing to show.
          </div>
        )}
      </TableCell>
    </TableRow>
  ) : (
    rows.map((row, i) => {
      const key = rowKey ? rowKey(row, i) : ((row as { name?: string | number }).name ?? i);
      const selected = isRowSelected?.(row) ?? false;
      return (
        <TableRow
          key={key}
          data-state={selected ? "selected" : undefined}
          className={cn(
            "group border-b transition-colors hover:bg-muted/40",
            onRowClick && "cursor-pointer"
          )}
          onClick={onRowClick ? () => onRowClick(row, i) : undefined}
        >
          {hasSelect ? (
            <TableCell onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                role="checkbox"
                checked={selected}
                onChange={(e) => onRowSelect?.(row, e.target.checked)}
                className="size-4 accent-primary"
              />
            </TableCell>
          ) : null}
          {columns.map((c) => (
            <TableCell
              key={c.key}
              className={cn(alignClass(c.align), c.className)}
            >
              {c.cell(row, i)}
            </TableCell>
          ))}
          {hasActions ? (
            <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
              {rowActions!(row, i)}
            </TableCell>
          ) : null}
        </TableRow>
      );
    })
  );

  return (
    <Card className={cn("border-border/70 bg-card p-0 shadow-sm", className)}>
      <Table>
        <TableHeader>{headerCells}</TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </Card>
  );
}
