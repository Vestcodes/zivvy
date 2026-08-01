import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

const M = {
  // Static method on Plaid Settings; exposed as a module-level whitelisted call.
  getLinkToken:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.PlaidSettings.get_link_token',
  getLinkTokenForUpdate:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.get_link_token_for_update',
  getPlaidConfiguration:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.get_plaid_configuration',
  addInstitution:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.add_institution',
  addBankAccounts:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.add_bank_accounts',
  enqueueSynchronization:
    'erpnext.erpnext_integrations.doctype.plaid_settings.plaid_settings.enqueue_synchronization',
} as const;

export interface UpdateLinkTokenDto {
  access_token: string;
}

export interface AddInstitutionDto {
  token: string;
  response: string | Record<string, any>;
}

export interface AddBankAccountsDto {
  response: string | Record<string, any>;
  bank: string | Record<string, any>;
  company: string;
}

@Injectable()
export class PlaidIntegrationService {
  constructor(private readonly frappe: FrappeService) {}

  getLinkToken(tenant: TenantContext) {
    return this.frappe.call(M.getLinkToken, {}, tenant);
  }

  getLinkTokenForUpdate(dto: UpdateLinkTokenDto, tenant: TenantContext) {
    return this.frappe.call(
      M.getLinkTokenForUpdate,
      { access_token: dto.access_token },
      tenant,
    );
  }

  getConfiguration(tenant: TenantContext) {
    return this.frappe.call(M.getPlaidConfiguration, {}, tenant);
  }

  addInstitution(dto: AddInstitutionDto, tenant: TenantContext) {
    return this.frappe.call(
      M.addInstitution,
      {
        token: dto.token,
        response:
          typeof dto.response === 'string'
            ? dto.response
            : JSON.stringify(dto.response),
      },
      tenant,
    );
  }

  addBankAccounts(dto: AddBankAccountsDto, tenant: TenantContext) {
    return this.frappe.call(
      M.addBankAccounts,
      {
        response:
          typeof dto.response === 'string'
            ? dto.response
            : JSON.stringify(dto.response),
        bank:
          typeof dto.bank === 'string' ? dto.bank : JSON.stringify(dto.bank),
        company: dto.company,
      },
      tenant,
    );
  }

  enqueueSync(tenant: TenantContext) {
    return this.frappe.call(M.enqueueSynchronization, {}, tenant);
  }
}
