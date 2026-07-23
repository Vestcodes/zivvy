import { cookies } from "next/headers";

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

const DEV_MOCK =
  process.env.NEXT_PUBLIC_ZIVVY_DEV_MOCK === "1" ||
  process.env.ZIVVY_DEV_MOCK === "1";

export interface DocField {
  fieldname: string;
  label?: string;
  fieldtype: string;
  options?: string;
  in_list_view?: 0 | 1;
  in_standard_filter?: 0 | 1;
  reqd?: 0 | 1;
  read_only?: 0 | 1;
  hidden?: 0 | 1;
  default?: unknown;
  precision?: string | number;
  width?: number;
  translatable?: 0 | 1;
  is_virtual?: 0 | 1;
}

export interface DoctypeMeta {
  name: string;
  module?: string;
  fields: DocField[];
  is_submittable?: 0 | 1;
  istable?: 0 | 1;
  issingle?: 0 | 1;
  title_field?: string;
  search_fields?: string;
  sort_field?: string;
  sort_order?: "ASC" | "DESC";
  autoname?: string;
}

async function frappeServerCall<T = unknown>(
  method: string,
  body?: Record<string, string | number | boolean | undefined>
): Promise<T | null> {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;
  if (!sid && !DEV_MOCK) return null;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body ?? {})) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }

  try {
    const res = await fetch(`${FRAPPE_ORIGIN}/api/method/${method}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: cookieHeader
      },
      body: params.toString()
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: T } & Record<string, unknown>;
    // Most Frappe RPCs wrap the result in `{ message: ... }`, but some
    // desk/form endpoints (getdoctype, getdoc) return `{ docs: [...] }`
    // directly. Return message when present; otherwise fall back to the
    // full envelope.
    if (json && typeof json === "object" && "message" in json) {
      return (json.message ?? null) as T | null;
    }
    return json as unknown as T;
  } catch {
    return null;
  }
}

export async function getDoctypeMeta(doctype: string): Promise<DoctypeMeta | null> {
  const res = await frappeServerCall<{ docs: DoctypeMeta[] }>(
    "frappe.desk.form.load.getdoctype",
    { doctype, with_parent: 1 }
  );
  if (!res?.docs) return null;
  return res.docs.find((d) => d.name === doctype) ?? res.docs[0] ?? null;
}

export interface ListRow {
  name: string;
  [key: string]: unknown;
}

export async function reportviewGet(opts: {
  doctype: string;
  fields?: string[];
  filters?: Array<[string, string, string, string | number | boolean]> | Record<string, unknown>;
  order_by?: string;
  start?: number;
  page_length?: number;
}): Promise<{ values: ListRow[]; keys: string[] } | null> {
  // Use frappe.client.get_list — simpler shape (array of dicts) and always
  // returns even when there are no rows (as `[]`).
  const fields = opts.fields ?? ["name"];
  const filters = opts.filters ? JSON.stringify(opts.filters) : undefined;
  const orderBy = opts.order_by
    // reportview-style backticks aren't accepted by client.get_list — strip
    ?.replace(/`tab[^`]+`\.`([^`]+)`/g, "$1");
  const res = await frappeServerCall<Record<string, unknown>[]>(
    "frappe.client.get_list",
    {
      doctype: opts.doctype,
      fields: JSON.stringify(fields),
      filters,
      order_by: orderBy,
      limit_start: opts.start ?? 0,
      limit_page_length: opts.page_length ?? 20
    }
  );
  if (!Array.isArray(res)) return null;
  const rows: ListRow[] = res.map((r) => ({
    name: String(r.name ?? ""),
    ...(r as Record<string, unknown>)
  }));
  return { values: rows, keys: fields };
}

export async function frappeGetCount(
  doctype: string,
  filters?: Record<string, unknown>
): Promise<number> {
  const res = await frappeServerCall<number>("frappe.client.get_count", {
    doctype,
    filters: filters ? JSON.stringify(filters) : undefined
  });
  return typeof res === "number" ? res : 0;
}

export async function getDoc(doctype: string, name: string): Promise<Record<string, unknown> | null> {
  const res = await frappeServerCall<{ docs: Record<string, unknown>[] }>(
    "frappe.desk.form.load.getdoc",
    { doctype, name }
  );
  const docs = res?.docs;
  if (!Array.isArray(docs)) return null;
  return docs.find((d) => (d as { doctype?: string }).doctype === doctype) ?? docs[0] ?? null;
}

export interface FormGroup {
  kind: "section";
  label: string;
  columns: FormColumn[];
}

export interface FormColumn {
  kind: "column";
  fields: DocField[];
}

/** Fields that never make sense on the user-facing form (system/audit/tenant). */
const HIDDEN_FIELDS = new Set<string>([
  "zivvy_tenant",   // Zivvy tenant stamp — server-managed
  "owner",
  "modified",
  "modified_by",
  "creation",
  "docstatus",
  "idx",
  "amended_from",
  "amendment_date",
  "lft",
  "rgt",
  "old_parent"
]);

export function groupFieldsForForm(
  meta: DoctypeMeta,
  opts: { isNew?: boolean } = {}
): FormGroup[] {
  const sections: FormGroup[] = [];
  let currentSection: FormGroup | null = null;
  let currentCol: FormColumn | null = null;

  function startSection(label: string) {
    currentSection = { kind: "section", label, columns: [] };
    sections.push(currentSection);
    currentCol = null;
  }

  function startColumn() {
    if (!currentSection) startSection("Details");
    currentCol = { kind: "column", fields: [] };
    currentSection!.columns.push(currentCol);
  }

  for (const f of meta.fields) {
    if (f.hidden) continue;
    if (HIDDEN_FIELDS.has(f.fieldname)) continue;
    // On create, hide read-only fields entirely — they'll be filled by the
    // server (e.g. auto-name series, computed full_name).
    if (opts.isNew && f.read_only === 1) continue;

    if (f.fieldtype === "Section Break") {
      startSection(f.label ?? "");
      continue;
    }
    if (f.fieldtype === "Column Break") {
      startColumn();
      continue;
    }
    if (f.fieldtype === "Tab Break") {
      startSection(f.label ?? "");
      continue;
    }
    if (["Table", "Table MultiSelect", "HTML", "Break"].includes(f.fieldtype)) {
      continue;
    }
    if (!currentSection) startSection("Details");
    if (!currentCol) startColumn();
    currentCol!.fields.push(f);
  }

  return sections.filter((s) => s.columns.some((c) => c.fields.length > 0));
}

export function listViewFields(meta: DoctypeMeta): DocField[] {
  const explicit = meta.fields.filter((f) => f.in_list_view === 1 && !f.hidden);
  if (explicit.length > 0) return explicit;
  // Fallback: pick likely useful fields
  return meta.fields.filter((f) => {
    if (f.hidden) return false;
    if (f.is_virtual) return false;
    return [
      "Data", "Link", "Select", "Currency", "Float", "Int",
      "Date", "Datetime", "Percent", "Check"
    ].includes(f.fieldtype);
  }).slice(0, 5);
}
