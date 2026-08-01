import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  BankingActionsService,
  ClearClearanceDateDto,
  CreateJournalEntryDto,
  CreatePaymentEntryDto,
  Mt940ConvertDto,
  SetClosingBalanceDto,
  StatementPreviewDto,
  UpdateClearanceDateDto,
  UpdateReferencesDto,
} from './banking.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { requireTier } from '../../common/utils/tier';

class CreatePaymentEntryBody implements CreatePaymentEntryDto {
  @ApiPropertyOptional({ example: 'CHQ-00123', description: 'Reference number on the bank transaction' })
  @IsOptional() @IsString()
  reference_number?: string;

  @ApiPropertyOptional({ example: 'Customer', description: 'Party type (Customer/Supplier/Employee)' })
  @IsOptional() @IsString()
  party_type?: string;

  @ApiPropertyOptional({ example: 'CUST-0001', description: 'Party name matching the party_type' })
  @IsOptional() @IsString()
  party?: string;

  @ApiPropertyOptional({ example: '2026-07-24' })
  @IsOptional() @IsString()
  posting_date?: string;

  @ApiPropertyOptional({ example: '2026-07-24' })
  @IsOptional() @IsString()
  reference_date?: string;

  @ApiPropertyOptional({ example: 'HDFC Bank - HDF' })
  @IsOptional() @IsString()
  bank_account?: string;

  @ApiPropertyOptional({ example: 'Cash' })
  @IsOptional() @IsString()
  mode_of_payment?: string;

  @ApiPropertyOptional({ example: 'PROJ-0001' })
  @IsOptional() @IsString()
  project?: string;

  @ApiPropertyOptional({ example: 'Main - ZV' })
  @IsOptional() @IsString()
  cost_center?: string;

  @ApiPropertyOptional({ example: true, description: 'Open the created Payment Entry as a draft for editing' })
  @IsOptional() @IsBoolean()
  allow_edit?: boolean;
}

class CreateJournalEntryBody implements CreateJournalEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reference_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() party_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() party?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() posting_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mode_of_payment?: string;
  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional() @IsArray()
  entries?: any[];
}

class UpdateReferencesBody implements UpdateReferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reference_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() party_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() party?: string;
}

class SetClosingBalanceBody implements SetClosingBalanceDto {
  @ApiProperty({ example: '2026-07-24' }) @IsString() @IsNotEmpty() date: string;
  @ApiProperty({ example: 15000.75 }) @IsNumber() balance: number;
}

class UpdateClearanceDateBody implements UpdateClearanceDateDto {
  @ApiProperty({ example: 'Payment Entry' }) @IsString() @IsNotEmpty() payment_document: string;
  @ApiProperty({ example: 'PAY-2026-00001' }) @IsString() @IsNotEmpty() payment_entry: string;
  @ApiProperty({ example: 'HDFC Bank - HDF' }) @IsString() @IsNotEmpty() account: string;
  @ApiProperty({ example: '2026-07-24' }) @IsString() @IsNotEmpty() clearance_date: string;
}

class ClearClearanceDateBody implements ClearClearanceDateDto {
  @ApiProperty({ example: 'Payment Entry' }) @IsString() @IsNotEmpty() voucher_type: string;
  @ApiProperty({ example: 'PAY-2026-00001' }) @IsString() @IsNotEmpty() voucher_name: string;
}

class StatementPreviewBody implements StatementPreviewDto {
  @ApiPropertyOptional({ description: 'Attached file URL previously uploaded to Frappe' })
  @IsOptional() @IsString()
  import_file?: string;

  @ApiPropertyOptional({ description: 'Google Sheets URL for the statement template' })
  @IsOptional() @IsString()
  google_sheets_url?: string;
}

class Mt940ConvertBody implements Mt940ConvertDto {
  @ApiProperty({ example: '/private/files/statement.mt940' })
  @IsString() @IsNotEmpty()
  mt940_file_path: string;
}

class UploadStatementBody {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Bank statement file (CSV, XLSX, or MT940)' })
  file: any;
}

@ApiTags('Banking Actions')
@ApiSecurity('api-key')
@Controller('banking')
export class BankingActionsController {
  constructor(private readonly svc: BankingActionsService) {}

  // ── Bank Transaction actions ──

  @Post('bank-transactions/:name/actions/create-payment-entry')
  @ApiOperation({
    summary: 'Create Payment Entry from bank transaction',
    description: 'Creates and reconciles a Payment Entry against the given Bank Transaction via the reconciliation tool.',
  })
  @ApiParam({ name: 'name', description: 'Bank Transaction name' })
  @ApiResponse({ status: 201, description: 'Payment Entry created and reconciled' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Transaction not found', type: ErrorResponse })
  async createPaymentEntry(
    @Param('name') name: string,
    @Body() body: CreatePaymentEntryBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.createPaymentEntry(name, body, tenant);
  }

  @Post('bank-transactions/:name/actions/create-journal-entry')
  @ApiOperation({
    summary: 'Create Journal Entry from bank transaction',
    description: 'Creates and reconciles a Journal Entry against the given Bank Transaction.',
  })
  @ApiParam({ name: 'name', description: 'Bank Transaction name' })
  @ApiResponse({ status: 201, description: 'Journal Entry created' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Transaction not found', type: ErrorResponse })
  async createJournalEntry(
    @Param('name') name: string,
    @Body() body: CreateJournalEntryBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.createJournalEntry(name, body, tenant);
  }

  @Post('bank-transactions/:name/actions/update-references')
  @ApiOperation({
    summary: 'Update bank transaction references',
    description: 'Updates the reference number, party, and party type on a Bank Transaction.',
  })
  @ApiParam({ name: 'name', description: 'Bank Transaction name' })
  @ApiResponse({ status: 200, description: 'Bank Transaction updated' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Transaction not found', type: ErrorResponse })
  async updateReferences(
    @Param('name') name: string,
    @Body() body: UpdateReferencesBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.updateReferences(name, body, tenant);
  }

  @Post('bank-transactions/:name/actions/unreconcile')
  @ApiOperation({
    summary: 'Unreconcile bank transaction',
    description: 'Removes all payment entries linked to the Bank Transaction and cancels any vouchers created during reconciliation.',
  })
  @ApiParam({ name: 'name', description: 'Bank Transaction name' })
  @ApiResponse({ status: 200, description: 'Bank Transaction unreconciled' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Transaction not found', type: ErrorResponse })
  async unreconcile(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.unreconcile(name, tenant);
  }

  // ── Bank Account actions ──

  @Get('bank-accounts/:name/balance')
  @ApiOperation({
    summary: 'Get bank account balance',
    description: 'Returns the calculated account balance for a Bank Account as of the given date.',
  })
  @ApiParam({ name: 'name', description: 'Bank Account name' })
  @ApiQuery({ name: 'till_date', required: false, description: 'Balance as of this date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'company', required: true, description: 'Company that owns the Bank Account' })
  @ApiResponse({ status: 200, description: 'Account balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Account not found', type: ErrorResponse })
  async getBalance(
    @Param('name') name: string,
    @Query('till_date') tillDate: string | undefined,
    @Query('company') company: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getAccountBalance(name, tillDate, company, tenant);
  }

  @Get('bank-accounts/:name/closing-balance')
  @ApiOperation({
    summary: 'Get statement closing balance',
    description: 'Returns the closing balance recorded from a bank statement for a given date.',
  })
  @ApiParam({ name: 'name', description: 'Bank Account name' })
  @ApiQuery({ name: 'date', required: true, description: 'Statement date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Closing balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Account not found', type: ErrorResponse })
  async getClosingBalance(
    @Param('name') name: string,
    @Query('date') date: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getClosingBalance(name, date, tenant);
  }

  @Post('bank-accounts/:name/closing-balance')
  @ApiOperation({
    summary: 'Set statement closing balance',
    description: 'Records the closing balance from a bank statement for a Bank Account on a given date.',
  })
  @ApiParam({ name: 'name', description: 'Bank Account name' })
  @ApiResponse({ status: 200, description: 'Closing balance saved' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Account not found', type: ErrorResponse })
  async setClosingBalance(
    @Param('name') name: string,
    @Body() body: SetClosingBalanceBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.setClosingBalance(name, body, tenant);
  }

  @Get('bank-accounts/:name/details')
  @ApiOperation({
    summary: 'Get bank account details',
    description: 'Returns account number, IBAN, branch and other metadata for a Bank Account.',
  })
  @ApiParam({ name: 'name', description: 'Bank Account name' })
  @ApiResponse({ status: 200, description: 'Bank Account details' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Account not found', type: ErrorResponse })
  async getDetails(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getBankAccountDetails(name, tenant);
  }

  @Get('bank-accounts/:name/unreconciled-transactions')
  @ApiOperation({
    summary: 'Get older unreconciled transactions',
    description: 'Returns the count and total value of unreconciled bank transactions on a Bank Account before a given date.',
  })
  @ApiParam({ name: 'name', description: 'Bank Account name' })
  @ApiQuery({ name: 'from_date', required: true, description: 'Cutoff date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Unreconciled transaction summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Account not found', type: ErrorResponse })
  async getUnreconciled(
    @Param('name') name: string,
    @Query('from_date') fromDate: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getOlderUnreconciledTransactions(name, fromDate, tenant);
  }

  // ── Bank Clearance actions ──

  @Post('bank-clearances/update-clearance-date')
  @ApiOperation({
    summary: 'Set voucher clearance date',
    description: 'Records the clearance date on a Payment Entry or Journal Entry line for a bank account.',
  })
  @ApiResponse({ status: 200, description: 'Clearance date updated' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Voucher not found', type: ErrorResponse })
  async updateClearanceDate(
    @Body() body: UpdateClearanceDateBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.updateClearanceDate(body, tenant);
  }

  @Post('bank-clearances/clear-clearance-date')
  @ApiOperation({
    summary: 'Clear voucher clearance date',
    description: 'Removes the clearance date from a voucher, marking it as no longer cleared by the bank.',
  })
  @ApiResponse({ status: 200, description: 'Clearance date cleared' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Voucher not found', type: ErrorResponse })
  async clearClearanceDate(
    @Body() body: ClearClearanceDateBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.clearClearingDate(body, tenant);
  }

  // ── Bank Statement Import actions ──

  @Post('bank-statement-imports/:name/actions/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload statement file for import',
    description:
      'Uploads a bank statement file (CSV, XLSX, or MT940) via Frappe\'s standard file API, attaches it to the referenced Bank Statement Import document, and sets the document\'s import_file field to the uploaded file URL.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadStatementBody })
  @ApiResponse({ status: 201, description: 'Statement uploaded and attached' })
  @ApiResponse({ status: 400, description: 'Invalid or missing file', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async uploadStatement(
    @Param('name') name: string,
    @UploadedFile() file: any,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.uploadBankStatement(name, file, tenant);
  }

  @Post('bank-statement-imports/:name/actions/preview')
  @ApiOperation({
    summary: 'Preview statement import',
    description: 'Returns a preview of parsed rows from an attached statement file or Google Sheet.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiResponse({ status: 200, description: 'Preview payload' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async previewImport(
    @Param('name') name: string,
    @Body() body: StatementPreviewBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getPreview(name, body, tenant);
  }

  @Post('bank-statement-imports/:name/actions/start')
  @ApiOperation({
    summary: 'Start statement import',
    description: 'Enqueues the import job for a Bank Statement Import document.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiResponse({ status: 200, description: 'Import started' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async startImport(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.startImport(name, tenant);
  }

  @Post('bank-statement-imports/:name/actions/mt940-to-csv')
  @ApiOperation({
    summary: 'Convert MT940 to CSV',
    description: 'Parses an attached MT940 file and produces a CSV file attached to the Bank Statement Import.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiResponse({ status: 200, description: 'CSV file URL' })
  @ApiResponse({ status: 400, description: 'Invalid MT940 file', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async convertMt940(
    @Param('name') name: string,
    @Body() body: Mt940ConvertBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.convertMt940ToCsv(name, body, tenant);
  }

  @Get('bank-statement-imports/:name/status')
  @ApiOperation({
    summary: 'Get import job status',
    description: 'Returns the current status of the import job for a Bank Statement Import document.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiResponse({ status: 200, description: 'Import status' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async importStatus(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getImportStatus(name, tenant);
  }

  @Get('bank-statement-imports/:name/logs')
  @ApiOperation({
    summary: 'Get import logs',
    description: 'Returns per-row success/error logs recorded during a Bank Statement Import run.',
  })
  @ApiParam({ name: 'name', description: 'Bank Statement Import name' })
  @ApiResponse({ status: 200, description: 'Import log entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Bank Statement Import not found', type: ErrorResponse })
  async importLogs(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getImportLogs(name, tenant);
  }
}
