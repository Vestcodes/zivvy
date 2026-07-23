"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Ban, CheckCircle2, Pencil, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldView } from "@/components/auto/field-view";
import { FieldInput } from "@/components/auto/field-input";
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import type { DoctypeMeta, FormGroup } from "@/lib/frappe-meta";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  initialDoc: Record<string, unknown>;
  basePath: string;
  title: string;
}

const DOCSTATUS_LABEL: Record<number, string> = {
  0: "Draft",
  1: "Submitted",
  2: "Cancelled"
};

const DOCSTATUS_BADGE: Record<number, string> = {
  0: "bg-secondary text-secondary-foreground border-transparent",
  1: "bg-primary text-primary-foreground border-transparent",
  2: "bg-muted text-muted-foreground border-transparent"
};

export function AutoFormClient({ meta, groups, initialDoc, basePath, title }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<Record<string, unknown>>(initialDoc);
  const isNewInitial = initialDoc.__islocal === 1 || !initialDoc.name;
  const [editing, setEditing] = useState(isNewInitial);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const docstatus = Number((doc.docstatus as number | undefined) ?? 0);
  const isNew = doc.__islocal === 1 || !doc.name;

  function updateField(fieldname: string, value: unknown) {
    setDoc((prev) => ({ ...prev, [fieldname]: value }));
  }

  async function onSave() {
    setSaving(true);
    try {
      const method = isNew ? "frappe.client.insert" : "frappe.client.save";
      const result = await frappeCall<{ name?: string }>(method, {
        doc: JSON.stringify({ ...doc, doctype: meta.name })
      });
      toast.success(isNew ? "Created" : "Saved");
      setEditing(false);
      if (isNew && result?.name) {
        router.push(`${basePath}/${encodeURIComponent(result.name)}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      await frappeCall("frappe.client.submit", {
        doc: JSON.stringify({ ...doc, doctype: meta.name })
      });
      toast.success("Submitted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel() {
    if (!doc.name) return;
    setCanceling(true);
    try {
      await frappeCall("frappe.client.cancel", {
        doctype: meta.name,
        name: doc.name as string
      });
      toast.success("Cancelled");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Cancel failed.");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={basePath}>
                <ArrowLeft />
              </Link>
            </Button>
            <span className="truncate">{title}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="truncate font-display text-2xl tracking-tight sm:text-3xl">
              {isNew ? `New ${title.replace(/s$/, "").toLowerCase()}` : String(doc.name)}
            </h1>
            {meta.is_submittable && !isNew && (
              <Badge className={DOCSTATUS_BADGE[docstatus] ?? DOCSTATUS_BADGE[0]}>
                {DOCSTATUS_LABEL[docstatus] ?? String(docstatus)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!editing && !isNew && (
            <Button variant="outline" onClick={() => setEditing(true)} disabled={docstatus === 2}>
              <Pencil />
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                <X />
                Discard
              </Button>
              <Button variant="polished" onClick={onSave} disabled={saving}>
                <Save />
                {saving ? "Saving…" : isNew ? "Create" : "Save"}
              </Button>
            </>
          )}
          {!editing && meta.is_submittable && docstatus === 0 && !isNew && (
            <Button variant="polished" onClick={onSubmit} disabled={submitting}>
              <CheckCircle2 />
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
          {!editing && meta.is_submittable && docstatus === 1 && (
            <Button variant="outline" onClick={onCancel} disabled={canceling}>
              <Ban />
              {canceling ? "Cancelling…" : "Cancel"}
            </Button>
          )}
        </div>
      </div>

      {groups.map((section) => (
        <Card key={section.label} className="border-border/70 bg-card shadow-sm">
          <CardContent className="space-y-4 py-6">
            {section.label && (
              <h2 className="font-display text-lg tracking-tight">{section.label}</h2>
            )}
            <div
              className={
                section.columns.length > 1
                  ? "grid gap-6 md:grid-cols-2"
                  : "grid gap-6"
              }
            >
              {section.columns.map((col, i) => (
                <div key={i} className="grid gap-4">
                  {col.fields.map((f) => (
                    editing ? (
                      <FieldInput
                        key={f.fieldname}
                        field={f}
                        value={doc[f.fieldname]}
                        onChange={(v) => updateField(f.fieldname, v)}
                      />
                    ) : (
                      <FieldView key={f.fieldname} field={f} value={doc[f.fieldname]} />
                    )
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
