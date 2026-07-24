"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BellDot,
  CheckCheck,
  ExternalLink,
  Inbox,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import type { Notification } from "@/lib/notifications";
import { SLUG_TO_DOCTYPE } from "@/lib/doctype-slugs";

interface Props {
  notifications: Notification[];
  unreadCount: number;
  unreadChat: number;
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

/**
 * ActivityPill — the single topbar surface for notifications AND unread chat.
 * Coalesces what was previously two separate buttons (Bell + ChatBadge) into
 * one control with tabs. Realtime is layered on top via useRealtimeActivity —
 * client-side deltas add to the server-rendered initial count and flush when
 * the popover opens.
 */
export function NotificationBell({
  notifications: serverNotifs,
  unreadCount: serverUnread,
  unreadChat: serverUnreadChat
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const {
    notifications: items,
    unreadCount: baseUnread,
    markRead,
    markAllRead
  } = useNotifications({ items: serverNotifs, unreadCount: serverUnread });

  const { notifDelta, chatDelta, connected, flush } = useRealtimeActivity({
    enabled: true
  });

  const notifUnread = baseUnread + notifDelta;
  const chatUnread = serverUnreadChat + chatDelta;
  const totalUnread = notifUnread + chatUnread;

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

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      // Popover just opened — reset realtime deltas + refresh so the list
      // reflects the truth on the server.
      flush();
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={
            totalUnread > 0
              ? `Activity — ${notifUnread} notification${notifUnread === 1 ? "" : "s"} and ${chatUnread} chat message${chatUnread === 1 ? "" : "s"}`
              : "Activity"
          }
          className="relative"
        >
          {totalUnread > 0 ? <BellDot /> : <Bell />}
          {totalUnread > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-destructive-foreground",
                chatUnread > 0 && notifUnread === 0 ? "bg-primary text-primary-foreground" : "bg-destructive"
              )}
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
          {connected && (
            <span
              aria-hidden
              className="absolute bottom-0 right-0 size-1.5 rounded-full bg-status-success-fg ring-2 ring-background"
              title="Realtime connected"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Activity</h3>
          {notifUnread > 0 && (
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              All{totalUnread > 0 && <span className="ms-1 text-[10px] text-muted-foreground">{totalUnread}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Chat{chatUnread > 0 && <span className="ms-1 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">{chatUnread}</span>}
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Alerts{notifUnread > 0 && <span className="ms-1 rounded-full bg-destructive/15 px-1.5 text-[10px] font-semibold text-destructive">{notifUnread}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ChatSummary chatUnread={chatUnread} />
            <NotificationList
              items={items}
              onClick={handleClick}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <ScrollArea className="max-h-[400px]">
              <ChatSummary chatUnread={chatUnread} expanded />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <NotificationList
              items={items}
              onClick={handleClick}
              filterUnreadOnly={false}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function ChatSummary({ chatUnread, expanded = false }: { chatUnread: number; expanded?: boolean }) {
  if (chatUnread === 0 && !expanded) return null;
  return (
    <Link
      href="/raven/channels"
      className={cn(
        "flex items-center gap-3 border-b bg-primary/[0.03] px-4 py-3 transition-colors hover:bg-primary/[0.06]",
        expanded && "border-b-0"
      )}
    >
      <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
        <MessageCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {chatUnread > 0
            ? `${chatUnread} unread ${chatUnread === 1 ? "message" : "messages"}`
            : "Team chat"}
        </p>
        <p className="text-xs text-muted-foreground">
          {chatUnread > 0 ? "Jump into channels to catch up." : "Open Raven"}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/60" />
    </Link>
  );
}

function NotificationList({
  items,
  onClick
}: {
  items: Notification[];
  onClick: (n: Notification) => void;
  filterUnreadOnly?: boolean;
}) {
  return (
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
                onClick={() => onClick(notif)}
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
                  <p className={cn("text-sm leading-snug", !notif.read && "font-medium")}>
                    {notif.subject}
                  </p>
                  {preview && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{preview}</p>
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
                {href && <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground/50" />}
              </button>
            );
          })}
        </div>
      )}
    </ScrollArea>
  );
}
