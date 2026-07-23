"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BellDot,
  CheckCheck,
  ExternalLink,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/notifications";
import { SLUG_TO_DOCTYPE } from "@/lib/doctype-slugs";

interface Props {
  notifications: Notification[];
  unreadCount: number;
}

const DOCTYPE_TO_SLUG: Record<string, string> = {};
for (const [slug, dt] of Object.entries(SLUG_TO_DOCTYPE)) {
  if (!DOCTYPE_TO_SLUG[dt]) {
    DOCTYPE_TO_SLUG[dt] = `/${slug}`;
  }
}

function docLink(doctype?: string, name?: string): string | null {
  if (!doctype || !name) return null;
  const basePath = DOCTYPE_TO_SLUG[doctype];
  if (!basePath) return null;
  return `${basePath}/${encodeURIComponent(name)}`;
}

function timeAgo(creation: string): string {
  const diff = Date.now() - new Date(creation).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(creation).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function NotificationBell({ notifications: serverNotifs, unreadCount: serverUnread }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const {
    notifications: items,
    unreadCount: unread,
    markRead,
    markAllRead
  } = useNotifications({ items: serverNotifs, unreadCount: serverUnread });

  const handleClick = useCallback((notif: Notification) => {
    if (!notif.read) {
      markRead(notif.name);
    }
    const href = docLink(notif.document_type, notif.document_name);
    if (href) {
      setOpen(false);
      startTransition(() => {
        router.push(href);
      });
    }
  }, [markRead, router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          className="relative"
        >
          {unread > 0 ? <BellDot /> : <Bell />}
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((notif) => {
                const href = docLink(notif.document_type, notif.document_name);
                const preview = notif.email_content
                  ? stripHtml(notif.email_content).slice(0, 120)
                  : null;

                return (
                  <button
                    key={notif.name}
                    type="button"
                    onClick={() => handleClick(notif)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !notif.read && "bg-primary/[0.03]"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {!notif.read ? (
                        <span className="block size-2 rounded-full bg-primary" />
                      ) : (
                        <span className="block size-2" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-sm leading-snug",
                        !notif.read && "font-medium"
                      )}>
                        {notif.subject}
                      </p>
                      {preview && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {preview}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{timeAgo(notif.creation)}</span>
                        {notif.document_type && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{notif.document_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {href && (
                      <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground/50" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
