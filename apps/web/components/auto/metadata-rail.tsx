import { Clock, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  owner?: string;
  creation?: string;
  modified?: string;
  modifiedBy?: string;
  className?: string;
}

function formatRelative(iso: string | undefined): { label: string; iso: string } | null {
  if (!iso) return null;
  const date = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return { label: "just now", iso };
  if (min < 60) return { label: `${min}m ago`, iso };
  const h = Math.round(min / 60);
  if (h < 24) return { label: `${h}h ago`, iso };
  const d = Math.round(h / 24);
  if (d < 7) return { label: `${d}d ago`, iso };
  return {
    label: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
    }).format(date),
    iso
  };
}

function shortName(email: string | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  if (!trimmed || trimmed === "Guest") return null;
  const local = trimmed.split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * MetadataRail — the sticky right-rail card on the two-column detail workspace.
 * Shows a scan-friendly summary of ownership + timestamps that supplements the
 * form body without pushing it below the fold. Deliberately compact: caption
 * eyebrows, one-line values.
 */
export function MetadataRail({ owner, creation, modified, modifiedBy, className }: Props) {
  const createdLabel = formatRelative(creation);
  const modifiedLabel = formatRelative(modified);
  const ownerName = shortName(owner);
  const modifiedByName = shortName(modifiedBy);

  const rows: Array<{ label: string; value: React.ReactNode; hint?: string; icon: React.ReactNode }> = [];

  if (ownerName) {
    rows.push({
      label: "Owner",
      value: ownerName,
      hint: owner,
      icon: <User2 className="size-3.5" />
    });
  }
  if (createdLabel) {
    rows.push({
      label: "Created",
      value: createdLabel.label,
      hint: createdLabel.iso,
      icon: <Clock className="size-3.5" />
    });
  }
  if (modifiedLabel) {
    rows.push({
      label: "Updated",
      value: modifiedLabel.label,
      hint: modifiedByName ? `by ${modifiedByName}` : modifiedLabel.iso,
      icon: <Clock className="size-3.5" />
    });
  }

  if (rows.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-border/70 bg-card p-5 shadow-sm",
        className
      )}
      aria-label="Record metadata"
    >
      <p className="type-caption font-semibold uppercase tracking-[0.14em]">Details</p>
      <dl className="mt-3 grid gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="text-muted-foreground/70">{row.icon}</span>
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 text-right">
              <span className="block truncate text-sm font-medium text-foreground">{row.value}</span>
              {row.hint && (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.hint}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
