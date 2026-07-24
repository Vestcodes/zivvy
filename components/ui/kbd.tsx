import { cn } from "@/lib/utils";

const MOD_LABEL_MAC = "⌘";
const MOD_LABEL_OTHER = "Ctrl";

function isMacUA(): boolean {
  if (typeof navigator === "undefined") return false;
  // @ts-expect-error — userAgentData is not in TS lib.dom yet.
  const uaData = navigator.userAgentData;
  if (uaData && typeof uaData.platform === "string") {
    return uaData.platform === "macOS";
  }
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

export function formatKey(k: string): string {
  if (k === "mod") return isMacUA() ? MOD_LABEL_MAC : MOD_LABEL_OTHER;
  if (k === "shift") return "⇧";
  if (k === "alt") return isMacUA() ? "⌥" : "Alt";
  if (k === "enter") return "↵";
  if (k === "esc") return "Esc";
  if (k.length === 1) return k.toUpperCase();
  return k;
}

const KBD_CLASSES =
  "pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground";

export function Kbd({
  keys,
  className
}: {
  keys: string[];
  className?: string;
}) {
  return (
    <kbd className={cn(KBD_CLASSES, className)}>
      {keys.map((k, i) => (
        <span key={i}>{formatKey(k)}</span>
      ))}
    </kbd>
  );
}

/** Two adjacent kbd pills for chorded shortcuts ("g h"). */
export function KbdChord({
  chord,
  className
}: {
  chord: string[];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {chord.map((k, i) => (
        <Kbd key={i} keys={[k]} />
      ))}
    </span>
  );
}
