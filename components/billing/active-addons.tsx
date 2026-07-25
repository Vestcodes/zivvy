"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatMoney } from "@/lib/format";
import type { ActiveAddon } from "@/components/settings/addons-manager";

export function ActiveAddons() {
  const [addons, setAddons] = useState<ActiveAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<ActiveAddon | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAddons = useCallback(async () => {
    try {
      const data = await frappeCall<ActiveAddon[]>(
        "zivvy_brand.api.addons.list_my_addons"
      );
      setAddons(data ?? []);
    } catch {
      toast.error("Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await frappeCall("zivvy_brand.api.addons.cancel", {
        slug: cancelTarget.slug,
      });
      toast.success(`${cancelTarget.title} will not renew`);
      setCancelTarget(null);
      fetchAddons();
    } catch {
      toast.error("Failed to cancel add-on");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-xl">Add-ons</CardTitle>
            <CardDescription className="mt-1">
              Optional modules billed alongside your plan.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings/addons">
              <Plus className="h-4 w-4 mr-1.5" />
              Browse add-ons
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : addons.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Package className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No active add-ons.{" "}
                <Link
                  href="/settings/addons"
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                >
                  Browse the catalog
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((addon) => {
                const willCancel =
                  addon.cancel_at_period_end === true ||
                  addon.cancel_at_period_end === 1;
                return (
                  <div
                    key={addon.slug}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{addon.title}</span>
                        {addon.monthly_price !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {formatMoney(
                              addon.monthly_price,
                              addon.currency || "USD"
                            )}
                            /mo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {willCancel ? "Ends" : "Next invoice"}{" "}
                        {addon.current_period_end
                          ? formatDate(addon.current_period_end)
                          : "at end of period"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(addon)}
                      disabled={willCancel}
                    >
                      {willCancel ? "Cancelled" : "Cancel"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelTarget?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Access continues until{" "}
              {cancelTarget?.current_period_end
                ? formatDate(cancelTarget.current_period_end)
                : "the end of the current billing period"}
              . You will not be charged again for this add-on unless you resubscribe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep add-on</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground"
            >
              {cancelling ? "Cancelling..." : "Cancel add-on"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
