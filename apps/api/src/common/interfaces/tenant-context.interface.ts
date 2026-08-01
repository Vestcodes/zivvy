export interface TenantContext {
  name: string;
  site: string;
  tier: string;
  user: string;
  addons: string[];
  sid?: string;
}
