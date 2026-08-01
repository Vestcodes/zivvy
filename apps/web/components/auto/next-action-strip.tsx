"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Sparkles, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestOpenNew } from "@/components/auto/auto-list-new-button";
import { cn } from "@/lib/utils";
import type { NextAction } from "@/lib/next-action";

/** Same-list `?new=1` → open wizard in place; cross-route → navigate. */
function useCreateHrefHandler(href: string | undefined) {
  const pathname = usePathname();
  const router = useRouter();
  if (!href) return null;
  try {
    const url = new URL(href, "https://zivvy.local");
    if (url.searchParams.get("new") !== "1") return null;
    return () => {
      if (url.pathname === pathname) {
        requestOpenNew();
        return;
      }
      router.push(`${url.pathname}?new=1`);
    };
  } catch {
    return null;
  }
}

interface Props {
  action: NextAction | null;
  onExecute?: (action: NextAction) => void;
  className?: string;
}

const TONE_STYLES: Record<NextAction["tone"], string> = {
  primary: "border-primary/25 bg-primary/[0.04] text-foreground",
  warning: "border-status-warning-ring/40 bg-status-warning-bg/40",
  danger: "border-status-danger-ring/40 bg-status-danger-bg/40",
  info: "border-status-info-ring/40 bg-status-info-bg/40",
  neutral: "border-border/70 bg-muted/40"
};

const TONE_ICONS: Record<NextAction["tone"], typeof Sparkles> = {
  primary: Sparkles,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
  neutral: CheckCircle2
};

const TONE_ICON_COLORS: Record<NextAction["tone"], string> = {
  primary: "text-primary",
  warning: "text-status-warning-fg",
  danger: "text-status-danger-fg",
  info: "text-status-info-fg",
  neutral: "text-muted-foreground"
};

/**
 * The "next action" affordance rendered above every list + detail page.
 * A single primary CTA plus a one-line hint — never more. If we can't
 * decide what to recommend, render nothing (silence beats noise).
 */
export function NextActionStrip({ action, onExecute, className }: Props) {
  const openCreate = useCreateHrefHandler(
    action?.kind === "link" ? action.href : undefined
  );

  if (!action) return null;
  const Icon = TONE_ICONS[action.tone];

  const cta =
    action.kind === "link" && action.href ? (
      openCreate ? (
        <Button
          type="button"
          size="sm"
          variant={action.tone === "primary" ? "polished" : "outline"}
          onClick={openCreate}
        >
          {action.label}
          <ArrowRight />
        </Button>
      ) : (
        <Button asChild size="sm" variant={action.tone === "primary" ? "polished" : "outline"}>
          <Link href={action.href}>
            {action.label}
            <ArrowRight />
          </Link>
        </Button>
      )
    ) : (
      <Button
        type="button"
        size="sm"
        variant={action.tone === "primary" ? "polished" : "outline"}
        onClick={() => onExecute?.(action)}
      >
        {action.label}
        <ArrowRight />
      </Button>
    );

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm",
        TONE_STYLES[action.tone],
        className
      )}
    >
      <div className={cn("mt-0.5 shrink-0", TONE_ICON_COLORS[action.tone])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{action.label}</p>
        {action.hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{action.hint}</p>
        )}
      </div>
      <div className="shrink-0">{cta}</div>
    </div>
  );
}
