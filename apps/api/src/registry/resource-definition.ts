export type Tier = 'free' | 'pro' | 'business';

export interface FieldDef {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required?: boolean;
  example?: any;
  description?: string;
  filterable?: boolean;
  createOnly?: boolean;
}

export interface ResourceDefinition {
  slug: string;
  doctype: string;
  tag: string;
  module: string;
  minTier: Tier;
  requiredAddon?: string;
  idField?: string;
  idLabel?: string;
  listFields: string[];
  fields: FieldDef[];
  defaultSort?: string;
  submittable?: boolean;
  readOnly?: boolean;
  events?: string[];
}
