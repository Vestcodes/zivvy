"use client";

/**
 * Seats card on /billing — mirrors the "seats used X of Y" chip on
 * /settings/team and shares the exact same SeatUpgradeDialog. Team is the
 * single mental model; do not fork the dialog UI.
 */

import { useState } from "react";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SeatUpgradeDialog } from "@/components/settings/seat-upgrade-dialog";
import type { ZivvyBoot } from "@/lib/boot-types";

interface Props {
  zivvy: ZivvyBoot;
  hasSubscription: boolean;
}

export function SeatsCard({ zivvy, hasSubscription }: Props) {
  const [open, setOpen] = useState(false);
  const seatsUsed = zivvy.seats_used ?? 0;
  const seatsAllowed = zivvy.seats_allowed ?? 0;
  const pct =
    seatsAllowed > 0
      ? Math.min(100, Math.round((seatsUsed / seatsAllowed) * 100))
      : 0;
  const atCap = seatsAllowed > 0 && seatsUsed >= seatsAllowed;

  return (
    <>
      <Card className="border-border/70 bg-card/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="font-display text-lg">Seats</CardTitle>
          </div>
          <CardDescription>
            {atCap
              ? "You've filled every seat on this plan."
              : "Buy or reduce seats without leaving the app."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium">In use</span>
            <span className="font-mono text-sm text-muted-foreground">
              {seatsUsed} / {seatsAllowed > 0 ? seatsAllowed : "—"}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </CardContent>
        <CardFooter>
          <Button
            variant={atCap ? "polished" : "outline"}
            onClick={() => setOpen(true)}
          >
            {atCap ? "Add a seat" : "Manage seats"}
          </Button>
        </CardFooter>
      </Card>

      <SeatUpgradeDialog
        open={open}
        onOpenChange={setOpen}
        seatsUsed={seatsUsed}
        seatsAllowed={seatsAllowed}
        hasSubscription={hasSubscription}
      />
    </>
  );
}
