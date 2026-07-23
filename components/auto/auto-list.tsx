import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getDoctypeMeta,
  listViewFields,
  reportviewGet
} from "@/lib/frappe-meta";

interface Props {
  doctype: string;
  basePath: string;             // e.g. "/sales/invoices"
  title: string;
  filters?: Array<[string, string, string, string | number | boolean]>;
  pageLength?: number;
}

export async function AutoList({ doctype, basePath, title, filters, pageLength = 25 }: Props) {
  const meta = await getDoctypeMeta(doctype);

  if (!meta) {
    return <AutoListSkeleton title={title} basePath={basePath} reason="unavailable" />;
  }

  const listFields = listViewFields(meta);
  const fieldNames = ["name", ...listFields.map((f) => f.fieldname).filter((f) => f !== "name")];
  const orderBy = meta.sort_field
    ? `\`tab${doctype}\`.\`${meta.sort_field}\` ${meta.sort_order ?? "DESC"}`
    : `\`tab${doctype}\`.\`modified\` DESC`;

  const list = await reportviewGet({
    doctype,
    fields: fieldNames,
    filters,
    order_by: orderBy,
    page_length: pageLength
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {meta.is_submittable ? "Submittable · " : ""}
            {doctype}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-9 w-56 pl-8" />
          </div>
          <Button asChild variant="polished" size="sm">
            <Link href={`${basePath}/new`}>
              <Plus />
              New
            </Link>
          </Button>
        </div>
      </header>

      {!list || list.values.length === 0 ? (
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
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.values.map((row) => {
                const rowHref = `${basePath}/${encodeURIComponent(String(row.name))}`;
                return (
                  <TableRow key={String(row.name)} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={rowHref}
                        className="block font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {String(row.name)}
                      </Link>
                    </TableCell>
                    {listFields
                      .filter((f) => f.fieldname !== "name")
                      .map((f) => (
                        <TableCell key={f.fieldname} className="text-sm">
                          <FieldCell field={f} value={row[f.fieldname]} />
                        </TableCell>
                      ))}
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <footer className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {list?.values.length ?? 0} of ~
          {list?.values.length === pageLength ? "many" : list?.values.length ?? 0}
        </span>
        <span className="font-mono">Page 1</span>
      </footer>
    </div>
  );
}
