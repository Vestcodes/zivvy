/**
 * Small-enumeration doctypes — Frappe stores them as Link doctypes but
 * their row count is tiny (usually < 20), so the search-autocomplete UI
 * is pure friction. We render them as a shadcn Select instead.
 *
 * Adding a doctype here trades one round-trip on mount (get_list of all
 * rows) for zero-search UX. Only add doctypes where the population is
 * bounded and slow-growing — never Item, Customer, User, etc.
 */

export const ENUM_LIKE_DOCTYPES = new Set<string>([
  "Salutation",
  "Gender",
  "Language",
  "Country",
  "Currency",
  "UOM",
  "Employment Type",
  "Department",
  "Designation",
  "Employee Grade",
  "Branch",
  "Leave Type",
  "Marital Status",
  "Blood Group",
  "Warehouse Type",
  "Item Group",
  "Stock UOM",
  "Territory",
  "Customer Group",
  "Supplier Group",
  "Sales Person",
  "Print Style",
  "Print Format",
  "Letter Head",
  "Payment Term",
  "Mode of Payment",
  "Tax Category"
]);

export function isEnumLikeDoctype(doctype: string): boolean {
  return ENUM_LIKE_DOCTYPES.has(doctype);
}
