import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Module,
  Injectable,
  Inject,
  Type,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FrappeService } from '../frappe/frappe.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ErrorResponse } from '../common/dto/api-response.dto';
import { Tenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';
import { ResourceDefinition } from './resource-definition';

export const RESOURCE_DEF_KEY = 'resource_definition';

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, business: 2 };
const TIER_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' };

const ADDON_TITLES: Record<string, string> = {
  'ecommerce-integrations': 'Ecommerce Integrations',
  'erpnext-datev': 'DATEV Export',
  'digital-signer': 'Digital Signer',
  'payments-processor': 'Payments Processor',
};

function checkTier(tenant: TenantContext, minTier: string) {
  const tenantRank = TIER_RANK[tenant.tier] ?? 0;
  const requiredRank = TIER_RANK[minTier] ?? 0;
  if (tenantRank < requiredRank) {
    throw new ForbiddenException(
      `This resource requires the ${TIER_LABELS[minTier]} plan. ` +
      `Upgrade at https://zivvy.xyz/billing to access ${TIER_LABELS[minTier]}-tier features.`,
    );
  }
}

function checkAddon(tenant: TenantContext, addon: string, addonTitle: string) {
  const addons = tenant.addons || [];
  if (!addons.includes(addon)) {
    throw new ForbiddenException(
      `This resource requires the ${addonTitle} add-on. ` +
      `Subscribe at https://zivvy.xyz/billing/addons to enable ${addonTitle}.`,
    );
  }
}

function pascalCase(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export function createResourceModule(def: ResourceDefinition): Type<any> {
  const serviceToken = Symbol(`${def.slug}Service`);
  const idLabel = def.idLabel || `${def.tag} ID or name`;
  const singular = def.tag.endsWith('s')
    ? def.tag.slice(0, -1).toLowerCase()
    : def.tag.toLowerCase();
  const filterableFields = def.fields.filter((f) => f.filterable);

  // --- Service ---
  @Injectable()
  class ResourceService {
    constructor(private readonly frappe: FrappeService) {}

    async findAll(query: PaginationDto, filters: Record<string, any>, tenant: TenantContext) {
      const frappeFilters: Record<string, any> = {};
      for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
          const field = def.fields.find((f) => f.name === key);
          if (field?.type === 'boolean') {
            frappeFilters[key] = val ? 1 : 0;
          } else {
            frappeFilters[key] = val;
          }
        }
      }
      const orderBy = query.sort
        ? `${query.sort} ${query.order || 'desc'}`
        : def.defaultSort || 'modified desc';
      return this.frappe.getList(def.doctype, {
        fields: def.listFields,
        filters: frappeFilters,
        orderBy,
        limit: query.limit,
        offset: query.offset,
        tenant,
      });
    }

    async findOne(id: string, tenant: TenantContext) {
      return this.frappe.getDoc(def.doctype, id, tenant);
    }

    async create(data: Record<string, any>, tenant: TenantContext) {
      return this.frappe.createDoc(def.doctype, data, tenant);
    }

    async update(id: string, data: Record<string, any>, tenant: TenantContext) {
      return this.frappe.updateDoc(def.doctype, id, data, tenant);
    }

    async remove(id: string, tenant: TenantContext) {
      return this.frappe.deleteDoc(def.doctype, id, tenant);
    }

    async submit(id: string, tenant: TenantContext) {
      return this.frappe.submitDoc(def.doctype, id, tenant);
    }
  }
  Object.defineProperty(ResourceService, 'name', { value: `${pascalCase(def.slug)}Service` });

  // --- Controller ---
  @ApiTags(def.tag)
  @ApiSecurity('api-key')
  @Controller(def.slug)
  class ResourceController {
    constructor(@Inject(serviceToken) public readonly svc: ResourceService) {}
  }
  Object.defineProperty(ResourceController, 'name', { value: `${pascalCase(def.slug)}Controller` });

  // ── GET / (list) ──
  const listMethodDecorators: MethodDecorator[] = [
    Get() as MethodDecorator,
    ApiOperation({
      summary: `List ${def.tag.toLowerCase()}`,
      description: `Retrieve a paginated list of ${def.tag.toLowerCase()}.${
        def.minTier !== 'free' ? ` Requires ${TIER_LABELS[def.minTier]} plan.` : ''
      }`,
    }) as MethodDecorator,
    ApiResponse({ status: 200, description: `Paginated list of ${def.tag.toLowerCase()}` }) as MethodDecorator,
    ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse }) as MethodDecorator,
  ];
  if (def.minTier !== 'free') {
    listMethodDecorators.push(
      ApiResponse({ status: 403, description: `Requires ${TIER_LABELS[def.minTier]} plan`, type: ErrorResponse }) as MethodDecorator,
    );
  }
  for (const field of filterableFields) {
    listMethodDecorators.push(
      ApiQuery({
        name: field.name,
        required: false,
        type: field.type === 'boolean' ? Boolean : field.type === 'number' ? Number : String,
        description: `Filter by ${field.name.replace(/_/g, ' ')}`,
      }) as MethodDecorator,
    );
  }

  const proto = ResourceController.prototype as any;

  proto.findAll = async function (
    pagination: PaginationDto,
    ...args: any[]
  ) {
    const tenant: TenantContext = args[args.length - 1];
    if (def.requiredAddon) {
      checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
    }
    checkTier(tenant, def.minTier);
    const filters: Record<string, any> = {};
    for (let i = 0; i < filterableFields.length; i++) {
      filters[filterableFields[i].name] = args[i];
    }
    const { data, total } = await this.svc.findAll(pagination, filters, tenant);
    return { data, meta: { total, limit: pagination.limit!, offset: pagination.offset! } };
  };

  const listParamDecorators: ParameterDecorator[] = [Query() as ParameterDecorator];
  for (const field of filterableFields) {
    listParamDecorators.push(Query(field.name) as ParameterDecorator);
  }
  listParamDecorators.push(Tenant() as ParameterDecorator);
  applyMethodMeta(ResourceController, 'findAll', listMethodDecorators, listParamDecorators);

  // ── GET /:id ──
  proto.findOne = async function (id: string, tenant: TenantContext) {
    if (def.requiredAddon) {
      checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
    }
    checkTier(tenant, def.minTier);
    return this.svc.findOne(id, tenant);
  };
  applyMethodMeta(ResourceController, 'findOne', [
    Get(':id') as MethodDecorator,
    ApiOperation({ summary: `Get a ${singular}`, description: `Retrieve a single ${singular} by ID.` }) as MethodDecorator,
    ApiParam({ name: 'id', description: idLabel }) as MethodDecorator,
    ApiResponse({ status: 200, description: `${singular} details` }) as MethodDecorator,
    ApiResponse({ status: 404, description: `${singular} not found`, type: ErrorResponse }) as MethodDecorator,
  ], [Param('id') as ParameterDecorator, Tenant() as ParameterDecorator]);

  if (!def.readOnly) {
    // ── POST / ──
    proto.create = async function (dto: any, tenant: TenantContext) {
      if (def.requiredAddon) {
        checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
      }
      checkTier(tenant, def.minTier);
      return this.svc.create(dto, tenant);
    };
    applyMethodMeta(ResourceController, 'create', [
      Post() as MethodDecorator,
      ApiOperation({ summary: `Create a ${singular}`, description: `Create a new ${singular}.` }) as MethodDecorator,
      ApiResponse({ status: 201, description: `${singular} created` }) as MethodDecorator,
      ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse }) as MethodDecorator,
    ], [Body() as ParameterDecorator, Tenant() as ParameterDecorator]);

    // ── PATCH /:id ──
    proto.update = async function (id: string, dto: any, tenant: TenantContext) {
      if (def.requiredAddon) {
        checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
      }
      checkTier(tenant, def.minTier);
      return this.svc.update(id, dto, tenant);
    };
    applyMethodMeta(ResourceController, 'update', [
      Patch(':id') as MethodDecorator,
      ApiOperation({ summary: `Update a ${singular}`, description: `Partially update a ${singular}.` }) as MethodDecorator,
      ApiParam({ name: 'id', description: idLabel }) as MethodDecorator,
      ApiResponse({ status: 200, description: `${singular} updated` }) as MethodDecorator,
      ApiResponse({ status: 404, description: `${singular} not found`, type: ErrorResponse }) as MethodDecorator,
    ], [Param('id') as ParameterDecorator, Body() as ParameterDecorator, Tenant() as ParameterDecorator]);

    // ── DELETE /:id ──
    proto.remove = async function (id: string, tenant: TenantContext) {
      if (def.requiredAddon) {
        checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
      }
      checkTier(tenant, def.minTier);
      await this.svc.remove(id, tenant);
      return { message: `${singular} deleted successfully` };
    };
    applyMethodMeta(ResourceController, 'remove', [
      Delete(':id') as MethodDecorator,
      ApiOperation({ summary: `Delete a ${singular}`, description: `Permanently delete a ${singular}.` }) as MethodDecorator,
      ApiParam({ name: 'id', description: idLabel }) as MethodDecorator,
      ApiResponse({ status: 200, description: `${singular} deleted` }) as MethodDecorator,
      ApiResponse({ status: 404, description: `${singular} not found`, type: ErrorResponse }) as MethodDecorator,
    ], [Param('id') as ParameterDecorator, Tenant() as ParameterDecorator]);

    // ── POST /:id/submit (submittable) ──
    if (def.submittable) {
      proto.submit = async function (id: string, tenant: TenantContext) {
        if (def.requiredAddon) {
          checkAddon(tenant, def.requiredAddon, ADDON_TITLES[def.requiredAddon] || def.requiredAddon);
        }
        checkTier(tenant, def.minTier);
        return this.svc.submit(id, tenant);
      };
      applyMethodMeta(ResourceController, 'submit', [
        Post(':id/submit') as MethodDecorator,
        ApiOperation({ summary: `Submit a ${singular}`, description: `Submit a draft ${singular} to finalize it.` }) as MethodDecorator,
        ApiParam({ name: 'id', description: idLabel }) as MethodDecorator,
        ApiResponse({ status: 200, description: `${singular} submitted` }) as MethodDecorator,
      ], [Param('id') as ParameterDecorator, Tenant() as ParameterDecorator]);
    }
  }

  // --- Module ---
  @Module({
    controllers: [ResourceController],
    providers: [
      {
        provide: serviceToken,
        useFactory: (frappe: FrappeService) => new ResourceService(frappe),
        inject: [FrappeService],
      },
    ],
  })
  class ResourceModule {}
  Object.defineProperty(ResourceModule, 'name', { value: `${pascalCase(def.slug)}Module` });

  return ResourceModule;
}

function applyMethodMeta(
  controllerClass: Type<any>,
  methodName: string,
  decorators: MethodDecorator[],
  paramDecorators: ParameterDecorator[],
) {
  const descriptor = Object.getOwnPropertyDescriptor(controllerClass.prototype, methodName)!;
  for (const dec of decorators) {
    dec(controllerClass.prototype, methodName, descriptor);
  }
  for (let i = 0; i < paramDecorators.length; i++) {
    paramDecorators[i](controllerClass.prototype, methodName, i);
  }
}
