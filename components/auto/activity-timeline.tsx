"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Edit3,
  MessageSquare,
  Plus,
  FileCheck,
  Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { frappeCall } from "@/lib/frappe-client";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  kind: "created" | "modified" | "comment" | "submitted" | "cancelled" | "version";
  user: string;
  timestamp: string;
  content?: string;
}

interface Props {
  doctype: string;
  docname: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modifiedBy?: string;
}

function initials(name: string): string {
  return (name || "?")
    .replace(/@.+/, "")
    .split(/[.\s]+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

const KIND_ICON: Record<TimelineEvent["kind"], React.ElementType> = {
  created: Plus,
  modified: Edit3,
  comment: MessageSquare,
  submitted: FileCheck,
  cancelled: Ban,
  version: Clock
};

const KIND_COLOR: Record<TimelineEvent["kind"], string> = {
  created: "bg-primary/10 text-primary",
  modified: "bg-muted text-muted-foreground",
  comment: "bg-chart-2/10 text-chart-2",
  submitted: "bg-status-success-bg text-status-success-fg",
  cancelled: "bg-status-danger-bg text-status-danger-fg",
  version: "bg-muted text-muted-foreground"
};

export function ActivityTimeline({ doctype, docname, owner, creation, modified, modifiedBy }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const timeline: TimelineEvent[] = [];

      if (creation && owner) {
        timeline.push({
          id: "created",
          kind: "created",
          user: owner,
          timestamp: creation,
          content: `Created this ${doctype}`
        });
      }

      try {
        const comments = await frappeCall<Array<Record<string, unknown>>>(
          "frappe.client.get_list",
          {
            doctype: "Comment",
            fields: JSON.stringify(["name", "comment_by", "creation", "content", "comment_type"]),
            filters: JSON.stringify([
              ["Comment", "reference_doctype", "=", doctype],
              ["Comment", "reference_name", "=", docname]
            ]),
            order_by: "creation desc",
            limit_page_length: 20
          }
        );
        if (Array.isArray(comments)) {
          for (const c of comments) {
            const commentType = String(c.comment_type ?? "");
            if (commentType === "Like") continue;
            const isWorkflow = commentType === "Workflow" || commentType === "Submission" || commentType === "Cancellation";

            let kind: TimelineEvent["kind"] = "comment";
            if (commentType === "Submission") kind = "submitted";
            else if (commentType === "Cancellation") kind = "cancelled";
            else if (isWorkflow) kind = "version";

            timeline.push({
              id: String(c.name),
              kind,
              user: String(c.comment_by ?? ""),
              timestamp: String(c.creation ?? ""),
              content: stripHtml(String(c.content ?? ""))
            });
          }
        }
      } catch { /* silently fail */ }

      try {
        const versions = await frappeCall<Array<Record<string, unknown>>>(
          "frappe.client.get_list",
          {
            doctype: "Version",
            fields: JSON.stringify(["name", "owner", "creation"]),
            filters: JSON.stringify([
              ["Version", "ref_doctype", "=", doctype],
              ["Version", "docname", "=", docname]
            ]),
            order_by: "creation desc",
            limit_page_length: 10
          }
        );
        if (Array.isArray(versions)) {
          for (const v of versions) {
            timeline.push({
              id: `v-${v.name}`,
              kind: "modified",
              user: String(v.owner ?? ""),
              timestamp: String(v.creation ?? ""),
              content: "Updated this record"
            });
          }
        }
      } catch { /* silently fail */ }

      if (modified && modifiedBy && creation !== modified) {
        const hasModEntry = timeline.some(
          (e) => e.kind === "modified" && Math.abs(new Date(e.timestamp).getTime() - new Date(modified).getTime()) < 60000
        );
        if (!hasModEntry) {
          timeline.push({
            id: "last-modified",
            kind: "modified",
            user: modifiedBy,
            timestamp: modified,
            content: "Last modified"
          });
        }
      }

      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (!cancelled) {
        setEvents(timeline);
        setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [doctype, docname, owner, creation, modified, modifiedBy]);

  if (loading && events.length === 0) {
    return (
      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-lg">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 animate-pulse" />
            Loading activity…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) return null;

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative pl-8">
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-border/70" />
          {events.map((event, i) => {
            const Icon = KIND_ICON[event.kind];
            return (
              <div
                key={event.id}
                className={cn(
                  "relative flex gap-3 px-6 py-3",
                  i < events.length - 1 && "border-b border-border/40"
                )}
              >
                <div
                  className={cn(
                    "absolute -left-[0.125rem] top-3.5 z-10 grid size-6 place-items-center rounded-full",
                    KIND_COLOR[event.kind]
                  )}
                >
                  <Icon className="size-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {event.user.replace(/@.+/, "")}
                    </span>
                    {event.content && (
                      <span className="text-muted-foreground"> · {event.content}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(event.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
