"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createChannel, type RavenChannel } from "@/lib/raven-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (channel: RavenChannel) => void;
}

export function NewChannelDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const ch = await createChannel(name.trim(), type);
      if (ch) {
        onCreated(ch);
        setName("");
        setType("Public");
        toast.success(`Channel #${ch.channel_name || name.trim()} created`);
      } else {
        toast.error("Failed to create channel");
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message.replace(/<[^>]+>/g, "")
          : "Failed to create channel";
      toast.error(msg);
    }
    setCreating(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>New channel</DialogTitle>
            <DialogDescription>
              Create a channel for your team to discuss topics, projects, or anything else.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="channel-name">Channel name</Label>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. product-updates"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "Public" | "Private")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">
                    Public — anyone can join
                  </SelectItem>
                  <SelectItem value="Private">
                    Private — invite only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="polished"
              disabled={creating || !name.trim()}
            >
              {creating && <Loader2 className="size-3.5 animate-spin" />}
              {creating ? "Creating..." : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
