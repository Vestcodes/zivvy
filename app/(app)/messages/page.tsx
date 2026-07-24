import type { Metadata } from "next";
import { MessagesClient } from "@/components/messages/messages-client";

export const metadata: Metadata = { title: "Messages — Zivvy" };

export default function MessagesPage() {
  return <MessagesClient />;
}
