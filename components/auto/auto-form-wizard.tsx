"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Plus, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { FieldInput } from "@/components/auto/field-input";
import { frappeCall } from "@/lib/frappe-client";
import type { DocField, DoctypeMeta, FormGroup } from "@/lib/frappe-meta";
import { EMPTY_ERRORS, parseFrappeError, type ParsedFormError } from "@/lib/form-errors";
import { cn } from "@/lib/utils";

interface Props {
  meta: DoctypeMeta;
  groups: FormGroup[];
  initialDoc: Record<string, unknown>;
  basePath: string;
  title: string;
  onCreated?: (name: string) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

function shallowEqualDoc(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if ((a[k] ?? null) !== (b[k] ?? null)) return false;
  }
  return true;
}

function isValueEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  return false;
}

/** Fields the user actually needs to fill on this step (skip hidden/read-only). */
function editableFields(group: FormGroup): DocField[] {
  return group.columns.flatMap((c) =>
    c.fields.filter((f) => !f.hidden && f.read_only !== 1)
  );
}

function firstMissingRequired(
  group: FormGroup,
  doc: Record<string, unknown>
): DocField | null {
  for (const f of editableFields(group)) {
    if (f.reqd === 1 && isValueEmpty(doc[f.fieldname])) return f;
  }
  return null;
}

/**
 * Stepped wizard for creating a new record.
 *
 * One FormGroup per step, footer with Back / Next / Create, top progress
 * indicator, per-step required-field validation before advancing. Reuses the
 * exact FieldInput / form-errors plumbing that AutoFormClient uses so the
 * inputs behave identically.
 */
export function AutoFormWizard({
  meta,
  groups,
  initialDoc,
  basePath,
  title,
  onCreated,
  trigger,
  open: openProp,
  onOpenChange
}: Props) {
  const router = useRouter();

  // Controlled vs uncontrolled open state
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  const singular = title.replace(/s$/, "").toLowerCase();

  // Filter out empty groups (defensive — shouldn't happen, but safe).
  const steps = useMemo(
    () => groups.filter((g) => editableFields(g).length > 0),
    [groups]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [doc, setDoc] = useState<Record<string, unknown>>(initialDoc);
  const [errors, setErrors] = useState<ParsedFormError>(EMPTY_ERRORS);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  // Reset internal state whenever the dialog is (re)opened
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setDoc(initialDoc);
      setErrors(EMPTY_ERRORS);
      setSaving(false);
      setConfirmClose(false);
    }
    // We intentionally only re-run on `open` transitions — initialDoc is
    // captured at open time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dirty = useMemo(() => !shallowEqualDoc(doc, initialDoc), [doc, initialDoc]);

  const totalSteps = Math.max(1, steps.length);
  const step = steps[currentStep];
  const isLastStep = currentStep >= totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const progressValue = Math.round(((currentStep + 1) / totalSteps) * 100);

  const updateField = useCallback((fieldname: string, value: unknown) => {
    setDoc((prev) => ({ ...prev, [fieldname]: value }));
    setErrors((prev) => {
      if (!prev.fieldErrors[fieldname]) return prev;
      const next = { ...prev.fieldErrors };
      delete next[fieldname];
      return {
        ...prev,
        fieldErrors: next,
        hasFieldErrors: Object.keys(next).length > 0
      };
    });
  }, []);

  /**
   * If parsed errors mention a field that isn't on the current step, jump to
   * the first step where the offending field lives. That way the user always
   * sees the error inline instead of on a hidden step.
   */
  const stepForFieldname = useCallback(
    (fieldname: string): number => {
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].columns.some((c) => c.fields.some((f) => f.fieldname === fieldname))) {
          return i;
        }
      }
      return currentStep;
    },
    [steps, currentStep]
  );

  const focusField = useCallback((fieldname: string) => {
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

  const goNext = useCallback(() => {
    if (!step) return;
    const missing = firstMissingRequired(step, doc);
    if (missing) {
      setErrors({
        fieldErrors: {
          [missing.fieldname]: `${missing.label ?? missing.fieldname} is required.`
        },
        hasFieldErrors: true
      });
      focusField(missing.fieldname);
      return;
    }
    setErrors(EMPTY_ERRORS);
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [step, doc, focusField, totalSteps]);

  const goBack = useCallback(() => {
    setErrors(EMPTY_ERRORS);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const onCreate = useCallback(async () => {
    if (!step) return;
    // Final required-field sweep across the current step
    const missing = firstMissingRequired(step, doc);
    if (missing) {
      setErrors({
        fieldErrors: {
          [missing.fieldname]: `${missing.label ?? missing.fieldname} is required.`
        },
        hasFieldErrors: true
      });
      focusField(missing.fieldname);
      return;
    }

    setSaving(true);
    setErrors(EMPTY_ERRORS);
    try {
      const result = await frappeCall<{ name?: string }>("frappe.client.insert", {
        doc: JSON.stringify({ ...doc, doctype: meta.name })
      });
      const newName = result?.name;
      toast.success(`${title.replace(/s$/, "")} created`);
      setOpen(false);
      if (onCreated && newName) {
        onCreated(newName);
      } else if (newName) {
        router.push(`${basePath}/${encodeURIComponent(newName)}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      const parsed = parseFrappeError(err);
      setErrors(parsed);
      if (parsed.hasFieldErrors) {
        const firstField = Object.keys(parsed.fieldErrors)[0];
        if (firstField) {
          const targetStep = stepForFieldname(firstField);
          if (targetStep !== currentStep) setCurrentStep(targetStep);
          focusField(firstField);
        }
      } else if (parsed.formError) {
        toast.error(parsed.formError);
      } else {
        toast.error("Create failed.");
      }
    } finally {
      setSaving(false);
    }
  }, [
    step,
    doc,
    meta.name,
    title,
    basePath,
    router,
    onCreated,
    setOpen,
    focusField,
    stepForFieldname,
    currentStep
  ]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v && dirty && !saving) {
        setConfirmClose(true);
        return;
      }
      setOpen(v);
    },
    [dirty, saving, setOpen]
  );

  const confirmDiscard = useCallback(() => {
    setConfirmClose(false);
    setOpen(false);
  }, [setOpen]);

  // Keyboard: Enter advances / creates when focus isn't in a multiline field
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      // Textareas keep Enter for newline
      if (tag === "TEXTAREA") return;
      // Combobox / listbox popovers handle their own Enter
      if (target.getAttribute("role") === "combobox") return;
      // Buttons: let native behaviour fire; we already own Next/Create clicks
      if (tag === "BUTTON") return;
      e.preventDefault();
      if (saving) return;
      if (isLastStep) {
        void onCreate();
      } else {
        goNext();
      }
    },
    [saving, isLastStep, onCreate, goNext]
  );

  // Fallback trigger — a labelled New button — when the caller doesn't
  // provide their own.
  const defaultTrigger = (
    <Button variant="polished" size="sm">
      <Plus />
      New {singular}
    </Button>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* Always render an explicit trigger when provided, even in controlled
            mode — list headers / empty states need the New button visible. */}
        {(trigger || !isControlled) && (
          <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
        )}
        <DialogContent
          className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-2xl"
          onKeyDown={onKeyDown}
        >
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5" />
              <span>New {singular}</span>
            </div>
            <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
              {step?.label ? step.label : `Create ${singular}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Create a new {singular}. Step {currentStep + 1} of {totalSteps}.
            </DialogDescription>
          </DialogHeader>

          {/* Progress + step counter */}
          <div className="px-6 pb-4 pt-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="tabular-nums">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>

          {/* Body */}
          <div className="max-h-[55vh] overflow-y-auto px-6 pb-4">
            {(errors.formError || errors.hasFieldErrors) && (
              <Alert variant="destructive" role="alert" className="mb-4">
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

            {step ? (
              <div className="grid gap-5">
                {step.columns.map((col, i) => (
                  <div key={i} className="grid gap-5">
                    {col.fields
                      .filter((f) => !f.hidden && f.read_only !== 1)
                      .map((f) => (
                        <FieldInput
                          key={f.fieldname}
                          field={f}
                          value={doc[f.fieldname]}
                          error={errors.fieldErrors[f.fieldname]}
                          onChange={(v) => updateField(f.fieldname, v)}
                        />
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No fields available to fill.
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={isFirstStep || saving}
              className={cn(isFirstStep && "invisible")}
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              {isLastStep ? (
                <Button
                  type="button"
                  variant="polished"
                  size="sm"
                  onClick={onCreate}
                  disabled={saving}
                  className="min-w-[6rem]"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  {saving ? "Creating..." : `Create ${singular}`}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="polished"
                  size="sm"
                  onClick={goNext}
                  disabled={saving}
                >
                  Next
                  <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard-changes confirm (only when the user tries to close mid-fill) */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this {singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Closing now will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscard}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Convenient wrapper around AutoFormWizard that builds an initial
 * `{ __islocal: 1, doctype }` doc — matches AutoForm's default. */
export function NewRecordWizard({
  meta,
  groups,
  basePath,
  title,
  trigger,
  onCreated,
  open,
  onOpenChange
}: {
  meta: DoctypeMeta;
  groups: FormGroup[];
  basePath: string;
  title: string;
  trigger?: ReactNode;
  onCreated?: (name: string) => void;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  return (
    <AutoFormWizard
      meta={meta}
      groups={groups}
      initialDoc={{ __islocal: 1, doctype: meta.name }}
      basePath={basePath}
      title={title}
      trigger={trigger}
      onCreated={onCreated}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
