"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { frappeCall, FrappeError } from "@/lib/frappe-client";
import { cn } from "@/lib/utils";
import {
  MODULES,
  PRESETS,
  rolesToModuleAccess,
  moduleAccessToRoles,
  type AccessLevel,
  type ModuleConfig,
} from "@/lib/module-roles";

interface RoleTemplate {
  name: string;
  template_name: string;
  description: string;
  is_default: boolean;
  roles: string[];
}

const API = "zivvy_brand.tenants.api";

function AccessToggle({
  value,
  onChange,
}: {
  value: AccessLevel;
  onChange: (v: AccessLevel) => void;
}) {
  const levels: { key: AccessLevel; label: string }[] = [
    { key: "none", label: "None" },
    { key: "view", label: "View" },
    { key: "full", label: "Full" },
  ];

  return (
    <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
      {levels.map((l) => (
        <button
          key={l.key}
          type="button"
          onClick={() => onChange(l.key)}
          className={cn(
            "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
            value === l.key
              ? l.key === "none"
                ? "bg-background text-muted-foreground shadow-sm"
                : l.key === "view"
                  ? "bg-blue-500/10 text-blue-600 shadow-sm dark:text-blue-400"
                  : "bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400"
              : "text-muted-foreground/60 hover:text-muted-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function ModuleRow({
  mod,
  value,
  onChange,
}: {
  mod: ModuleConfig;
  value: AccessLevel;
  onChange: (v: AccessLevel) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{mod.label}</p>
        <p className="text-xs text-muted-foreground">{mod.description}</p>
      </div>
      <AccessToggle value={value} onChange={onChange} />
    </div>
  );
}

function RoleEditor({
  open,
  onClose,
  existing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  existing: RoleTemplate | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<Record<string, AccessLevel>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (existing) {
        setName(existing.template_name);
        setDescription(existing.description || "");
        setAccess(rolesToModuleAccess(existing.roles));
      } else {
        setName("");
        setDescription("");
        setAccess(
          Object.fromEntries(MODULES.map((m) => [m.key, "none" as const]))
        );
      }
    }
  }, [open, existing]);

  function applyPreset(presetName: string) {
    const preset = PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setAccess({ ...preset.access });
      if (!name) setName(preset.name);
      if (!description) setDescription(preset.description);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    const roles = moduleAccessToRoles(access);
    if (roles.length === 0) {
      toast.error("Select at least one module");
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await frappeCall(`${API}.update_role_template`, {
          name: existing.name,
          template_name: name.trim(),
          description: description.trim(),
          roles: JSON.stringify(roles),
        });
        toast.success("Role updated");
      } else {
        await frappeCall(`${API}.create_role_template`, {
          template_name: name.trim(),
          description: description.trim(),
          roles: JSON.stringify(roles),
        });
        toast.success("Role created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof FrappeError ? err.message : "Could not save role"
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount = Object.values(access).filter((v) => v !== "none").length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit role" : "Create role"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              placeholder="e.g. Sales Rep"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">Description</Label>
            <Input
              id="role-desc"
              placeholder="What this role is for (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {!existing && (
            <div className="flex flex-wrap gap-1.5">
              <span className="mr-1 self-center text-xs text-muted-foreground">
                Start from:
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.name)}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-sm font-medium">Module access</p>
              <p className="text-xs text-muted-foreground">
                {activeCount} of {MODULES.length} active
              </p>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border px-4">
              {MODULES.map((mod) => (
                <ModuleRow
                  key={mod.key}
                  mod={mod}
                  value={access[mod.key] ?? "none"}
                  onChange={(v) =>
                    setAccess((prev) => ({ ...prev, [mod.key]: v }))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="polished" onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving..."
              : existing
                ? "Save changes"
                : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: RoleTemplate;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const access = rolesToModuleAccess(template.roles);
  const activeModules = MODULES.filter((m) => access[m.key] !== "none");

  return (
    <Card className="border-border/70">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Shield className="size-4 shrink-0 text-muted-foreground" />
              <h3 className="truncate text-sm font-semibold">
                {template.template_name}
              </h3>
              {template.is_default && (
                <Badge variant="secondary" className="text-[10px]">
                  Default
                </Badge>
              )}
            </div>
            {template.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {activeModules.map((mod) => (
                <span
                  key={mod.key}
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    access[mod.key] === "full"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {mod.label}
                  {access[mod.key] === "view" && (
                    <span className="ml-0.5 opacity-60">view</span>
                  )}
                </span>
              ))}
              {activeModules.length === 0 && (
                <span className="text-[10px] text-muted-foreground">
                  No modules selected
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="size-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoleManager() {
  const router = useRouter();
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const result = await frappeCall<RoleTemplate[]>(
        `${API}.list_role_templates`
      );
      setTemplates(result ?? []);
    } catch {
      toast.error("Could not load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleCreate() {
    setEditTarget(null);
    setEditorOpen(true);
  }

  function handleEdit(t: RoleTemplate) {
    setEditTarget(t);
    setEditorOpen(true);
  }

  function handleDuplicate(t: RoleTemplate) {
    setEditTarget({
      ...t,
      name: "",
      template_name: `${t.template_name} (copy)`,
      is_default: false,
    });
    setEditorOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await frappeCall(`${API}.delete_role_template`, {
        name: deleteTarget.name,
      });
      toast.success("Role deleted");
      setDeleteTarget(null);
      fetchTemplates();
    } catch (err) {
      toast.error(
        err instanceof FrappeError ? err.message : "Could not delete role"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define what each role can access, then assign roles to team members.
          </p>
        </div>
        <Button variant="polished" onClick={handleCreate}>
          <Plus className="size-4" />
          New role
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/70">
              <CardContent className="p-4">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-border/70 bg-card">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <Shield className="size-5" />
            </div>
            <p className="mt-3 font-display text-lg">No roles yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Roles let you control which modules each team member can access.
              Start from a preset or build from scratch.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {PRESETS.slice(0, 3).map((p) => (
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditTarget({
                      name: "",
                      template_name: p.name,
                      description: p.description,
                      is_default: false,
                      roles: moduleAccessToRoles(p.access),
                    });
                    setEditorOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <RoleCard
              key={t.name}
              template={t}
              onEdit={() => handleEdit(t)}
              onDuplicate={() => handleDuplicate(t)}
              onDelete={() => setDeleteTarget(t)}
            />
          ))}
        </div>
      )}

      <RoleEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditTarget(null);
        }}
        existing={editTarget?.name ? editTarget : null}
        onSaved={fetchTemplates}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the &ldquo;{deleteTarget?.template_name}&rdquo;
              role template. Team members who were assigned this role will keep
              their current permissions until you reassign them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
