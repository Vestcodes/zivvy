/**
 * Progressive form density.
 *
 * Instead of dumping every field in a wall (Frappe's default), split the form
 * into two tiers: "essential" (shown by default) and "detail" (folded behind
 * a "Show all fields" toggle). Users pick the right level of detail for the
 * task at hand — 90% of the time they're editing 2-3 fields, not 40.
 *
 * Essential = required fields + status/title fields + the first N link fields.
 * Detail = everything else.
 */

import type { DocField } from "@/lib/frappe-meta";

interface FormGroup {
  kind: "section";
  label: string;
  columns: Array<{ kind: "column"; fields: DocField[] }>;
}

/** Essential-priority field names (case-insensitive). Always shown expanded. */
const ALWAYS_ESSENTIAL = new Set([
  "customer",
  "supplier",
  "party",
  "contact",
  "lead",
  "status",
  "posting_date",
  "due_date",
  "date",
  "transaction_date",
  "amount",
  "grand_total",
  "total",
  "subject",
  "title",
  "description",
  "first_name",
  "last_name",
  "full_name",
  "email",
  "email_id",
  "phone",
  "item_code",
  "item_name",
  "item_group",
  "warehouse",
  "company",
  "currency",
  "project",
  "employee_name",
  "designation"
]);

/** How many additional non-required fields to promote per section. */
const EXTRA_PROMOTIONS_PER_SECTION = 3;

interface DensifiedGroup {
  label: string;
  columns: Array<{
    fields: Array<{ field: DocField; tier: "essential" | "detail" }>;
  }>;
  hasDetail: boolean;
  essentialCount: number;
  detailCount: number;
}

export interface DensifiedForm {
  sections: DensifiedGroup[];
  totalEssential: number;
  totalDetail: number;
}

/**
 * Classify every field in the pre-grouped form into essential/detail tiers.
 * Preserves section + column structure so the visual layout stays intact.
 */
export function densifyForm(groups: FormGroup[]): DensifiedForm {
  const sections: DensifiedGroup[] = [];
  let totalEssential = 0;
  let totalDetail = 0;

  for (const section of groups) {
    let sectionEssentialCount = 0;
    let sectionDetailCount = 0;

    const densifiedCols = section.columns.map((col) => {
      let extraSlots = EXTRA_PROMOTIONS_PER_SECTION;
      return {
        fields: col.fields.map((field) => {
          const tier = classifyField(field, extraSlots);
          if (tier === "essential") {
            if (!isDefinitelyEssential(field)) extraSlots--;
            sectionEssentialCount++;
          } else {
            sectionDetailCount++;
          }
          return { field, tier };
        })
      };
    });

    sections.push({
      label: section.label,
      columns: densifiedCols,
      hasDetail: sectionDetailCount > 0,
      essentialCount: sectionEssentialCount,
      detailCount: sectionDetailCount
    });
    totalEssential += sectionEssentialCount;
    totalDetail += sectionDetailCount;
  }

  return { sections, totalEssential, totalDetail };
}

function isDefinitelyEssential(field: DocField): boolean {
  if (field.reqd === 1) return true;
  if (ALWAYS_ESSENTIAL.has(field.fieldname.toLowerCase())) return true;
  return false;
}

function classifyField(field: DocField, extraSlotsAvailable: number): "essential" | "detail" {
  if (isDefinitelyEssential(field)) return "essential";
  // Promote a few Link fields even if not required — they're usually the
  // "who/what" columns operators care about.
  if (extraSlotsAvailable > 0 && field.fieldtype === "Link") return "essential";
  // Promote money + date fields lightly.
  if (extraSlotsAvailable > 0 && ["Currency", "Date", "Datetime"].includes(field.fieldtype)) {
    return "essential";
  }
  return "detail";
}
