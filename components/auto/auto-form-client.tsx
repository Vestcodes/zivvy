"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { docstatusLabel, toneForDocstatus } from "@/lib/status";
import { Button } from "@/components/ui/button";
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
import { NextActionStrip } from "@/components/auto/next-action-strip";
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import type { DoctypeMeta, FormGroup } from "@/lib/frappe-meta";
import { cn } from "@/lib/utils";
import { parseFrappeError, EMPTY_ERRORS, type ParsedFormError } from "@/lib/form-errors";
import { computeNextAction, type NextAction } from "@/lib/next-action";
import { densifyForm } from "@/lib/form-density";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  initialDoc: Record<string, unknown>;
  basePath: string;
  title: string;
  initialNextAction?: NextAction | null;
}


function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (a[k] !== b[k]) {
      const av = a[k] ?? null;
      const bv = b[k] ?? null;
      if (av !== bv) return false;
    }
  }
  return true;
}

type DialogKind = null | "discard" | "submit" | "cancel";

export function AutoFormClient({
  meta,
  groups,
  initialDoc,
  basePath,
  title,
  initialNextAction
}: Props) {
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
  const [showAllDetail, setShowAllDetail] = useState(false);

  const docstatus = Number((doc.docstatus as number | undefined) ?? 0);
  const isNew = doc.__islocal === 1 || !doc.name;
  const dirty = useMemo(() => editing && !shallowEqual(doc, initialRef.current), [doc, editing]);

  const densified = useMemo(() => densifyForm(groups), [groups]);

  const nextAction = useMemo<NextAction | null>(() => {
    return computeNextAction({ meta, doc, isNew, basePath });
  }, [meta, doc, isNew, basePath]);

  const displayedNextAction = nextAction ?? initialNextAction ?? null;

  const focusField = useCallback((fieldname: string) => {
    setShowAllDetail(true);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-field="${fieldname}"] input, [data-field="${fieldname}"] textarea, [data-field="${fieldname}"] [role="combobox"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    });
  }, []);

  const updateField = useCallback((fieldname: string, value: unknown) => {
    setDoc((prev) => ({ ...prev, [fieldname]: value }));
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

  const executeNextAction = useCallback((action: NextAction) => {
    switch (action.kind) {
      case "fill":
        if (action.targetField) {
          if (!editing) setEditing(true);
          focusField(action.targetField);
        }
        return;
      case "submit":
        if (isNew || dirty) {
          onSave();
        } else {
          setDialog("submit");
        }
        return;
      case "cancel":
        setDialog("cancel");
        return;
      case "amend":
        toast.info("Amend is coming soon", {
          description: "For now, copy the numbers into a new draft."
        });
        return;
      case "link":
        if (action.href) router.push(action.href);
        return;
      case "review":
      case "empty":
      default:
        return;
    }
  }, [editing, isNew, dirty, focusField, onSave, router]);

  useEffect(() => {
    if (!justSaved) return;
    const id = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(id);
  }, [justSaved]);

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

  const visibleSections = densified.sections.filter((section) => {
    const hasEssentials = section.columns.some((c) =>
      c.fields.some((f) => f.tier === "essential")
    );
    return hasEssentials || showAllDetail;
  });

  return (
    <>
      <div className={cn("mx-auto w-full max-w-3xl", editing && "pb-24")}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button asChild variant="ghost" size="icon-sm" className="size-7">
              <Link href={basePath}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <span className="truncate">{title}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
                {isNew ? `New ${singular}` : String(doc.name)}
              </h1>
              {meta.is_submittable && !isNew && (
                <StatusBadge
                  status={docstatusLabel(docstatus)}
                  tone={toneForDocstatus(docstatus)}
                />
              )}
              {dirty && (
                <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Unsaved
                </Badge>
              )}
              {justSaved && !dirty && (
                <Badge className="border-primary/30 bg-primary/10 text-primary transition-opacity">
                  <CheckCircle2 className="size-3" />
                  Saved
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!editing && !isNew && (
                <PrintButton doctype={meta.name} docname={String(doc.name)} />
              )}
              {!editing && !isNew && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={docstatus === 2}>
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
              {!editing && meta.is_submittable && docstatus === 0 && !isNew && (
                <Button variant="polished" size="sm" onClick={() => setDialog("submit")} disabled={submitting}>
                  <CheckCircle2 className="size-3.5" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              )}
              {!editing && meta.is_submittable && docstatus === 1 && (
                <Button variant="outline" size="sm" onClick={() => setDialog("cancel")} disabled={canceling}>
                  <Ban className="size-3.5" />
                  {canceling ? "Cancelling..." : "Cancel"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {(errors.formError || errors.hasFieldErrors) && (
          <Alert variant="destructive" role="alert" className="mb-5">
            <AlertCircle className="size-4" />
            <AlertTitle>
              {errors.hasFieldErrors
                ? "Please fix the highlighted fields"
                : "Something didn't work"}
            </AlertTitle>
            {errors.formError && (
              <AlertDescription>{errors.formError}</AlertDescription>
            )}
          </Alert>
        )}

        {/* Next action strip */}
        <NextActionStrip action={displayedNextAction} onExecute={executeNextAction} className="mb-5" />

        {/* Form body — single unified container */}
        <div className="rounded-xl border border-border/70 bg-card shadow-sm">
          {visibleSections.map((section, sectionIdx) => (
            <div
              key={`${section.label}-${sectionIdx}`}
              className={cn(
                sectionIdx > 0 && "border-t border-border/50"
              )}
            >
              <div className="px-6 py-5">
                {section.label && (
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </h2>
                )}
                <div
                  className={
                    section.columns.length > 1
                      ? "grid gap-x-8 gap-y-5 md:grid-cols-2"
                      : "grid gap-5"
                  }
                >
                  {section.columns.map((col, i) => (
                    <div key={i} className="grid gap-5">
                      {col.fields
                        .filter(({ tier }) => showAllDetail || tier === "essential")
                        .map(({ field: f }) =>
                          editing ? (
                            <FieldInput
                              key={f.fieldname}
                              field={f}
                              value={doc[f.fieldname]}
                              error={errors.fieldErrors[f.fieldname]}
                              onChange={(v) => updateField(f.fieldname, v)}
                            />
                          ) : (
                            <FieldView key={f.fieldname} field={f} value={doc[f.fieldname]} />
                          )
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Detail fields toggle — inside the container */}
          {densified.totalDetail > 0 && (
            <div className="border-t border-border/50 px-6 py-3">
              <button
                type="button"
                onClick={() => setShowAllDetail((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {showAllDetail ? (
                  <>
                    <ChevronUp className="size-3.5" />
                    Fewer fields
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    {densified.totalDetail} more {densified.totalDetail === 1 ? "field" : "fields"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Activity timeline */}
        {!isNew && !editing && (
          <div className="mt-6">
            <ActivityTimeline
              doctype={meta.name}
              docname={String(doc.name)}
              owner={doc.owner as string | undefined}
              creation={doc.creation as string | undefined}
              modified={doc.modified as string | undefined}
              modifiedBy={doc.modified_by as string | undefined}
            />
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {editing && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
          <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-elevation-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="ml-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="font-medium text-foreground">Saving...</span>
                </>
              ) : dirty ? (
                <span>
                  Unsaved changes
                  <span className="ml-2 hidden text-xs opacity-60 sm:inline">
                    {"⌘"}S to save
                  </span>
                </span>
              ) : (
                <span className="opacity-60">No changes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDiscardClick} className="text-muted-foreground">
                <X className="size-3.5" />
                Discard
              </Button>
              <Button
                variant="polished"
                size="sm"
                onClick={onSave}
                disabled={saving || !dirty && !isNew}
                className="min-w-[5rem]"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saving ? "Saving..." : isNew ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
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
