"use client";

/**
 * Shared seat-upgrade dialog used by both /settings/team and /billing.
 *
 * The backend endpoint (`zivvy_brand.billing.tier_checkout.update_seat_quantity`)
 * decides how the seat change happens — direct PATCH, fresh checkout, or
 * customer-portal handoff — and this component just reflects the returned mode
 * in the confirm-button copy and follow-up action. Keep the seat mental model
 * in one place; do not fork this UI into a "billing" and a "team" variant.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, ExternalLink, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateSeatQuantity, type SeatUpdateResult } from "@/lib/billing-client";
import { FrappeError } from "@/lib/frappe-client";
import { LocalisedPrice } from "@/components/pricing/localised-price";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seatsUsed: number;
  seatsAllowed: number;
  hasSubscription: boolean;
  /**
   * Optional USD price per seat / month on the current tier. When supplied
   * we render a `<LocalisedPrice>` next to the delta so the user sees the
   * incremental spend in their own currency before hitting confirm.
   */
  pricePerSeatUsd?: number;
  /** Optional callback fired after a "direct" seat update (no redirect). */
  onDirectUpdate?: (seats: number) => void;
}

const PRESET_DELTAS = [1, 2, 5];

export function SeatUpgradeDialog({
  open,
  onOpenChange,
  seatsUsed,
  seatsAllowed,
  hasSubscription,
  pricePerSeatUsd,
  onDirectUpdate
}: Props) {
  const router = useRouter();
  const currentTotal = Math.max(seatsAllowed, seatsUsed, 1);
  const minAllowed = Math.max(seatsUsed, 1);

  const [target, setTarget] = useState<number>(currentTotal + 1);
  const [busy, setBusy] = useState(false);

  // Reset the picker every time the dialog reopens — otherwise a user who
  // dismissed the modal at "current + 5" would see it re-pop at that value.
  useEffect(() => {
    if (open) {
      setTarget(Math.max(currentTotal + 1, minAllowed));
    }
  }, [open, currentTotal, minAllowed]);

  const delta = target - currentTotal;
  const confirmLabel = useMemo(() => {
    if (busy) return "Working…";
    if (!hasSubscription) return "Continue to checkout";
    return delta > 0 ? `Add ${delta} seat${delta === 1 ? "" : "s"}` : "Update seats";
  }, [busy, hasSubscription, delta]);

  function bump(n: number) {
    setTarget((v) => Math.max(minAllowed, v + n));
  }

  function setPreset(n: number) {
    setTarget(Math.max(minAllowed, currentTotal + n));
  }

  async function onConfirm() {
    if (busy) return;
    if (target < minAllowed) {
      toast.error(
        `You have ${seatsUsed} active user${seatsUsed === 1 ? "" : "s"}. Choose at least that many seats.`
      );
      return;
    }
    setBusy(true);
    try {
      const res: SeatUpdateResult = await updateSeatQuantity(target);
      if (res.mode === "direct" && res.updated) {
        toast.success(`Seats updated to ${res.seats ?? target}. Invite anyone now.`);
        onOpenChange(false);
        onDirectUpdate?.(res.seats ?? target);
        router.refresh();
        return;
      }
      if (res.mode === "checkout" && res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      if (res.mode === "portal" && res.portal_url) {
        toast("Opening the billing portal so you can update seats there.");
        window.location.href = res.portal_url;
        return;
      }
      if (res.mode === "placeholder" && res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.error("Seat change request didn't complete. Try again shortly.");
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Could not update seats.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (busy ? undefined : onOpenChange(o))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">You need another seat</DialogTitle>
          <DialogDescription>
            {hasSubscription
              ? "Change your seat count on this plan. After payment, you can invite immediately."
              : "Add seats to unlock inviting teammates. You'll be sent to secure checkout."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              <span>Current workspace</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tracking-tight">
                {seatsUsed}
              </span>
              <span className="text-sm text-muted-foreground">
                of {seatsAllowed > 0 ? seatsAllowed : "—"} seats in use
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seat-target">New seat total</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => bump(-1)}
                disabled={busy || target <= minAllowed}
                aria-label="Decrease seats"
              >
                <Minus />
              </Button>
              <Input
                id="seat-target"
                type="number"
                min={minAllowed}
                inputMode="numeric"
                value={target}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  if (Number.isFinite(raw)) {
                    setTarget(Math.max(minAllowed, Math.floor(raw)));
                  }
                }}
                className="max-w-[100px] text-center font-mono text-base"
                disabled={busy}
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => bump(1)}
                disabled={busy}
                aria-label="Increase seats"
              >
                <Plus />
              </Button>
              <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
                {PRESET_DELTAS.map((d) => {
                  const preset = currentTotal + d;
                  const active = target === preset;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPreset(d)}
                      disabled={busy}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/70 bg-background hover:bg-muted/50"
                      )}
                    >
                      +{d}
                    </button>
                  );
                })}
              </div>
            </div>
            {delta > 0 && (
              <p className="text-xs text-muted-foreground">
                Adding <span className="font-medium text-foreground">{delta}</span>{" "}
                seat{delta === 1 ? "" : "s"} to your workspace
                {pricePerSeatUsd && pricePerSeatUsd > 0 ? (
                  <>
                    {" "}
                    · +
                    <LocalisedPrice
                      amountCents={pricePerSeatUsd * delta * 100}
                      className="font-medium text-foreground"
                      showUsdNote
                    />
                    <span className="text-muted-foreground"> / mo</span>
                  </>
                ) : null}
                .
              </p>
            )}
            {delta === 0 && (
              <p className="text-xs text-muted-foreground">
                Bump to at least +1 to add a teammate.
              </p>
            )}
            {delta < 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Reducing below your current usage isn&apos;t allowed. Disable users first.
              </p>
            )}
          </div>

          <p className="flex items-start gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <CreditCard className="mt-0.5 size-3.5 shrink-0" />
            <span>
              After payment, seats sync automatically and the invite modal opens without limits.
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="polished"
            onClick={onConfirm}
            disabled={busy || target === currentTotal || target < minAllowed}
          >
            {confirmLabel}
            {!busy && !hasSubscription && <ExternalLink className="size-3.5" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
