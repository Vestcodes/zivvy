import {
  Boxes,
  CircleDollarSign,
  Clock,
  Inbox,
  PackageCheck,
  Receipt,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

/**
 * Doctype/event-kind → icon registry shared by the dashboard panels
 * (attention + activity) so that adding a new kind updates every surface
 * in lockstep.
 */
export const DASHBOARD_ICONS: Record<string, LucideIcon> = {
  // AttentionItem kinds
  "overdue-invoice": Receipt,
  "arriving-po": Clock,
  "low-stock": Boxes,
  // ActivityItem kinds
  payment: CircleDollarSign,
  delivery: PackageCheck,
  lead: UserPlus,
  invoice: Receipt,
};

export const DASHBOARD_FALLBACK_ICON: LucideIcon = Inbox;

export function iconForKind(kind: string): LucideIcon {
  return DASHBOARD_ICONS[kind] ?? DASHBOARD_FALLBACK_ICON;
}
