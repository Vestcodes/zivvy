import { z } from "zod";
import { actorSchema, isoDateTimeSchema, resourceRefSchema, tenantIdSchema } from "@zivvy/schemas";

export const eventResources = [
  "customers",
  "leads",
  "opportunities",
  "quotations",
  "sales-orders",
  "sales-invoices",
  "payment-entries",
  "items",
  "suppliers",
  "purchase-orders",
  "purchase-invoices",
  "bank-accounts",
  "bank-transactions",
  "employees",
  "projects",
  "tasks",
  "boms",
  "work-orders",
  "assets",
  "tickets",
  "wiki-pages",
  "webhooks",
  "integrations"
] as const;

export const eventActions = [
  "created",
  "updated",
  "deleted",
  "submitted",
  "cancelled",
  "paid",
  "failed",
  "synced"
] as const;

export type EventResource = (typeof eventResources)[number];
export type EventAction = (typeof eventActions)[number];
export type EventName = `${EventResource}.${EventAction}`;

export const eventEnvelopeSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(3),
  tenantId: tenantIdSchema,
  occurredAt: isoDateTimeSchema,
  actor: actorSchema.optional(),
  resource: resourceRefSchema,
  data: z.record(z.unknown()).default({}),
  source: z.enum(["erp-kernel", "api", "integration", "automation", "system"])
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export function makeEventName(resource: EventResource, action: EventAction): EventName {
  return `${resource}.${action}`;
}
