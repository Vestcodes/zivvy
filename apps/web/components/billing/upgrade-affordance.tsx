"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TIER_LABEL } from "@/lib/gating";
import type { ZivvyTier } from "@/lib/boot-types";

/**
 * Hover affordance on gated interactive elements. Wrap the child (button/link)
 * to reveal "Included in Pro" (or Business) on hover.
 */
export function UpgradeTooltip({
  requiredTier,
  children
}: {
  requiredTier: ZivvyTier;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-1.5 px-2.5 py-1.5">
        <Lock className="size-3" />
        <span className="text-xs">Included in {TIER_LABEL[requiredTier]}</span>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Dialog shown when a user clicks (or otherwise activates) a gated action.
 * Instead of teleporting to /billing, we ask permission and give the user
 * a way back via ?from=.
 */
export function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  requiredTier,
  fromPath
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  feature: string;
  requiredTier: ZivvyTier;
  fromPath?: string;
}) {
  const params = new URLSearchParams();
  params.set("feature", feature);
  if (fromPath) params.set("from", fromPath);
  const href = `/billing?${params.toString()}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-primary-gradient mb-2 grid size-11 place-items-center rounded-md text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <AlertDialogTitle>Unlock {feature}</AlertDialogTitle>
          <AlertDialogDescription>
            This feature is included in the{" "}
            <span className="font-medium text-foreground">{TIER_LABEL[requiredTier]}</span>{" "}
            plan and above. Upgrade to unlock — you'll come right back here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href={href}>See plans</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook version — returns the dialog element + a trigger function so
 * callsites can wire it to any button/link they own.
 */
export function useUpgradeDialog(fromPath?: string) {
  const [state, setState] = useState<{
    open: boolean;
    feature: string;
    requiredTier: ZivvyTier;
  }>({ open: false, feature: "", requiredTier: "pro" });

  const open = useCallback((feature: string, requiredTier: ZivvyTier) => {
    setState({ open: true, feature, requiredTier });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const element = (
    <UpgradeDialog
      open={state.open}
      onOpenChange={(v) => (v ? undefined : close())}
      feature={state.feature}
      requiredTier={state.requiredTier}
      fromPath={fromPath}
    />
  );

  return { open, close, element };
}
