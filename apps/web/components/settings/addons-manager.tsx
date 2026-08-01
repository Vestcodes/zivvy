"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ExternalLink,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  tenant: string;
  currentUser: string;
}

export interface AddonCatalogEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  monthly_price_usd: number;
  annual_price_usd?: number;
  doctypes_unlocked: string[];
  modules_unlocked?: string[];
  upstream_frappe_app?: string;
  upstream_url?: string | null;
  marketing_summary?: string | null;
}

export interface ActiveAddon {
  name: string; // Zivvy Tenant Addon docname
  addon_slug: string;
  addon_title?: string | null;
  category?: string | null;
  status: string; // "active" | "trialing" | "cancelled" | "past_due"
  quantity?: number;
  price_locked_usd?: number | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  polar_subscription_id?: string | null;
}

export function AddonsManager({ tenant, currentUser }: Props) {
  void tenant;
  void currentUser;

  const [catalog, setCatalog] = useState<AddonCatalogEntry[]>([]);
  const [active, setActive] = useState<ActiveAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingSlug, setSubscribingSlug] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ActiveAddon | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const activeBySlug = useMemo(() => {
    const map = new Map<string, ActiveAddon>();
    for (const a of active) map.set(a.addon_slug, a);
    return map;
  }, [active]);

  const fetchData = useCallback(async () => {
    try {
      const [cat, mine] = await Promise.all([
        frappeCall<AddonCatalogEntry[]>("zivvy_brand.api.addons.list_addons"),
        frappeCall<ActiveAddon[]>("zivvy_brand.api.addons.list_my_addons"),
      ]);
      setCatalog(cat ?? []);
      setActive(mine ?? []);
    } catch {
      toast.error("Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = async (addon: AddonCatalogEntry) => {
    setSubscribingSlug(addon.slug);
    try {
      const result = await frappeCall<{ checkout_url?: string }>(
        "zivvy_brand.api.addons.subscribe",
        { addon_slug: addon.slug }
      );
      if (result?.checkout_url) {
        window.open(result.checkout_url, "_blank", "noopener,noreferrer");
        toast.success("Opening checkout in a new tab");
      } else {
        toast.success(`Subscribed to ${addon.title}`);
        fetchData();
      }
    } catch {
      toast.error(`Failed to subscribe to ${addon.title}`);
    } finally {
      setSubscribingSlug(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await frappeCall("zivvy_brand.api.addons.cancel", {
        addon_slug: cancelTarget.addon_slug,
      });
      toast.success(`${cancelTarget.addon_title ?? cancelTarget.addon_slug} will not renew`);
      setCancelTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to cancel add-on");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add-ons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock additional modules, features, and doctypes for your workspace.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[260px] w-full rounded-xl" />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((addon) => (
              <AddonCard
                key={addon.slug}
                addon={addon}
                active={activeBySlug.get(addon.slug) ?? null}
                subscribing={subscribingSlug === addon.slug}
                onSubscribe={() => handleSubscribe(addon)}
                onCancel={(activeEntry) => setCancelTarget(activeEntry)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelTarget?.addon_title ?? cancelTarget?.addon_slug}?</AlertDialogTitle>
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

interface AddonCardProps {
  addon: AddonCatalogEntry;
  active: ActiveAddon | null;
  subscribing: boolean;
  onSubscribe: () => void;
  onCancel: (active: ActiveAddon) => void;
}

function AddonCard({ addon, active, subscribing, onSubscribe, onCancel }: AddonCardProps) {
  const price = formatMoney(addon.monthly_price_usd, "USD");
  const doctypes = addon.doctypes_unlocked ?? [];
  const shown = doctypes.slice(0, 3);
  const extra = doctypes.length - shown.length;
  const isActive = !!active;
  const willCancel = active?.status === "cancelled";

  return (
    <Card
      className={cn(
        "flex flex-col justify-between transition-shadow hover:shadow-md",
        isActive && "border-primary/40"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{addon.title}</CardTitle>
          {addon.category && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {addon.category}
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-2xl font-semibold tracking-tight">{price}</span>
          <span className="text-xs text-muted-foreground">/ month</span>
        </div>
        {addon.description && (
          <CardDescription className="pt-1">{addon.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {doctypes.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Unlocks
            </p>
            <ul className="space-y-1">
              {shown.map((doctype) => (
                <li key={doctype} className="flex items-center gap-1.5 text-sm">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{doctype}</span>
                </li>
              ))}
              {extra > 0 && (
                <li className="text-xs text-muted-foreground pl-5">
                  +{extra} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-auto space-y-2">
          {isActive ? (
            <>
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {willCancel ? "Cancels" : "Renews"}{" "}
                {active?.current_period_end ? (
                  <span className="text-foreground font-medium">
                    {formatDate(active.current_period_end)}
                  </span>
                ) : (
                  "at end of period"
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => active && onCancel(active)}
                disabled={willCancel}
              >
                {willCancel ? "Cancelled" : "Manage"}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={onSubscribe}
              disabled={subscribing}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Opening checkout...
                </>
              ) : (
                <>
                  Subscribe — {price}/mo
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">No add-ons available</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Check back soon — new modules and integrations are on the way.
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-muted-foreground/40" />
      </CardContent>
    </Card>
  );
}
