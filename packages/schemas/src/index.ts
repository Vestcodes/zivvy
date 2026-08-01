import { z } from "zod";

export const tenantIdSchema = z.string().min(1).max(140);
export const isoDateTimeSchema = z.string().datetime();

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().optional()
});

export const actorSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional()
});

export const resourceRefSchema = z.object({
  resource: z.string().min(1),
  id: z.string().min(1),
  displayName: z.string().optional()
});

export const integrationConnectionSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  tenantId: tenantIdSchema,
  status: z.enum(["draft", "connected", "degraded", "disabled", "error"]),
  lastSyncAt: isoDateTimeSchema.optional(),
  error: z.string().optional()
});

export type Actor = z.infer<typeof actorSchema>;
export type ResourceRef = z.infer<typeof resourceRefSchema>;
export type IntegrationConnection = z.infer<typeof integrationConnectionSchema>;
