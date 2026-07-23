import { cn } from "@/lib/utils";
import {
  STATUS_TONE_CLASSES,
  toneForStatus,
  type StatusTone
} from "@/lib/status";

interface Props {
  status: string | number | null | undefined;
  tone?: StatusTone;
  className?: string;
}

/**
 * StatusBadge — pill with semantic color derived from the status text.
 * Pass an explicit `tone` to override the keyword-based mapping.
 */
export function StatusBadge({ status, tone, className }: Props) {
  const resolved = tone ?? toneForStatus(status);
  const t = STATUS_TONE_CLASSES[resolved];
  const label = status === null || status === undefined || status === "" ? "—" : String(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        t.bg,
        t.fg,
        t.ring,
        className
      )}
    >
      <span aria-hidden className={cn("me-1.5 size-1.5 rounded-full", t.dot)} />
      {label}
    </span>
  );
}
