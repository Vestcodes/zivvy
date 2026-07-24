import { frappeCall } from "@/lib/frappe-client";

export interface RavenChannel {
  name: string;
  channel_name: string;
  channel_description?: string;
  type: "Private" | "Public" | "Open";
  is_direct_message: 0 | 1;
  is_self_message: 0 | 1;
  is_archived: 0 | 1;
  creation: string;
  last_message_timestamp?: string;
  last_message_details?: string;
  owner: string;
  peer_user_id?: string;
  peer_full_name?: string;
}

export interface RavenMessage {
  name: string;
  channel_id: string;
  text: string;
  message_type: "Text" | "Image" | "File" | "Poll" | "System";
  content?: string;
  file?: string;
  owner: string;
  creation: string;
  modified: string;
  is_reply: 0 | 1;
  linked_message?: string;
  is_edited: 0 | 1;
  is_bot_message: 0 | 1;
  message_reactions?: string;
  _liked_by?: string;
}

export interface MessagesResponse {
  message: {
    messages: RavenMessage[];
  };
}

export async function fetchChannels(): Promise<RavenChannel[]> {
  try {
    const res = await frappeCall<{ channels: RavenChannel[] }>(
      "raven.api.raven_channel.get_channels",
      { hide_archived: 1 }
    );
    return res?.channels ?? [];
  } catch {
    return [];
  }
}

export async function fetchMessages(channelId: string): Promise<RavenMessage[]> {
  try {
    const res = await frappeCall<Record<string, unknown>>(
      "raven.api.raven_message.get_messages_with_dates",
      { channel_id: channelId }
    );
    if (!res) return [];
    const messages = (res as { messages?: RavenMessage[] }).messages;
    if (Array.isArray(messages)) return messages;
    if (Array.isArray(res)) {
      return (res as unknown[]).filter(
        (m): m is RavenMessage =>
          typeof m === "object" && m !== null && "name" in m && "text" in m
      );
    }
    return [];
  } catch {
    return [];
  }
}

export async function sendMessage(
  channelId: string,
  text: string
): Promise<RavenMessage | null> {
  try {
    const res = await frappeCall<RavenMessage>(
      "raven.api.raven_message.send_message",
      { channel_id: channelId, text }
    );
    return res ?? null;
  } catch {
    return null;
  }
}

export async function createChannel(
  channelName: string,
  type: "Public" | "Private" = "Public"
): Promise<RavenChannel | null> {
  try {
    const res = await frappeCall<RavenChannel>("frappe.client.insert", {
      doc: JSON.stringify({
        doctype: "Raven Channel",
        channel_name: channelName,
        type
      })
    });
    return res ?? null;
  } catch {
    return null;
  }
}

export async function createDM(userId: string): Promise<RavenChannel | null> {
  try {
    const res = await frappeCall<RavenChannel>(
      "raven.api.raven_channel.create_direct_message_channel",
      { user_id: userId }
    );
    return res ?? null;
  } catch {
    return null;
  }
}

export async function fetchUnreadCounts(): Promise<Record<string, number>> {
  try {
    const res = await frappeCall<{ channels: Array<{ name: string; unread_count: number }> }>(
      "raven.api.raven_message.get_unread_count_for_channels"
    );
    const map: Record<string, number> = {};
    if (res?.channels) {
      for (const c of res.channels) {
        map[c.name] = c.unread_count;
      }
    }
    return map;
  } catch {
    return {};
  }
}
