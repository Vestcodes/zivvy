"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewRecordWizard } from "@/components/auto/auto-form-wizard";
import type { DoctypeMeta, FormGroup } from "@/lib/frappe-meta";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  basePath: string;
  title: string;
}

/**
 * The "New" button rendered on list-page headers. Opens the stepped wizard
 * modal instead of navigating to /new. On success it refreshes the list so
 * the new row shows up.
 */
export function AutoListNewButton({ meta, groups, basePath, title }: Props) {
  const router = useRouter();
  const singular = title.replace(/s$/, "").toLowerCase();

  return (
    <NewRecordWizard
      meta={meta}
      groups={groups}
      basePath={basePath}
      title={title}
      onCreated={() => {
        // Refresh the list — keeps user on the list page instead of jumping
        // into the freshly created record. The wizard already showed a
        // success toast.
        router.refresh();
      }}
      trigger={
        <Button variant="polished" size="sm">
          <Plus />
          New {singular}
        </Button>
      }
    />
  );
}
