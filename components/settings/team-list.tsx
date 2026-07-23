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
import { frappeCall } from "@/lib/frappe-client";
import type { TeamMember } from "@/lib/team";
import { ASSIGNABLE_ROLES } from "@/lib/team";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

interface Props {
  members: TeamMember[];
  seatsUsed: number;
  seatsAllowed: number;
  currentUser: string;
}

function initials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamList({ members, seatsUsed, seatsAllowed, currentUser }: Props) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const atCapacity = seatsUsed >= seatsAllowed && seatsAllowed > 0;

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await frappeCall("frappe.core.doctype.user.user.invite_user", {
        email: inviteEmail.trim(),
        full_name: inviteFullName.trim() || undefined
      });
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteFullName("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }, [inviteEmail, inviteFullName, router]);

  const handleRemove = useCallback(async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await frappeCall("frappe.client.save", {
        doc: JSON.stringify({
          doctype: "User",
          name: removeTarget.name,
          enabled: 0
        })
      });
      toast.success(`${removeTarget.full_name || removeTarget.email} has been disabled`);
      setRemoveTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable user");
    } finally {
      setRemoving(false);
    }
  }, [removeTarget, router]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Team</h1>
            <p className="text-sm text-muted-foreground">
              {seatsUsed} of {seatsAllowed > 0 ? seatsAllowed : "unlimited"} seats used
            </p>
          </div>
          <Button
            variant="polished"
            size="sm"
            onClick={() => setInviteOpen(true)}
            disabled={atCapacity}
          >
            <UserPlus />
            {atCapacity ? "Seat limit reached" : "Invite member"}
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
                          <DropdownMenuItem disabled>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteOpen(true)}
                  >
                    <Plus />
                    Invite your first member
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <p className="text-xs text-muted-foreground">
              They'll receive an email with a link to set up their account.
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
