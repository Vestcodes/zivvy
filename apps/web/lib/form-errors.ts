/**
 * Parse Frappe error responses into field-level errors + a form-level error.
 * Frappe returns validation errors two ways:
 *   1. _server_messages: JSON string array; each entry is a JSON string with
 *      { fieldname?, message, title?, indicator? }
 *   2. exc / message on top-level for generic failures
 * We normalize both into a shape the UI can render inline.
 */

import { FrappeError } from "@/lib/frappe-client";

export interface ParsedFormError {
  /** fieldname → user-facing message */
  fieldErrors: Record<string, string>;
  /** Any error that isn't tied to a specific field */
  formError?: string;
  /** True if we've populated at least one field. */
  hasFieldErrors: boolean;
}

const EMPTY: ParsedFormError = { fieldErrors: {}, hasFieldErrors: false };

export function parseFrappeError(err: unknown): ParsedFormError {
  const result: ParsedFormError = { fieldErrors: {}, hasFieldErrors: false };

  if (err instanceof FrappeError) {
    for (const raw of err.serverMessages) {
      // serverMessages entries are either JSON strings or plain strings
      try {
        const parsed = JSON.parse(raw) as {
          fieldname?: string;
          message?: string;
          title?: string;
        };
        if (parsed?.fieldname && parsed?.message) {
          result.fieldErrors[parsed.fieldname] = stripHtml(parsed.message);
          result.hasFieldErrors = true;
        } else if (parsed?.message) {
          result.formError = result.formError || stripHtml(parsed.message);
        } else if (typeof parsed === "string") {
          result.formError = result.formError || parsed;
        }
      } catch {
        // Plain string
        if (raw) result.formError = result.formError || raw;
      }
    }
    if (!result.formError && err.message) {
      result.formError = err.message;
    }
  } else if (err instanceof Error) {
    result.formError = err.message;
  } else if (typeof err === "string") {
    result.formError = err;
  } else {
    result.formError = "Something went wrong. Please try again.";
  }

  return result;
}

/** Strip HTML tags from Frappe error strings (they sometimes include <details> markup). */
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Merge two ParsedFormError shapes; b takes precedence. */
export function mergeErrors(a: ParsedFormError, b: ParsedFormError): ParsedFormError {
  return {
    fieldErrors: { ...a.fieldErrors, ...b.fieldErrors },
    formError: b.formError ?? a.formError,
    hasFieldErrors: Object.keys({ ...a.fieldErrors, ...b.fieldErrors }).length > 0
  };
}

export const EMPTY_ERRORS: ParsedFormError = EMPTY;
