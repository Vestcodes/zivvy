import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

/**
 * Payment Reconciliation is a virtual single doctype whose action methods
 * are instance methods on the document class. Frappe exposes such methods
 * through the `run_doc_method` HTTP endpoint. We proxy that here so callers
 * can hit clean REST-style URLs.
 */
const RUN_DOC_METHOD = 'run_doc_method';
const DIMENSION_FILTERS_METHOD =
  'erpnext.accounts.doctype.payment_reconciliation.payment_reconciliation.get_queries_for_dimension_filters';

export interface UnreconciledQuery {
  party_type?: string;
  party?: string;
  company?: string;
}

export interface AllocationsPayload {
  allocations?: any[];
  payments?: any[];
  invoices?: any[];
}

@Injectable()
export class PaymentReconciliationActionsService {
  constructor(private readonly frappe: FrappeService) {}

  private buildDocContext(extra: Record<string, any> = {}) {
    return {
      doctype: 'Payment Reconciliation',
      name: 'Payment Reconciliation',
      ...extra,
    };
  }

  async getUnreconciledEntries(query: UnreconciledQuery, tenant: TenantContext) {
    return this.frappe.call(
      RUN_DOC_METHOD,
      {
        dt: 'Payment Reconciliation',
        dn: 'Payment Reconciliation',
        method: 'get_unreconciled_entries',
        docs: JSON.stringify(this.buildDocContext(query)),
      },
      tenant,
    );
  }

  async allocateEntries(body: AllocationsPayload, tenant: TenantContext) {
    return this.frappe.call(
      RUN_DOC_METHOD,
      {
        dt: 'Payment Reconciliation',
        dn: 'Payment Reconciliation',
        method: 'allocate_entries',
        args: JSON.stringify({
          payments: body.payments,
          invoices: body.invoices,
          allocations: body.allocations,
        }),
        docs: JSON.stringify(this.buildDocContext()),
      },
      tenant,
    );
  }

  async reconcile(body: AllocationsPayload, tenant: TenantContext) {
    return this.frappe.call(
      RUN_DOC_METHOD,
      {
        dt: 'Payment Reconciliation',
        dn: 'Payment Reconciliation',
        method: 'reconcile',
        docs: JSON.stringify(
          this.buildDocContext({ allocation: body.allocations || [] }),
        ),
      },
      tenant,
    );
  }

  async getDimensionFilters(company: string | undefined, tenant: TenantContext) {
    return this.frappe.call(DIMENSION_FILTERS_METHOD, { company }, tenant);
  }

  async isAutoProcessEnabled(tenant: TenantContext) {
    return this.frappe.call(
      RUN_DOC_METHOD,
      {
        dt: 'Payment Reconciliation',
        dn: 'Payment Reconciliation',
        method: 'is_auto_process_enabled',
        docs: JSON.stringify(this.buildDocContext()),
      },
      tenant,
    );
  }
}
