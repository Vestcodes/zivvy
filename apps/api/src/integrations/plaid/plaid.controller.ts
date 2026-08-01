import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  AddBankAccountsDto,
  AddInstitutionDto,
  PlaidIntegrationService,
  UpdateLinkTokenDto,
} from './plaid.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { requireTier } from '../../common/utils/tier';

class UpdateLinkTokenBody implements UpdateLinkTokenDto {
  @ApiProperty({ description: 'Existing Plaid access token whose Link session needs refreshing' })
  @IsString() @IsNotEmpty()
  access_token: string;
}

class AddInstitutionBody implements AddInstitutionDto {
  @ApiProperty({ description: 'Public token returned by Plaid Link' })
  @IsString() @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Institution metadata payload from Plaid Link (JSON string or object)',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  response: string | Record<string, any>;
}

class AddBankAccountsBody implements AddBankAccountsDto {
  @ApiProperty({
    description: 'Accounts payload returned by Plaid Link',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  response: string | Record<string, any>;

  @ApiProperty({
    description: 'Bank identifier (name or full Bank doc payload)',
    oneOf: [{ type: 'string' }, { type: 'object' }],
  })
  bank: string | Record<string, any>;

  @ApiProperty({ example: 'Zivvy Inc.' })
  @IsString() @IsNotEmpty()
  company: string;
}

@ApiTags('Plaid Integration')
@ApiSecurity('api-key')
@Controller('integrations/plaid')
export class PlaidIntegrationController {
  constructor(private readonly svc: PlaidIntegrationService) {}

  @Post('link-token')
  @ApiOperation({
    summary: 'Create Plaid Link token',
    description: 'Generates a new short-lived Plaid Link token for initializing the client-side Link flow.',
  })
  @ApiResponse({ status: 201, description: 'Link token payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async linkToken(@Tenant() tenant: TenantContext) {
    requireTier(tenant, 'pro');
    return this.svc.getLinkToken(tenant);
  }

  @Post('link-token/update')
  @ApiOperation({
    summary: 'Create Link token for update mode',
    description: 'Generates a Plaid Link token used to re-authenticate an existing Item after credential rotation.',
  })
  @ApiResponse({ status: 201, description: 'Link token payload' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async linkTokenUpdate(
    @Body() body: UpdateLinkTokenBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getLinkTokenForUpdate(body, tenant);
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get Plaid configuration',
    description: 'Returns the environment, client name, and a fresh Link token if the Plaid integration is enabled.',
  })
  @ApiResponse({ status: 200, description: 'Plaid config payload or "disabled"' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async config(@Tenant() tenant: TenantContext) {
    requireTier(tenant, 'pro');
    return this.svc.getConfiguration(tenant);
  }

  @Post('institutions')
  @ApiOperation({
    summary: 'Register a Plaid institution',
    description: 'Exchanges the Plaid public token for an access token and creates or updates the linked Bank record.',
  })
  @ApiResponse({ status: 201, description: 'Bank record created or updated' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async addInstitution(
    @Body() body: AddInstitutionBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.addInstitution(body, tenant);
  }

  @Post('bank-accounts')
  @ApiOperation({
    summary: 'Register Plaid bank accounts',
    description: 'Creates Bank Account records in ERPNext for each account returned by Plaid Link.',
  })
  @ApiResponse({ status: 201, description: 'Bank accounts created' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async addBankAccounts(
    @Body() body: AddBankAccountsBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.addBankAccounts(body, tenant);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Trigger Plaid transaction sync',
    description: 'Enqueues a background job that pulls the latest transactions from Plaid into ERPNext Bank Transactions.',
  })
  @ApiResponse({ status: 202, description: 'Sync job enqueued' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async sync(@Tenant() tenant: TenantContext) {
    requireTier(tenant, 'pro');
    return this.svc.enqueueSync(tenant);
  }
}
