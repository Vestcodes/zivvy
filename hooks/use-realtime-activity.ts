"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

/**
 * Realtime activity — opens a socket.io connection to the Frappe backend,
 * listens for notification + Raven events, and exposes a local delta counter
 * that supplements the server-rendered initial count.
 *
 * The pattern is deliberately conservative:
 *  - Connect once, guarded by an auth check (server-rendered initialUnread
 *    is >= 0 when the user is signed in; we skip the socket when not).
 *  - Increment a client-side delta on each realtime event.
 *  - Bell displays initialUnread + delta.
 *  - Call `flush()` when the popover opens: reset delta + router.refresh()
 *    to pull the fresh server count.
 *
 * If the socket ever fails to connect, everything degrades gracefully —
 * the bell just shows the server-rendered count on route changes.
 */

/**
 * Vercel does NOT proxy WebSocket upgrades through its rewrite layer, so the
 * client must connect directly to the Frappe backend host — not the same-origin
 * proxy path the REST API uses. On production zivvy.xyz that's api.zivvy.xyz.
 * On localhost dev, we default to the same origin (assume `bench start` is
 * proxied through Next's dev rewrites).
 */
function resolveRealtimeOrigin(): string {
  if (typeof window === "undefined") return "";
  const explicit = process.env.NEXT_PUBLIC_REALTIME_ORIGIN;
  if (explicit) return explicit;
  const host = window.location.hostname;
  if (host === "zivvy.xyz" || host === "www.zivvy.xyz") return "https://api.zivvy.xyz";
  // Any *.vercel.app preview build talks to prod backend by default.
  if (host.endsWith(".vercel.app")) return "https://api.zivvy.xyz";
  return window.location.origin;
}

interface Options {
  enabled: boolean;
}

interface Api {
  notifDelta: number;
  chatDelta: number;
  connected: boolean;
  flush: () => void;
}

export function useRealtimeActivity({ enabled }: Options): Api {
  const router = useRouter();
  const [notifDelta, setNotifDelta] = useState(0);
  const [chatDelta, setChatDelta] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const origin = resolveRealtimeOrigin();
    if (!origin) return;

    const socket = io(origin, {
      // Frappe's socket.io listens on /socket.io/ — same path across versions.
      path: "/socket.io",
      // We cross-origin from zivvy.xyz to api.zivvy.xyz; withCredentials
      // ensures the sid cookie rides for auth.
      withCredentials: true,
      // Prefer websocket but let socket.io fall back to polling on flaky
      // networks. Frappe's socket.io server supports both.
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Frappe generic notification event — fires on any notification insert.
    // Covers most modules (assignments, mentions, comments, etc.).
    const onNotification = () => {
      setNotifDelta((v) => v + 1);
    };
    socket.on("notification", onNotification);
    // Frappe's newer channel name — cover both to survive version drift.
    socket.on("notification_alert", onNotification);

    // Raven publishes on `raven:new_message` when a chat message lands.
    // The event payload has `channel_id` and `sender` — we only care about
    // counting for the badge.
    const onRaven = () => {
      setChatDelta((v) => v + 1);
    };
    socket.on("raven:new_message", onRaven);
    socket.on("raven_new_message", onRaven);
    socket.on("message_created", onRaven);

    return () => {
      socket.off("notification", onNotification);
      socket.off("notification_alert", onNotification);
      socket.off("raven:new_message", onRaven);
      socket.off("raven_new_message", onRaven);
      socket.off("message_created", onRaven);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const flush = () => {
    setNotifDelta(0);
    setChatDelta(0);
    router.refresh();
  };

  return { notifDelta, chatDelta, connected, flush };
}
