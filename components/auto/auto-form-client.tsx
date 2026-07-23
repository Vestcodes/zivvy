"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { docstatusLabel, toneForDocstatus } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { FieldView } from "@/components/auto/field-view";
import { FieldInput } from "@/components/auto/field-input";
import { ActivityTimeline } from "@/components/auto/activity-timeline";
import { PrintButton } from "@/components/auto/print-preview";
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import type { DoctypeMeta, FormGroup } from "@/lib/frappe-meta";
import { cn } from "@/lib/utils";
import { parseFrappeError, EMPTY_ERRORS, type ParsedFormError } from "@/lib/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  initialDoc: Record<string, unknown>;
  basePath: string;
  title: string;
}


function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (a[k] !== b[k]) {
      // Coerce nullish → same for empty-vs-null equality.
      const av = a[k] ?? null;
      const bv = b[k] ?? null;
      if (av !== bv) return false;
    }
  }
  return true;
}

type DialogKind = null | "discard" | "submit" | "cancel";

export function AutoFormClient({ meta, groups, initialDoc, basePath, title }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<Record<string, unknown>>(initialDoc);
  const initialRef = useRef(initialDoc);
  const isNewInitial = initialDoc.__islocal === 1 || !initialDoc.name;
  const [editing, setEditing] = useState(isNewInitial);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [errors, setErrors] = useState<ParsedFormError>(EMPTY_ERRORS);

  const docstatus = Number((doc.docstatus as number | undefined) ?? 0);
  const isNew = doc.__islocal === 1 || !doc.name;
  const dirty = useMemo(() => editing && !shallowEqual(doc, initialRef.current), [doc, editing]);

  const updateField = useCallback((fieldname: string, value: unknown) => {
    setDoc((prev) => ({ ...prev, [fieldname]: value }));
    // Clear this field's error the moment the user edits it
    setErrors((prev) => {
      if (!prev.fieldErrors[fieldname]) return prev;
      const next = { ...prev.fieldErrors };
      delete next[fieldname];
      return { ...prev, fieldErrors: next, hasFieldErrors: Object.keys(next).length > 0 };
    });
  }, []);

  const scrollToFirstError = useCallback((parsed: ParsedFormError) => {
    const first = Object.keys(parsed.fieldErrors)[0];
    if (!first) return;
    // Defer to next tick so the error renders first
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea, [data-field="${first}"] [role="combobox"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    });
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    setErrors(EMPTY_ERRORS);
    try {
      const method = isNew ? "frappe.client.insert" : "frappe.client.save";
      const result = await frappeCall<{ name?: string }>(method, {
        doc: JSON.stringify({ ...doc, doctype: meta.name })
      });
      setEditing(false);
      setJustSaved(true);
      initialRef.current = { ...doc, ...(result?.name ? { name: result.name } : {}) };
      if (isNew && result?.name) {
        router.push(`${basePath}/${encodeURIComponent(result.name)}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      const parsed = parseFrappeError(err);
      setErrors(parsed);
      if (parsed.hasFieldErrors) {
        scrollToFirstError(parsed);
      } else if (parsed.formError) {
        toast.error(parsed.formError);
      } else {
        toast.error("Save failed.");
      }
    } finally {
      setSaving(false);
    }
  }, [doc, isNew, meta.name, basePath, router, scrollToFirstError]);

  const onSubmitDoc = useCallback(async () => {
    setSubmitting(true);
    setDialog(null);
    setErrors(EMPTY_ERRORS);
    try {
      await frappeCall("frappe.client.submit", {
        doc: JSON.stringify({ ...doc, doctype: meta.name })
      });
      toast.success("Submitted");
      router.refresh();
    } catch (err) {
      const parsed = parseFrappeError(err);
      setErrors(parsed);
      if (parsed.hasFieldErrors) {
        scrollToFirstError(parsed);
      } else {
        toast.error(parsed.formError ?? "Submit failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [doc, meta.name, router, scrollToFirstError]);

  const onCancelDoc = useCallback(async () => {
    if (!doc.name) return;
    setCanceling(true);
    setDialog(null);
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
  }, [doc.name, meta.name, router]);

  const onDiscard = useCallback(() => {
    setDoc(initialRef.current);
    setEditing(false);
    setDialog(null);
  }, []);

  const handleDiscardClick = useCallback(() => {
    if (dirty) {
      setDialog("discard");
    } else {
      onDiscard();
    }
  }, [dirty, onDiscard]);

  // Fade the "Saved" chip out after 4 seconds
  useEffect(() => {
    if (!justSaved) return;
    const id = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(id);
  }, [justSaved]);

  // Cmd/Ctrl+S to save; Esc to discard
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      const isSave = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s";
      if (isSave) {
        e.preventDefault();
        if (dirty && !saving) void onSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleDiscardClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, dirty, saving, onSave, handleDiscardClick]);

  // Warn on unload with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const singular = title.replace(/s$/, "").toLowerCase();

  return (
    <>
      <div className={cn("space-y-4", editing && "pb-20")}>
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
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl tracking-tight sm:text-3xl">
                {isNew ? `New ${singular}` : String(doc.name)}
              </h1>
              {meta.is_submittable && !isNew && (
                <StatusBadge
                  status={docstatusLabel(docstatus)}
                  tone={toneForDocstatus(docstatus)}
                />
              )}
              {dirty && (
                <Badge className="border-chart-2/30 bg-chart-2/10 text-chart-2">
                  Unsaved changes
                </Badge>
              )}
              {justSaved && !dirty && (
                <Badge className="border-primary/30 bg-primary/10 text-primary transition-opacity">
                  <CheckCircle2 className="size-3" />
                  Saved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!editing && !isNew && (
              <PrintButton doctype={meta.name} docname={String(doc.name)} />
            )}
            {!editing && !isNew && (
              <Button variant="outline" onClick={() => setEditing(true)} disabled={docstatus === 2}>
                <Pencil />
                Edit
              </Button>
            )}
            {!editing && meta.is_submittable && docstatus === 0 && !isNew && (
              <Button variant="polished" onClick={() => setDialog("submit")} disabled={submitting}>
                <CheckCircle2 />
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            )}
            {!editing && meta.is_submittable && docstatus === 1 && (
              <Button variant="outline" onClick={() => setDialog("cancel")} disabled={canceling}>
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

        {!isNew && !editing && (
          <ActivityTimeline
            doctype={meta.name}
            docname={String(doc.name)}
            owner={doc.owner as string | undefined}
            creation={doc.creation as string | undefined}
            modified={doc.modified as string | undefined}
            modifiedBy={doc.modified_by as string | undefined}
          />
        )}
      </div>

      {editing && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
          <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-border/70 bg-background/95 px-3 py-2 shadow-elevation-lg backdrop-blur">
            <div className="ml-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : dirty ? (
                <span>
                  Unsaved changes ·{" "}
                  <span className="hidden font-mono text-[10px] sm:inline">⌘S to save · Esc to discard</span>
                </span>
              ) : (
                <span>No changes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDiscardClick}>
                <X />
                Discard
              </Button>
              <Button
                variant="polished"
                size="sm"
                onClick={onSave}
                disabled={saving || !dirty && !isNew}
              >
                <Save />
                {saving ? "Saving…" : isNew ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={dialog === "discard"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your unsaved edits will be lost. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={onDiscard} className="bg-destructive text-white hover:bg-destructive/90">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === "submit"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this {singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              Submitted records are locked from further edits. You can still cancel a
              submitted {singular} afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmitDoc}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === "cancel"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this submitted {singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This reverses the submission and may affect downstream records
              (payments, stock, etc.). Consider whether an amendment is more
              appropriate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep submitted</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancelDoc}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Cancel {singular}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
