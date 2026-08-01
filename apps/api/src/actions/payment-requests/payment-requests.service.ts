import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

const M = {
  makePaymentRequest:
    'erpnext.accounts.doctype.payment_request.payment_request.make_payment_request',
  resendPaymentEmail:
    'erpnext.accounts.doctype.payment_request.payment_request.resend_payment_email',
  makePaymentEntry:
    'erpnext.accounts.doctype.payment_request.payment_request.make_payment_entry',
  getSubscriptionDetails:
    'erpnext.accounts.doctype.payment_request.payment_request.get_subscription_details',
} as const;

export interface MakePaymentRequestDto {
  dt: string;
  dn: string;
  submit_doc?: boolean;
  mute_email?: boolean;
  order_type?: string;
}

@Injectable()
export class PaymentRequestsActionsService {
  constructor(private readonly frappe: FrappeService) {}

  makeFromInvoice(dto: MakePaymentRequestDto, tenant: TenantContext) {
    return this.frappe.call(M.makePaymentRequest, { ...dto }, tenant);
  }

  resend(name: string, tenant: TenantContext) {
    return this.frappe.call(M.resendPaymentEmail, { docname: name }, tenant);
  }

  makePaymentEntry(name: string, tenant: TenantContext) {
    return this.frappe.call(M.makePaymentEntry, { docname: name }, tenant);
  }

  async getSubscriptionDetails(name: string, tenant: TenantContext) {
    // The Frappe method requires the source (reference_doctype/reference_name)
    // — fetch them off the Payment Request first so the API stays tidy.
    const doc = await this.frappe.getDoc('Payment Request', name, tenant);
    return this.frappe.call(
      M.getSubscriptionDetails,
      {
        reference_doctype: doc.reference_doctype,
        reference_name: doc.reference_name,
      },
      tenant,
    );
  }
}
