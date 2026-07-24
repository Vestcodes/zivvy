"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { frappeCall } from "@/lib/frappe-client";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

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
  const router = useRouter();
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
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => (
                <div
                  key={key.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{key.label}</span>
                      <Badge variant={key.enabled ? "default" : "secondary"} className="text-xs">
                        {key.enabled ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                        {key.key_preview}
                      </code>
                      {key.last_used && (
                        <span>Last used {formatDate(key.last_used)}</span>
                      )}
                    </div>
                  </div>
                  {key.enabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setRevokeTarget(key)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
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
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No webhooks configured. Add one to receive event notifications.
            </p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div
                  key={wh.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {wh.label || wh.url}
                      </span>
                      <Badge variant={wh.enabled ? "default" : "secondary"} className="text-xs shrink-0">
                        {wh.enabled ? "Active" : "Disabled"}
                      </Badge>
                      {wh.last_status && (
                        <span className="flex items-center gap-1 text-xs">
                          {wh.last_status === "Success" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      <code className="font-mono">{wh.url}</code>
                      {wh.total_deliveries > 0 && (
                        <span className="ml-2">{wh.total_deliveries} deliveries</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(wh)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
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

function EventsTab({ tenant }: { tenant: string }) {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No events yet. Events are logged when documents are created, updated, or submitted.
          </p>
        ) : (
          <div className="space-y-1">
            {events.map((ev) => (
              <div
                key={ev.name}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {ev.event_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground truncate">
                    {ev.resource_name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {formatDate(ev.creation)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
