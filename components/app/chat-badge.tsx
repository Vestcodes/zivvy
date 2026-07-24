import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  unread: number;
}

/**
 * Small chat button in the topbar that shows unread Raven count.
 * Fetched server-side via `fetchUnreadChatCount` in the (app) layout.
 * On click, deep-links to /raven/channels — the user can catch up from there.
 */
export function ChatBadge({ unread }: Props) {
  const hasUnread = unread > 0;
  return (
    <Link
      href="/raven/channels"
      aria-label={hasUnread ? `${unread} unread chat message${unread === 1 ? "" : "s"}` : "Chat"}
      className={cn(
        "relative grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        hasUnread && "text-foreground"
      )}
    >
      <MessageCircle className="size-4" />
      {hasUnread && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground shadow-sm ring-2 ring-background"
          style={{ height: 16 }}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
