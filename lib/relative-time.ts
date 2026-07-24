/**
 * Format a Frappe naive-UTC timestamp as a relative "2h ago"-style string.
 *
 * Frappe returns naive strings like "2026-07-24 12:34:56[.123456]" in site UTC.
 * We coerce them into an ISO-Zulu shape before handing to `new Date` so the
 * user's local zone doesn't get folded into the delta.
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never";

  const asIso = normalizeFrappeTs(String(iso));
  const d = new Date(asIso);
  if (Number.isNaN(d.getTime())) return "Never";

  const delta = Math.max(0, Date.now() - d.getTime());
  const s = Math.floor(delta / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function normalizeFrappeTs(raw: string): string {
  // Already ISO? trust it.
  if (raw.includes("T") && (raw.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(raw))) {
    return raw;
  }
  // "YYYY-MM-DD HH:MM:SS[.microseconds]" → "YYYY-MM-DDTHH:MM:SS[.mmm]Z"
  const spaceSwapped = raw.replace(" ", "T");
  const micro = spaceSwapped.match(/^(.+?)\.(\d+)$/);
  const base = micro ? `${micro[1]}.${micro[2].slice(0, 3).padEnd(3, "0")}` : spaceSwapped;
  return `${base}Z`;
}
