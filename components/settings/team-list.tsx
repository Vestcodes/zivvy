"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Plus,
  Shield,
  ShieldCheck,
  UserMinus,
  UserPlus
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SeatUpgradeDialog } from "@/components/settings/seat-upgrade-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import type { TeamMember } from "@/lib/team-roles";
import { ASSIGNABLE_ROLES } from "@/lib/team-roles";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useRegion } from "@/hooks/use-region";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Props {
  members: TeamMember[];
  seatsUsed: number;
  seatsAllowed: number;
  currentUser: string;
  hasSubscription: boolean;
}

function initials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamList({
  members,
  seatsUsed,
  seatsAllowed,
  currentUser,
  hasSubscription
}: Props) {
  const router = useRouter();
  // Business-tier monthly per-seat price from the region catalog — feeds
  // the seat-upgrade dialog so the delta rendering shows a real currency
  // figure. Falls back to 0 (which the dialog interprets as "hide") while
  // the catalog is still loading or errored.
  const region = useRegion();
  const pricePerSeatUsd =
    (region.catalog?.tiers?.business?.monthly?.amount_cents ?? 0) / 100;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [rolesTarget, setRolesTarget] = useState<TeamMember | null>(null);
  const [rolesDraft, setRolesDraft] = useState<Set<string>>(new Set());
  const [savingRoles, setSavingRoles] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("Sales User");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const atCapacity = seatsUsed >= seatsAllowed && seatsAllowed > 0;
  const seatsPct =
    seatsAllowed > 0
      ? Math.min(100, Math.round((seatsUsed / seatsAllowed) * 100))
      : 0;

  const handleAddTeammate = useCallback(() => {
    if (atCapacity) {
      setSeatDialogOpen(true);
    } else {
      setInviteOpen(true);
    }
  }, [atCapacity]);

  const handleInvite = useCallback(async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    try {
      await frappeCall("zivvy_brand.tenants.api.invite_user", {
        email,
        full_name: inviteFullName.trim() || undefined,
        role: inviteRole
      });
      toast.success(`Invitation sent to ${email}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteFullName("");
      setInviteRole("Sales User");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }, [inviteEmail, inviteFullName, inviteRole, router]);

  const handleRemove = useCallback(async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await frappeCall("zivvy_brand.tenants.api.disable_user", {
        email: removeTarget.name
      });
      toast.success(`${removeTarget.full_name || removeTarget.email} has been disabled`);
      setRemoveTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Failed to disable user");
    } finally {
      setRemoving(false);
    }
  }, [removeTarget, router]);

  const openRoles = useCallback((member: TeamMember) => {
    setRolesTarget(member);
    setRolesDraft(new Set(member.roles.filter((r) => (ASSIGNABLE_ROLES as readonly string[]).includes(r))));
  }, []);

  const toggleRole = useCallback((role: string) => {
    setRolesDraft((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const handleSaveRoles = useCallback(async () => {
    if (!rolesTarget) return;
    setSavingRoles(true);
    try {
      await frappeCall("zivvy_brand.tenants.api.set_user_roles", {
        email: rolesTarget.name,
        roles: JSON.stringify(Array.from(rolesDraft))
      });
      toast.success(`Roles updated for ${rolesTarget.full_name || rolesTarget.email}`);
      setRolesTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Failed to update roles");
    } finally {
      setSavingRoles(false);
    }
  }, [rolesTarget, rolesDraft, router]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Team</h1>
              <p className="text-sm text-muted-foreground">
                Manage teammates and the roles they hold on this workspace.
              </p>
            </div>
            <div className="max-w-md space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium text-foreground">Seats used</span>
                <span
                  className={cn(
                    "font-mono",
                    atCapacity ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                  )}
                >
                  {seatsUsed} of {seatsAllowed > 0 ? seatsAllowed : "unlimited"}
                </span>
              </div>
              {seatsAllowed > 0 && (
                <Progress
                  value={seatsPct}
                  className={cn("h-1.5", atCapacity && "[&>*]:bg-amber-500")}
                />
              )}
              {atCapacity && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  You&apos;re at the seat cap. Add a seat to invite another teammate.
                </p>
              )}
            </div>
          </div>
          <Button
            variant="polished"
            size="sm"
            onClick={handleAddTeammate}
            className="sm:mt-1"
          >
            <UserPlus />
            Add teammate
          </Button>
        </div>

        <Card className="border-border/70 bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border/70">
              {members.map((member) => {
                const isCurrentUser = member.name === currentUser || member.email === currentUser;
                const topRoles = member.roles.slice(0, 3);
                const moreRoles = member.roles.length - 3;

                return (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 px-4 py-3 sm:px-6"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          member.enabled
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {initials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {member.full_name || member.email}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-[10px]">You</Badge>
                        )}
                        {!member.enabled && (
                          <Badge variant="outline" className="border-destructive/30 bg-destructive/5 text-destructive text-[10px]">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                        {member.last_login && (
                          <> · Last login {formatDate(member.last_login)}</>
                        )}
                      </p>
                    </div>

                    <div className="hidden items-center gap-1 sm:flex">
                      {topRoles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="border-border/70 bg-secondary/50 text-[10px] font-normal"
                        >
                          {role.includes("Manager") ? (
                            <ShieldCheck className="mr-0.5 size-2.5" />
                          ) : (
                            <Shield className="mr-0.5 size-2.5" />
                          )}
                          {role}
                        </Badge>
                      ))}
                      {moreRoles > 0 && (
                        <Badge
                          variant="outline"
                          className="border-border/70 bg-secondary/50 text-[10px] font-normal"
                        >
                          +{moreRoles}
                        </Badge>
                      )}
                    </div>

                    {!isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openRoles(member)}>
                            <Shield className="size-3.5" />
                            Edit roles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setRemoveTarget(member)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="size-3.5" />
                            Disable user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No team members yet
                  </p>
                  <Button variant="outline" size="sm" onClick={handleAddTeammate}>
                    <Plus />
                    Invite your first member
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seat-upgrade dialog — opens instead of Invite when at capacity */}
      <SeatUpgradeDialog
        open={seatDialogOpen}
        onOpenChange={setSeatDialogOpen}
        seatsUsed={seatsUsed}
        seatsAllowed={seatsAllowed}
        hasSubscription={hasSubscription}
        pricePerSeatUsd={pricePerSeatUsd}
        onDirectUpdate={() => setInviteOpen(true)}
      />

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-name">Full name (optional)</Label>
              <Input
                id="invite-name"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                placeholder="Jane Smith"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              They&apos;ll receive an email with a link to set their password. You can change their roles at any time.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="polished"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role editor */}
      <Dialog open={!!rolesTarget} onOpenChange={(o) => !o && setRolesTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit roles — {rolesTarget?.full_name || rolesTarget?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[50vh] gap-2 overflow-y-auto py-2">
            {ASSIGNABLE_ROLES.map((role) => {
              const checked = rolesDraft.has(role);
              return (
                <label
                  key={role}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/70 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(role)}
                    className="size-4 rounded border-border"
                  />
                  {role.includes("Manager") ? (
                    <ShieldCheck className="size-3.5 text-primary" />
                  ) : (
                    <Shield className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{role}</span>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRolesTarget(null)} disabled={savingRoles}>
              Cancel
            </Button>
            <Button variant="polished" onClick={handleSaveRoles} disabled={savingRoles}>
              {savingRoles ? "Saving…" : "Save roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Disable {removeTarget?.full_name || removeTarget?.email}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent them from logging in. Their data will be preserved
              and you can re-enable them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={removing}
            >
              {removing ? "Disabling…" : "Disable user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
