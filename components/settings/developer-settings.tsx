"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  MoreHorizontal,
  Plus,
  Trash2,
  Webhook,
  Activity,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { frappeCall } from "@/lib/frappe-client";
import { formatDate, formatDateTime, formatRelative } from "@/lib/format";
import type { StatusTone } from "@/lib/status";

interface Props {
  tenant: string;
  tier: string;
  currentUser: string;
}

interface ApiKey {
  name: string;
  label: string;
  key_preview: string;
  tier: string;
  enabled: boolean;
  last_used: string | null;
  creation: string;
}

interface WebhookSub {
  name: string;
  url: string;
  label: string;
  events: string;
  enabled: boolean;
  last_status: string;
  total_deliveries: number;
  creation: string;
}

interface EventEntry {
  name: string;
  event_type: string;
  resource: string;
  resource_name: string;
  creation: string;
}

export function DeveloperSettings({ tenant, tier, currentUser }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Developer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys, webhooks, and view event logs.
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <Key className="h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5">
            <Webhook className="h-3.5 w-3.5" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <ApiKeysTab tenant={tenant} currentUser={currentUser} />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="events">
          <EventsTab tenant={tenant} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">API Documentation</CardTitle>
          <CardDescription>
            Full REST API reference with interactive examples.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="https://api.zivvy.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open API Docs
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// API Keys Tab
// ─────────────────────────────────────────────────────────

function ApiKeysTab({ tenant, currentUser }: { tenant: string; currentUser: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await frappeCall<ApiKey[]>(
        "zivvy_brand.api.keys.list_api_keys"
      );
      setKeys(data ?? []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyLabel.trim()) return;
    setCreating(true);
    try {
      const result = await frappeCall<{ api_key: string; name: string }>(
        "zivvy_brand.api.keys.generate_api_key",
        { label: newKeyLabel.trim() }
      );
      setCreatedKey(result?.api_key ?? null);
      setShowKey(true);
      toast.success("API key created");
      fetchKeys();
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await frappeCall("zivvy_brand.api.keys.revoke_api_key", {
        key_name: revokeTarget.name,
      });
      toast.success("API key revoked");
      setRevokeTarget(null);
      fetchKeys();
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const columns: Array<DataListColumn<ApiKey>> = [
    {
      key: "label",
      header: "Label",
      sortKey: "label",
      cell: (k) => <span className="font-medium">{k.label}</span>,
    },
    {
      key: "preview",
      header: "Preview",
      cell: (k) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {k.key_preview}
        </code>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      cell: (k) =>
        k.tier ? (
          <Badge variant="outline" className="text-xs">
            {k.tier}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "enabled",
      cell: (k) => (
        <StatusBadge
          status={k.enabled ? "Active" : "Revoked"}
          tone={k.enabled ? "success" : "danger"}
        />
      ),
    },
    {
      key: "last_used",
      header: "Last used",
      align: "right",
      sortKey: "last_used",
      cell: (k) =>
        k.last_used ? (
          <span
            className="whitespace-nowrap text-xs text-muted-foreground"
            title={formatDateTime(k.last_used)}
          >
            {formatRelative(k.last_used)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Never</span>
        ),
    },
    {
      key: "creation",
      header: "Created",
      align: "right",
      sortKey: "creation",
      cell: (k) => (
        <span
          className="whitespace-nowrap text-xs text-muted-foreground"
          title={formatDateTime(k.creation)}
        >
          {formatDate(k.creation)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription className="mt-1">
              Create and manage API keys for programmatic access.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => { setCreateOpen(true); setNewKeyLabel(""); setCreatedKey(null); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          <DataList<ApiKey>
            columns={columns}
            rows={keys}
            loading={loading}
            loadingRowCount={2}
            rowKey={(k) => k.name}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No API keys yet. Create one to get started.
              </div>
            }
            rowActions={(k) =>
              k.enabled ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setRevokeTarget(k)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null
            }
          />
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "API Key Created" : "Create API Key"}</DialogTitle>
            {!createdKey && (
              <DialogDescription>
                Give your key a label to identify its purpose.
              </DialogDescription>
            )}
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy this key now — you won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border bg-muted px-3 py-2 font-mono text-xs break-all">
                  {showKey ? createdKey : "•".repeat(40)}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Label</Label>
                <Input
                  placeholder="e.g. Production, Staging, CI/CD"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {createdKey ? (
              <Button onClick={() => setCreateOpen(false)}>Done</Button>
            ) : (
              <Button onClick={handleCreate} disabled={!newKeyLabel.trim() || creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately disable the key &quot;{revokeTarget?.label}&quot;.
              Any integrations using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-destructive text-destructive-foreground">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Webhooks Tab
// ─────────────────────────────────────────────────────────

function WebhooksTab({ tenant }: { tenant: string }) {
  const [webhooks, setWebhooks] = useState<WebhookSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebhookSub | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newEvents, setNewEvents] = useState("*");
  const [creating, setCreating] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const data = await frappeCall<WebhookSub[]>(
        "zivvy_brand.api.developer.list_webhooks"
      );
      setWebhooks(data ?? []);
    } catch {
      toast.error("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    setCreating(true);
    try {
      await frappeCall("zivvy_brand.api.developer.create_webhook", {
        url: newUrl.trim(),
        label: newLabel.trim(),
        events: newEvents.trim(),
      });
      toast.success("Webhook created");
      setCreateOpen(false);
      fetchWebhooks();
    } catch {
      toast.error("Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await frappeCall("zivvy_brand.api.developer.delete_webhook", {
        webhook_name: deleteTarget.name,
      });
      toast.success("Webhook deleted");
      setDeleteTarget(null);
      fetchWebhooks();
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const columns: Array<DataListColumn<WebhookSub>> = [
    {
      key: "label",
      header: "Label",
      sortKey: "label",
      cell: (w) => (
        <div className="min-w-0 max-w-[220px]">
          <div className="truncate text-sm font-medium">
            {w.label || "Untitled"}
          </div>
          <div
            className="truncate font-mono text-xs text-muted-foreground"
            title={w.url}
          >
            {w.url}
          </div>
        </div>
      ),
    },
    {
      key: "events",
      header: "Events",
      cell: (w) => {
        const raw = (w.events || "").trim();
        if (!raw || raw === "*") {
          return (
            <Badge variant="outline" className="text-xs">
              All events
            </Badge>
          );
        }
        const list = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const visible = list.slice(0, 2);
        const overflow = list.length - visible.length;
        return (
          <div className="flex max-w-[260px] flex-wrap items-center gap-1">
            {visible.map((ev) => (
              <Badge key={ev} variant="outline" className="font-mono text-[10px]">
                {ev}
              </Badge>
            ))}
            {overflow > 0 ? (
              <span className="text-xs text-muted-foreground">+{overflow}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "deliveries",
      header: "Deliveries",
      align: "right",
      sortKey: "total_deliveries",
      cell: (w) => (
        <span className="tabular-nums text-sm">{w.total_deliveries ?? 0}</span>
      ),
    },
    {
      key: "last_delivery",
      header: "Last delivery",
      cell: (w) =>
        w.last_status ? (
          <StatusBadge status={w.last_status} />
        ) : (
          <span className="text-xs text-muted-foreground">Never</span>
        ),
    },
    {
      key: "enabled",
      header: "Status",
      sortKey: "enabled",
      cell: (w) => (
        <StatusBadge
          status={w.enabled ? "Active" : "Disabled"}
          tone={w.enabled ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "creation",
      header: "Created",
      align: "right",
      sortKey: "creation",
      cell: (w) => (
        <span
          className="whitespace-nowrap text-xs text-muted-foreground"
          title={formatDateTime(w.creation)}
        >
          {formatDate(w.creation)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription className="mt-1">
              Receive real-time notifications when events happen in your account.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => { setCreateOpen(true); setNewUrl(""); setNewLabel(""); setNewEvents("*"); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          <DataList<WebhookSub>
            columns={columns}
            rows={webhooks}
            loading={loading}
            loadingRowCount={2}
            rowKey={(w) => w.name}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No webhooks configured. Add one to receive event notifications.
              </div>
            }
            rowActions={(w) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteTarget(w)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      {/* Create Webhook Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              We&apos;ll POST a JSON payload to your URL whenever subscribed events occur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Endpoint URL</Label>
              <Input
                placeholder="https://example.com/webhooks/zivvy"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input
                placeholder="e.g. Production webhook"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div>
              <Label>Events</Label>
              <Input
                placeholder='* (all events) or comma-separated: sales-orders.created, invoices.submitted'
                value={newEvents}
                onChange={(e) => setNewEvents(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use &quot;*&quot; for all events, or specify individual events like &quot;sales-orders.created&quot;.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!newUrl.trim() || creating}>
              {creating ? "Creating..." : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              No further events will be delivered to {deleteTarget?.url}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Events Tab
// ─────────────────────────────────────────────────────────

/** Map event verb (created/updated/submitted/deleted) to a status tone. */
function eventVerbTone(eventType: string): StatusTone {
  const t = eventType.toLowerCase();
  if (t.includes("delete") || t.includes("cancel")) return "danger";
  if (t.includes("submit") || t.includes("approve")) return "success";
  if (t.includes("update") || t.includes("modif")) return "progress";
  if (t.includes("create")) return "info";
  return "neutral";
}

function EventsTab({ tenant }: { tenant: string }) {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [payloadTarget, setPayloadTarget] = useState<EventEntry | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await frappeCall<EventEntry[]>(
        "zivvy_brand.api.developer.list_events"
      );
      setEvents(data ?? []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const columns: Array<DataListColumn<EventEntry>> = [
    {
      key: "event_type",
      header: "Event",
      sortKey: "event_type",
      cell: (ev) => (
        <StatusBadge status={ev.event_type} tone={eventVerbTone(ev.event_type)} />
      ),
    },
    {
      key: "resource",
      header: "Resource",
      cell: (ev) => (
        <div className="max-w-[260px] min-w-0">
          <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">
            {ev.resource || "—"}
          </div>
          <div className="truncate font-mono text-xs" title={ev.resource_name}>
            {ev.resource_name || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "ref",
      header: "Ref",
      cell: (ev) => (
        <code className="font-mono text-xs text-muted-foreground">{ev.name}</code>
      ),
    },
    {
      key: "when",
      header: "When",
      align: "right",
      sortKey: "creation",
      cell: (ev) => (
        <span
          className="whitespace-nowrap text-xs text-muted-foreground"
          title={formatDateTime(ev.creation)}
        >
          {formatRelative(ev.creation)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Event Log</CardTitle>
            <CardDescription className="mt-1">
              Recent events from your account — use these to debug webhook deliveries.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchEvents(); }}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <DataList<EventEntry>
            columns={columns}
            rows={events}
            loading={loading}
            loadingRowCount={3}
            rowKey={(ev) => ev.name}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No events yet. Events are logged when documents are created, updated, or submitted.
              </div>
            }
            rowActions={(ev) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPayloadTarget(ev)}>
                    View payload
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(ev.name);
                      toast.success("Event id copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy id
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={!!payloadTarget} onOpenChange={() => setPayloadTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event payload</DialogTitle>
            <DialogDescription>
              {payloadTarget?.event_type} · {payloadTarget?.resource_name}
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-[400px] overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs">
            {JSON.stringify(payloadTarget ?? {}, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
