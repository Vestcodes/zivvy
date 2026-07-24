"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Hash,
  Lock,
  MessagesSquare,
  Plus,
  Search,
  Send,
  User,
  Users,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  fetchChannels,
  fetchMessages,
  sendMessage,
  fetchUnreadCounts,
  type RavenChannel,
  type RavenMessage
} from "@/lib/raven-api";
import { NewChannelDialog } from "@/components/messages/new-channel-dialog";

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
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMessageTime(ts: string): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function channelDisplayName(ch: RavenChannel): string {
  if (ch.is_direct_message && ch.peer_full_name) return ch.peer_full_name;
  return ch.channel_name || ch.name;
}

function lastMessagePreview(ch: RavenChannel): string {
  if (!ch.last_message_details) return "";
  try {
    const details = JSON.parse(ch.last_message_details);
    return details.text?.replace(/<[^>]*>/g, "")?.slice(0, 80) ?? "";
  } catch {
    return "";
  }
}

export function MessagesClient() {
  const [channels, setChannels] = useState<RavenChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<RavenChannel | null>(null);
  const [messages, setMessages] = useState<RavenMessage[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [chs, unreads] = await Promise.all([
        fetchChannels(),
        fetchUnreadCounts()
      ]);
      if (cancelled) return;
      const sorted = chs.sort((a, b) => {
        const ta = a.last_message_timestamp ?? a.creation;
        const tb = b.last_message_timestamp ?? b.creation;
        return new Date(tb).getTime() - new Date(ta).getTime();
      });
      setChannels(sorted);
      setUnreadMap(unreads);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const selectChannel = useCallback(async (ch: RavenChannel) => {
    setActiveChannel(ch);
    setMessagesLoading(true);
    setMessages([]);
    const msgs = await fetchMessages(ch.name);
    setMessages(msgs);
    setMessagesLoading(false);
    setUnreadMap((prev) => ({ ...prev, [ch.name]: 0 }));
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, 100);
  }, []);

  const handleSend = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeChannel || sending) return;
    const form = e.currentTarget;
    const text = new FormData(form).get("message") as string;
    if (!text?.trim()) return;
    setSending(true);
    const sent = await sendMessage(activeChannel.name, text.trim());
    if (sent) {
      setMessages((prev) => [...prev, sent]);
      form.reset();
      inputRef.current?.focus();
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    } else {
      toast.error("Failed to send message");
    }
    setSending(false);
  }, [activeChannel, sending]);

  const handleChannelCreated = useCallback((ch: RavenChannel) => {
    setChannels((prev) => [ch, ...prev]);
    setShowNewChannel(false);
    void selectChannel(ch);
  }, [selectChannel]);

  const filtered = search
    ? channels.filter((ch) =>
        channelDisplayName(ch).toLowerCase().includes(search.toLowerCase())
      )
    : channels;

  const dmChannels = filtered.filter((c) => c.is_direct_message === 1);
  const groupChannels = filtered.filter((c) => c.is_direct_message === 0);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.12)-theme(spacing.10))] overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {/* Channel sidebar */}
      <div
        className={cn(
          "flex w-full flex-col border-r border-border/50 md:w-72 lg:w-80",
          activeChannel && "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h1 className="font-display text-lg">Messages</h1>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowNewChannel(true)}
            title="New channel"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : channels.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <MessagesSquare className="size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium">No conversations yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a channel to start chatting with your team.
              </p>
              <Button
                variant="polished"
                size="sm"
                className="mt-3"
                onClick={() => setShowNewChannel(true)}
              >
                <Plus className="size-3.5" />
                New channel
              </Button>
            </div>
          ) : (
            <div className="px-2 py-1">
              {groupChannels.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Channels
                    </span>
                  </div>
                  {groupChannels.map((ch) => (
                    <ChannelItem
                      key={ch.name}
                      channel={ch}
                      active={activeChannel?.name === ch.name}
                      unread={unreadMap[ch.name] ?? 0}
                      onClick={() => selectChannel(ch)}
                    />
                  ))}
                </>
              )}

              {dmChannels.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-2 py-2 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Direct messages
                    </span>
                  </div>
                  {dmChannels.map((ch) => (
                    <ChannelItem
                      key={ch.name}
                      channel={ch}
                      active={activeChannel?.name === ch.name}
                      unread={unreadMap[ch.name] ?? 0}
                      onClick={() => selectChannel(ch)}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message area */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !activeChannel && "hidden md:flex"
        )}
      >
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setActiveChannel(null)}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-2">
                {activeChannel.is_direct_message ? (
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials(channelDisplayName(activeChannel))}
                    </AvatarFallback>
                  </Avatar>
                ) : activeChannel.type === "Private" ? (
                  <Lock className="size-4 text-muted-foreground" />
                ) : (
                  <Hash className="size-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {channelDisplayName(activeChannel)}
                  </p>
                  {activeChannel.channel_description && (
                    <p className="text-xs text-muted-foreground">
                      {activeChannel.channel_description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
                    <MessagesSquare className="size-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-medium">
                    Start the conversation
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Send a message to begin chatting in{" "}
                    {channelDisplayName(activeChannel)}.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((msg, i) => {
                    const prevMsg = messages[i - 1];
                    const sameSender =
                      prevMsg?.owner === msg.owner &&
                      new Date(msg.creation).getTime() -
                        new Date(prevMsg.creation).getTime() <
                        300000;
                    return (
                      <MessageBubble
                        key={msg.name}
                        message={msg}
                        compact={sameSender}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border/50 px-4 py-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  name="message"
                  type="text"
                  placeholder={`Message ${channelDisplayName(activeChannel)}...`}
                  autoComplete="off"
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="polished"
                  disabled={sending}
                  className="shrink-0"
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="bg-primary-gradient grid size-14 place-items-center rounded-2xl text-primary-foreground shadow-sm">
              <MessagesSquare className="size-6" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-display text-xl">Your messages</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Select a conversation or create a new channel to start chatting
              with your team.
            </p>
          </div>
        )}
      </div>

      <NewChannelDialog
        open={showNewChannel}
        onOpenChange={setShowNewChannel}
        onCreated={handleChannelCreated}
      />
    </div>
  );
}

function ChannelItem({
  channel,
  active,
  unread,
  onClick
}: {
  channel: RavenChannel;
  active: boolean;
  unread: number;
  onClick: () => void;
}) {
  const preview = lastMessagePreview(channel);
  const isDM = channel.is_direct_message === 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/60"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {isDM ? (
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-[11px] text-primary">
              {initials(channelDisplayName(channel))}
            </AvatarFallback>
          </Avatar>
        ) : channel.type === "Private" ? (
          <div className="grid size-8 place-items-center rounded-lg bg-muted">
            <Lock className="size-3.5 text-muted-foreground" />
          </div>
        ) : (
          <div className="grid size-8 place-items-center rounded-lg bg-muted">
            <Hash className="size-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              unread > 0 ? "font-semibold" : "font-medium"
            )}
          >
            {channelDisplayName(channel)}
          </span>
          {channel.last_message_timestamp && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {timeAgo(channel.last_message_timestamp)}
            </span>
          )}
        </div>
        {preview && (
          <p
            className={cn(
              "mt-0.5 truncate text-xs",
              unread > 0
                ? "text-foreground/70"
                : "text-muted-foreground"
            )}
          >
            {preview}
          </p>
        )}
      </div>
      {unread > 0 && (
        <Badge className="mt-1 h-5 min-w-5 shrink-0 justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </Badge>
      )}
    </button>
  );
}

function MessageBubble({
  message,
  compact
}: {
  message: RavenMessage;
  compact: boolean;
}) {
  const sender = message.owner?.replace(/@.+/, "") ?? "Unknown";
  const text = message.text?.replace(/<[^>]*>/g, "") ?? "";

  if (compact) {
    return (
      <div className="group flex items-start gap-10 py-0.5 pl-12 hover:bg-muted/30">
        <span className="invisible text-[11px] text-muted-foreground group-hover:visible">
          {formatMessageTime(message.creation)}
        </span>
        <p className="min-w-0 flex-1 text-sm">{text}</p>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg py-2 hover:bg-muted/30">
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs">
          {initials(sender)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{sender}</span>
          <span className="text-[11px] text-muted-foreground">
            {formatMessageTime(message.creation)}
          </span>
        </div>
        <p className="mt-0.5 text-sm">{text}</p>
      </div>
    </div>
  );
}
