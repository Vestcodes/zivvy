import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { FieldCell } from "@/components/auto/field-cell";
import { AutoListEmpty } from "@/components/auto/auto-list-empty";
import { AutoListSkeleton } from "@/components/auto/auto-list-skeleton";
import { AutoListSearch } from "@/components/auto/auto-list-search";
import { AutoListPagination } from "@/components/auto/auto-list-pagination";
import { UpgradeRequired } from "@/components/upgrade-required";
import {
  frappeGetCount,
  getDoctypeMeta,
  listViewFields,
  reportviewGet
} from "@/lib/frappe-meta";
import { fetchBootinfo } from "@/lib/boot-server";
import { tierAtLeast } from "@/lib/boot-types";

interface Props {
  doctype: string;
  basePath: string;             // e.g. "/sales/invoices"
  title: string;
  filters?: Array<[string, string, string, string | number | boolean]>;
  pageLength?: number;
  searchParams?: { q?: string; page?: string; size?: string };
}

export async function AutoList({
  doctype,
  basePath,
  title,
  filters: baseFilters,
  pageLength = 25,
  searchParams = {}
}: Props) {
  // Tier gate FIRST — before any fetches.
  const boot = await fetchBootinfo();
  const zivvy = boot.zivvy;
  const requiredTier = zivvy?.doctype_min_tier?.[doctype];
  if (requiredTier && zivvy && !tierAtLeast(zivvy.tier, requiredTier)) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{doctype}</p>
        </header>
        <UpgradeRequired featureName={title} requiredTier={requiredTier} />
      </div>
    );
  }

  const meta = await getDoctypeMeta(doctype);

  if (!meta) {
    return <AutoListSkeleton title={title} basePath={basePath} reason="unavailable" />;
  }

  const listFields = listViewFields(meta);
  const fieldNames = ["name", ...listFields.map((f) => f.fieldname).filter((f) => f !== "name")];
  const orderBy = meta.sort_field
    ? `\`tab${doctype}\`.\`${meta.sort_field}\` ${meta.sort_order ?? "DESC"}`
    : `\`tab${doctype}\`.\`modified\` DESC`;

  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const size = Math.max(5, Math.min(200, Number(searchParams.size ?? pageLength) || pageLength));

  // Build filters: base filters + optional search on `name` field
  const filters: Array<[string, string, string, string | number | boolean]> = [
    ...(baseFilters ?? [])
  ];
  if (q) {
    filters.push([doctype, "name", "like", `%${q}%`]);
  }

  const [list, count] = await Promise.all([
    reportviewGet({
      doctype,
      fields: fieldNames,
      filters: filters.length > 0 ? filters : undefined,
      order_by: orderBy,
      start: (page - 1) * size,
      page_length: size
    }),
    frappeGetCount(doctype, filters.length > 0 ? Object.fromEntries(
      filters.map(([, field, op, val]) => [field, op === "=" ? val : [op, val]])
    ) : undefined)
  ]);

  const shownOnPage = list?.values.length ?? 0;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {meta.is_submittable ? "Submittable · " : ""}
            {doctype}
            {q && (
              <>
                {" "}
                · <span className="font-mono">matching "{q}"</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AutoListSearch placeholder={`Search ${title.toLowerCase()}…`} />
          <Button asChild variant="polished" size="sm">
            <Link href={`${basePath}/new`}>
              <Plus />
              New
            </Link>
          </Button>
        </div>
      </header>

      {!list || shownOnPage === 0 ? (
        <AutoListEmpty
          title={title}
          basePath={basePath}
          reason={list ? "empty" : "unavailable"}
        />
      ) : (
        <Card className="border-border/70 bg-card p-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-[240px] font-medium">Name</TableHead>
                {listFields
                  .filter((f) => f.fieldname !== "name")
                  .map((f) => (
                    <TableHead key={f.fieldname} className="font-medium">
                      {f.label ?? f.fieldname}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.values.map((row) => {
                const rowHref = `${basePath}/${encodeURIComponent(String(row.name))}`;
                return (
                  <TableRow
                    key={String(row.name)}
                    className="group relative cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <Link
                        href={rowHref}
                        className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
                      >
                        {String(row.name)}
                        <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    </TableCell>
                    {listFields
                      .filter((f) => f.fieldname !== "name")
                      .map((f) => (
                        <TableCell key={f.fieldname} className="text-sm">
                          <FieldCell field={f} value={row[f.fieldname]} />
                        </TableCell>
                      ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AutoListPagination page={page} pageSize={size} total={count} shownOnPage={shownOnPage} />
    </div>
  );
}
