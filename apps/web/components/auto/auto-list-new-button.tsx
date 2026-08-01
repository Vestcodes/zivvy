"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewRecordWizard } from "@/components/auto/auto-form-wizard";
import type { DoctypeMeta, FormGroup } from "@/lib/frappe-meta";
import { singular } from "@/lib/next-action";

/** Dispatched by keyboard / empty-state CTAs on the same list page. */
export const OPEN_NEW_EVENT = "zivvy:open-new";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  basePath: string;
  title: string;
  /** When true (e.g. landed via `?new=1`), open the wizard immediately. */
  defaultOpen?: boolean;
}

/**
 * The "New" button rendered on list-page headers. Opens the stepped wizard
 * modal instead of navigating to /new. On success it refreshes the list so
 * the new row shows up.
 */
export function AutoListNewButton({
  meta,
  groups,
  basePath,
  title,
  defaultOpen = false
}: Props) {
  const router = useRouter();
  const singularTitle = singular(title).toLowerCase();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_NEW_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_NEW_EVENT, onOpen);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("new")) {
        url.searchParams.delete("new");
        const qs = url.searchParams.toString();
        router.replace(qs ? `${url.pathname}?${qs}` : url.pathname, {
          scroll: false
        });
      }
    }
  }

  return (
    <NewRecordWizard
      meta={meta}
      groups={groups}
      basePath={basePath}
      title={title}
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => {
        // Refresh the list — keeps user on the list page instead of jumping
        // into the freshly created record. The wizard already showed a
        // success toast.
        router.refresh();
      }}
      trigger={
        <Button variant="polished" size="sm">
          <Plus />
          New {singularTitle}
        </Button>
      }
    />
  );
}

/** Open the list-page create wizard without leaving the page. */
export function requestOpenNew() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_NEW_EVENT));
}
