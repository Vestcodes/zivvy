"use client";

/**
 * Fires a "seats added" toast when the user lands on /dashboard from a
 * Polar success URL (`?polar_seats_updated=1`), then strips the param so
 * a refresh doesn't re-fire it. Mirrors PolarReturnToast but for the
 * seat-upgrade flow (which returns to /dashboard, not /settings).
 */

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SeatsReturnToast() {
  const search = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const flag = search?.get("polar_seats_updated");
    if (flag !== "1") return;
    fired.current = true;

    const seatsParam = search?.get("seats");
    const seats = seatsParam ? Number(seatsParam) : NaN;
    const suffix = Number.isFinite(seats) && seats > 0 ? ` (${seats} total)` : "";
    toast.success(`Seat added — invite anyone now${suffix}.`);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("polar_seats_updated");
      url.searchParams.delete("seats");
      url.searchParams.delete("tier");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, [search]);

  return null;
}
