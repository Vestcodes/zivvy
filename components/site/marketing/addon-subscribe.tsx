"use client";

import { useState } from "react";
import { ArrowRight, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import { appendCheckoutLocale } from "@/lib/tier-checkout";

/**
 * In-product subscribe button for a paid add-on. Only rendered when
 * the parent server component confirmed a valid `sid` cookie, so this
 * is safe to call the workspace's Frappe RPC.
 */

interface AddonSubscribeProps {
  addonSlug: string;
  addonName: string;
  price: string;
  method: string;
}

export function AddonSubscribeForm({
  addonSlug,
  addonName,
  price,
  method
}: AddonSubscribeProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubscribe() {
    setState("loading");
    setMessage(null);
    try {
      const response = await frappeCall<{ checkout_url?: string; status?: string; message?: string }>(
        method,
        { addon_slug: addonSlug }
      );
      if (response?.checkout_url) {
        window.open(appendCheckoutLocale(response.checkout_url), "_blank", "noopener,noreferrer");
        setState("done");
        setMessage("Opening checkout — complete payment to activate the add-on.");
        toast.success(`Opening checkout for ${addonName}`);
      } else {
        setState("done");
        setMessage(
          response?.message ??
            `We received your request for ${addonName}. Finish checkout from your dashboard to activate it.`
        );
        toast.success(`Subscription ${response?.status ?? "requested"} for ${addonName}`);
      }
    } catch (err) {
      const msg =
        err instanceof FrappeError
          ? err.message
          : "Could not reach your workspace. Try again from the dashboard.";
      setState("error");
      setMessage(msg);
      toast.error(msg);
    }
  }

  const isDone = state === "done";

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          You're signed in — subscribe with one click
        </p>
        <span className="font-mono text-sm text-muted-foreground">
          {price}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        We queue the subscription on your workspace and confirm from your
        dashboard.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          variant={isDone ? "outline" : "polished"}
          size="lg"
          disabled={state === "loading" || isDone}
          onClick={onSubscribe}
          className="w-full sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Requesting…
            </>
          ) : isDone ? (
            <>
              <Check className="size-4" />
              Requested
            </>
          ) : (
            <>
              Subscribe to {addonName}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
      {message ? (
        <p
          className={
            state === "error"
              ? "mt-3 text-xs text-destructive"
              : "mt-3 text-xs text-muted-foreground"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
