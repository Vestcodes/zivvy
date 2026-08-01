import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AutoListRowActions } from "@/components/auto/auto-list-row-actions";
import { FieldCell } from "@/components/auto/field-cell";
import { toneForStatus } from "@/lib/status";
import type { DocField } from "@/lib/frappe-meta";
import { cn } from "@/lib/utils";

interface Row {
  name: string;
  [k: string]: unknown;
}

interface Props {
  rows: Row[];
  statusField: string;
  titleField: string | null;
  listFields: DocField[];
  basePath: string;
  currency: string;
}

/** Ordered priority so the same tone gets the same column ordering across
 *  every doctype (Open → In Progress → Waiting → Done, etc.). Anything the
 *  matcher doesn't recognise gets grouped under 'Other'. */
const TONE_ORDER = ["warning", "progress", "info", "success", "danger", "neutral"] as const;
const OTHER = "__other__";

function groupRowsByStatus(rows: Row[], statusField: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const raw = row[statusField];
    const key = typeof raw === "string" && raw.length > 0 ? raw : OTHER;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }
  return groups;
}

function sortStatusKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    if (a === OTHER) return 1;
    if (b === OTHER) return -1;
    const ta = TONE_ORDER.indexOf(toneForStatus(a));
    const tb = TONE_ORDER.indexOf(toneForStatus(b));
    if (ta !== tb) return ta - tb;
    return a.localeCompare(b);
  });
}

/**
 * Board view — rows grouped into columns by their status field. Columns are
 * fully static (no drag-and-drop yet) but the layout is proper kanban:
 * horizontal scroll on narrow viewports, sticky column headers.
 */
export function AutoListBoard({
  rows,
  statusField,
  titleField,
  listFields,
  basePath,
  currency
}: Props) {
  const groups = groupRowsByStatus(rows, statusField);
  const keys = sortStatusKeys(Array.from(groups.keys()));

  // Detail fields shown under the title in each card — drop the status field
  // itself + name (that's already the card headline).
  const cardFields = listFields
    .filter((f) => f.fieldname !== "name" && f.fieldname !== statusField)
    .slice(0, 3);

  return (
    <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:mx-0">
      {keys.map((key) => {
        const bucket = groups.get(key) ?? [];
        const label = key === OTHER ? "Other" : key;
        return (
          <section
            key={key}
            className="flex w-72 shrink-0 snap-start flex-col rounded-xl border border-border/70 bg-secondary/40 shadow-none"
            aria-label={`${label} (${bucket.length})`}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-xl border-b border-border/60 bg-secondary/70 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <StatusBadge status={label} tone={key === OTHER ? "neutral" : toneForStatus(label)} />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {bucket.length}
              </span>
            </header>
            <div className="flex flex-col gap-2 p-2">
              {bucket.map((row) => {
                const href = `${basePath}/${encodeURIComponent(String(row.name))}`;
                const label = titleField && row[titleField]
                  ? String(row[titleField])
                  : String(row.name);
                return (
                  <article
                    key={String(row.name)}
                    className={cn(
                      "group rounded-lg border border-border/70 bg-card p-3 shadow-sm",
                      "transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={href}
                        className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="block truncate text-sm font-medium text-foreground">
                          {label}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                          {String(row.name)}
                        </span>
                      </Link>
                      <AutoListRowActions href={href} name={String(row.name)} />
                    </div>
                    {cardFields.length > 0 && (
                      <dl className="mt-2 grid gap-1 border-t border-border/60 pt-2">
                        {cardFields.map((field) => (
                          <div key={field.fieldname} className="flex items-center justify-between gap-2 text-xs">
                            <dt className="truncate text-muted-foreground">
                              {field.label ?? field.fieldname}
                            </dt>
                            <dd className="min-w-0 truncate text-right">
                              <FieldCell
                                field={field}
                                value={row[field.fieldname]}
                                currency={currency}
                              />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <Link
                      href={href}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary"
                      aria-hidden
                      tabIndex={-1}
                    >
                      Open <ChevronRight className="size-3" />
                    </Link>
                  </article>
                );
              })}
              {bucket.length === 0 && (
                <p className="rounded-lg border border-dashed border-border/60 bg-transparent p-3 text-center text-xs text-muted-foreground">
                  Empty
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
