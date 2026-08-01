import { BadRequestException, Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

const M = {
  createPaymentEntry:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.create_payment_entry_bts',
  createJournalEntry:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.create_journal_entry_bts',
  updateReferences:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.update_bank_transaction',
  unreconcile:
    'erpnext.accounts.doctype.bank_transaction.bank_transaction.unreconcile_transaction',
  getAccountBalance:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.get_account_balance',
  getClosingBalance:
    'erpnext.accounts.doctype.bank_account.bank_account.get_closing_balance_as_per_statement',
  setClosingBalance:
    'erpnext.accounts.doctype.bank_account.bank_account.set_closing_balance_as_per_statement',
  getBankAccountDetails:
    'erpnext.accounts.doctype.bank_account.bank_account.get_bank_account_details',
  getOlderUnreconciledTransactions:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.get_older_unreconciled_transactions',
  updateClearanceDate:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.update_clearance_date',
  clearClearingDate:
    'erpnext.accounts.doctype.bank_reconciliation_tool.bank_reconciliation_tool.clear_clearing_date',
  getPreviewFromTemplate:
    'erpnext.accounts.doctype.bank_statement_import.bank_statement_import.get_preview_from_template',
  formStartImport:
    'erpnext.accounts.doctype.bank_statement_import.bank_statement_import.form_start_import',
  convertMt940ToCsv:
    'erpnext.accounts.doctype.bank_statement_import.bank_statement_import.convert_mt940_to_csv',
  getImportStatus:
    'erpnext.accounts.doctype.bank_statement_import.bank_statement_import.get_import_status',
  getImportLogs:
    'erpnext.accounts.doctype.bank_statement_import.bank_statement_import.get_import_logs',
} as const;

export interface CreatePaymentEntryDto {
  reference_number?: string;
  party_type?: string;
  party?: string;
  posting_date?: string;
  reference_date?: string;
  bank_account?: string;
  mode_of_payment?: string;
  project?: string;
  cost_center?: string;
  allow_edit?: boolean;
}

export interface CreateJournalEntryDto {
  reference_number?: string;
  reference_date?: string;
  party_type?: string;
  party?: string;
  posting_date?: string;
  mode_of_payment?: string;
  entries?: any[];
}

export interface UpdateReferencesDto {
  reference_number?: string;
  party_type?: string;
  party?: string;
}

export interface SetClosingBalanceDto {
  date: string;
  balance: number;
}

export interface UpdateClearanceDateDto {
  payment_document: string;
  payment_entry: string;
  account: string;
  clearance_date: string;
}

export interface ClearClearanceDateDto {
  voucher_type: string;
  voucher_name: string;
}

export interface StatementPreviewDto {
  import_file?: string;
  google_sheets_url?: string;
}

export interface Mt940ConvertDto {
  mt940_file_path: string;
}

@Injectable()
export class BankingActionsService {
  constructor(private readonly frappe: FrappeService) {}

  // ── Bank transaction actions ──
  createPaymentEntry(bankTransactionName: string, dto: CreatePaymentEntryDto, tenant: TenantContext) {
    return this.frappe.call(
      M.createPaymentEntry,
      { bank_transaction_name: bankTransactionName, ...dto },
      tenant,
    );
  }

  createJournalEntry(bankTransactionName: string, dto: CreateJournalEntryDto, tenant: TenantContext) {
    return this.frappe.call(
      M.createJournalEntry,
      { bank_transaction_name: bankTransactionName, ...dto },
      tenant,
    );
  }

  updateReferences(bankTransactionName: string, dto: UpdateReferencesDto, tenant: TenantContext) {
    return this.frappe.call(
      M.updateReferences,
      { bank_transaction_name: bankTransactionName, ...dto },
      tenant,
    );
  }

  unreconcile(bankTransactionName: string, tenant: TenantContext) {
    return this.frappe.call(
      M.unreconcile,
      { transaction_name: bankTransactionName },
      tenant,
    );
  }

  // ── Bank account actions ──
  getAccountBalance(
    bankAccount: string,
    tillDate: string | undefined,
    company: string,
    tenant: TenantContext,
  ) {
    return this.frappe.call(
      M.getAccountBalance,
      { bank_account: bankAccount, till_date: tillDate, company },
      tenant,
    );
  }

  getClosingBalance(bankAccount: string, date: string | undefined, tenant: TenantContext) {
    return this.frappe.call(
      M.getClosingBalance,
      { bank_account: bankAccount, date },
      tenant,
    );
  }

  setClosingBalance(bankAccount: string, dto: SetClosingBalanceDto, tenant: TenantContext) {
    return this.frappe.call(
      M.setClosingBalance,
      { bank_account: bankAccount, date: dto.date, balance: dto.balance },
      tenant,
    );
  }

  getBankAccountDetails(bankAccount: string, tenant: TenantContext) {
    return this.frappe.call(M.getBankAccountDetails, { bank_account: bankAccount }, tenant);
  }

  getOlderUnreconciledTransactions(bankAccount: string, fromDate: string | undefined, tenant: TenantContext) {
    return this.frappe.call(
      M.getOlderUnreconciledTransactions,
      { bank_account: bankAccount, from_date: fromDate },
      tenant,
    );
  }

  // ── Bank clearance actions ──
  updateClearanceDate(dto: UpdateClearanceDateDto, tenant: TenantContext) {
    return this.frappe.call(M.updateClearanceDate, dto, tenant);
  }

  clearClearingDate(dto: ClearClearanceDateDto, tenant: TenantContext) {
    return this.frappe.call(M.clearClearingDate, dto, tenant);
  }

  // ── Bank statement import actions ──
  /**
   * Attach a bank statement file to a Bank Statement Import doc.
   *
   * Two-step flow against Frappe's standard file API:
   *   1. POST /api/method/upload_file (multipart) with doctype='Bank Statement
   *      Import' and docname=:name. This uploads the file and links a File doc
   *      to the target Bank Statement Import.
   *   2. Set the Bank Statement Import's `import_file` field to the returned
   *      file_url so the import pipeline can find the attachment.
   */
  async uploadBankStatement(
    name: string,
    file: { buffer: Buffer; originalname: string; mimetype?: string } | undefined,
    tenant: TenantContext,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    const uploaded = await this.frappe.uploadFile(file, {
      doctype: 'Bank Statement Import',
      docname: name,
      isPrivate: true,
      tenant,
    });

    const fileUrl: string | undefined = uploaded?.file_url;
    if (fileUrl) {
      await this.frappe.updateDoc(
        'Bank Statement Import',
        name,
        { import_file: fileUrl },
        tenant,
      );
    }

    return uploaded;
  }

  getPreview(name: string, dto: StatementPreviewDto, tenant: TenantContext) {
    return this.frappe.call(
      M.getPreviewFromTemplate,
      {
        data_import: name,
        import_file: dto.import_file,
        google_sheets_url: dto.google_sheets_url,
      },
      tenant,
    );
  }

  startImport(name: string, tenant: TenantContext) {
    return this.frappe.call(M.formStartImport, { data_import: name }, tenant);
  }

  convertMt940ToCsv(name: string, dto: Mt940ConvertDto, tenant: TenantContext) {
    return this.frappe.call(
      M.convertMt940ToCsv,
      { data_import: name, mt940_file_path: dto.mt940_file_path },
      tenant,
    );
  }

  getImportStatus(name: string, tenant: TenantContext) {
    return this.frappe.call(M.getImportStatus, { docname: name }, tenant);
  }

  getImportLogs(name: string, tenant: TenantContext) {
    return this.frappe.call(M.getImportLogs, { docname: name }, tenant);
  }
}
