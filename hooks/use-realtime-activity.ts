"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";

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

    let cancelled = false;

    import("socket.io-client").then(({ io }) => {
      if (cancelled) return;

      const socket = io(origin, {
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      });
      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socket.on("notification", () => setNotifDelta((v) => v + 1));
      socket.on("notification_alert", () => setNotifDelta((v) => v + 1));

      socket.on("raven:new_message", () => setChatDelta((v) => v + 1));
      socket.on("raven_new_message", () => setChatDelta((v) => v + 1));
      socket.on("message_created", () => setChatDelta((v) => v + 1));
    });

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled]);

  const flush = () => {
    setNotifDelta(0);
    setChatDelta(0);
    router.refresh();
  };

  return { notifDelta, chatDelta, connected, flush };
}
