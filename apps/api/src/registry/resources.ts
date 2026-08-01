import { ResourceDefinition } from './resource-definition';

export const RESOURCES: ResourceDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════
  // FREE TIER — CRM + light Selling/Buying
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'leads',
    doctype: 'Lead',
    tag: 'Leads',
    module: 'CRM',
    minTier: 'free',
    listFields: ['name', 'lead_name', 'company_name', 'status', 'source', 'email_id', 'mobile_no', 'modified'],
    fields: [
      { name: 'lead_name', type: 'string', required: true, example: 'Jane Smith', description: 'Full name of the lead' },
      { name: 'company_name', type: 'string', example: 'Acme Corp' },
      { name: 'email_id', type: 'string', example: 'jane@acme.com' },
      { name: 'mobile_no', type: 'string', example: '+1-555-0100' },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'source', type: 'string', example: 'Website', filterable: true },
      { name: 'territory', type: 'string', filterable: true },
      { name: 'industry', type: 'string', filterable: true },
      { name: 'notes', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted', 'converted'],
  },

  {
    slug: 'opportunities',
    doctype: 'Opportunity',
    tag: 'Opportunities',
    module: 'CRM',
    minTier: 'free',
    listFields: ['name', 'opportunity_from', 'party_name', 'status', 'opportunity_type', 'sales_stage', 'opportunity_amount', 'currency', 'modified'],
    fields: [
      { name: 'opportunity_from', type: 'string', required: true, example: 'Lead', description: '"Lead" or "Customer"' },
      { name: 'party_name', type: 'string', required: true, example: 'Jane Smith' },
      { name: 'opportunity_type', type: 'string', example: 'Sales', filterable: true },
      { name: 'sales_stage', type: 'string', example: 'Prospecting', filterable: true },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'opportunity_amount', type: 'number', example: 15000 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'expected_closing', type: 'date', example: '2026-12-31' },
      { name: 'contact_person', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted', 'won', 'lost'],
  },

  {
    slug: 'customers',
    doctype: 'Customer',
    tag: 'Customers',
    module: 'Selling',
    minTier: 'free',
    listFields: ['name', 'customer_name', 'customer_type', 'customer_group', 'territory', 'email_id', 'mobile_no', 'modified'],
    fields: [
      { name: 'customer_name', type: 'string', required: true, example: 'Acme Corp' },
      { name: 'customer_type', type: 'string', example: 'Company', filterable: true },
      { name: 'customer_group', type: 'string', example: 'Commercial', filterable: true },
      { name: 'territory', type: 'string', example: 'United States', filterable: true },
      { name: 'email_id', type: 'string', example: 'billing@acme.com' },
      { name: 'mobile_no', type: 'string', example: '+1-555-0200' },
      { name: 'tax_id', type: 'string' },
      { name: 'default_currency', type: 'string', example: 'USD' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'contacts',
    doctype: 'Contact',
    tag: 'Contacts',
    module: 'Contacts',
    minTier: 'free',
    listFields: ['name', 'first_name', 'last_name', 'email_id', 'mobile_no', 'company_name', 'designation', 'modified'],
    fields: [
      { name: 'first_name', type: 'string', required: true, example: 'Jane' },
      { name: 'last_name', type: 'string', example: 'Smith' },
      { name: 'email_id', type: 'string', example: 'jane@acme.com' },
      { name: 'mobile_no', type: 'string', example: '+1-555-0100' },
      { name: 'phone', type: 'string' },
      { name: 'company_name', type: 'string', example: 'Acme Corp', filterable: true },
      { name: 'designation', type: 'string', example: 'CEO' },
      { name: 'department', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'suppliers',
    doctype: 'Supplier',
    tag: 'Suppliers',
    module: 'Buying',
    minTier: 'free',
    listFields: ['name', 'supplier_name', 'supplier_group', 'supplier_type', 'country', 'modified'],
    fields: [
      { name: 'supplier_name', type: 'string', required: true, example: 'Global Parts Inc' },
      { name: 'supplier_group', type: 'string', example: 'Raw Material', filterable: true },
      { name: 'supplier_type', type: 'string', example: 'Company', filterable: true },
      { name: 'country', type: 'string', example: 'United States', filterable: true },
      { name: 'default_currency', type: 'string', example: 'USD' },
      { name: 'tax_id', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'quotations',
    doctype: 'Quotation',
    tag: 'Quotations',
    module: 'Selling',
    minTier: 'free',
    submittable: true,
    listFields: ['name', 'quotation_to', 'party_name', 'status', 'grand_total', 'currency', 'transaction_date', 'valid_till', 'modified'],
    fields: [
      { name: 'quotation_to', type: 'string', required: true, example: 'Customer', description: '"Customer" or "Lead"' },
      { name: 'party_name', type: 'string', required: true, example: 'Acme Corp' },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
      { name: 'valid_till', type: 'date', example: '2026-08-25' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 5000 },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'sales-orders',
    doctype: 'Sales Order',
    tag: 'Sales Orders',
    module: 'Selling',
    minTier: 'free',
    submittable: true,
    listFields: ['name', 'customer', 'status', 'grand_total', 'currency', 'transaction_date', 'delivery_date', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, example: 'Acme Corp', filterable: true },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
      { name: 'delivery_date', type: 'date', example: '2026-08-01' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 12500 },
      { name: 'order_type', type: 'string', example: 'Sales', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'purchase-orders',
    doctype: 'Purchase Order',
    tag: 'Purchase Orders',
    module: 'Buying',
    minTier: 'free',
    submittable: true,
    listFields: ['name', 'supplier', 'status', 'grand_total', 'currency', 'transaction_date', 'modified'],
    fields: [
      { name: 'supplier', type: 'string', required: true, example: 'Global Parts Inc', filterable: true },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
      { name: 'schedule_date', type: 'date', example: '2026-08-10' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 8000 },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'items',
    doctype: 'Item',
    tag: 'Items',
    module: 'Stock',
    minTier: 'free',
    idField: 'item_code',
    idLabel: 'Item code or name',
    listFields: ['name', 'item_code', 'item_name', 'item_group', 'stock_uom', 'description', 'has_variants', 'is_stock_item', 'standard_rate', 'image', 'modified'],
    fields: [
      { name: 'item_code', type: 'string', required: true, example: 'IT-001', createOnly: true },
      { name: 'item_name', type: 'string', required: true, example: 'Widget A' },
      { name: 'item_group', type: 'string', required: true, example: 'Products', filterable: true },
      { name: 'stock_uom', type: 'string', example: 'Nos' },
      { name: 'description', type: 'string', example: 'A premium widget for industrial use' },
      { name: 'has_variants', type: 'boolean', example: false, filterable: true },
      { name: 'is_stock_item', type: 'boolean', example: true, filterable: true },
      { name: 'standard_rate', type: 'number', example: 49.99 },
      { name: 'image', type: 'string', example: 'https://example.com/image.png' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Accounts, Stock, HR, Projects, Manufacturing, Support
  // ═══════════════════════════════════════════════════════════════════

  // --- Accounts ---

  {
    slug: 'sales-invoices',
    doctype: 'Sales Invoice',
    tag: 'Sales Invoices',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'customer', 'status', 'grand_total', 'outstanding_amount', 'currency', 'posting_date', 'due_date', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, example: 'Acme Corp', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'due_date', type: 'date', example: '2026-08-25' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 5000 },
      { name: 'outstanding_amount', type: 'number', example: 5000 },
      { name: 'is_return', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'paid'],
  },

  {
    slug: 'purchase-invoices',
    doctype: 'Purchase Invoice',
    tag: 'Purchase Invoices',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'supplier', 'status', 'grand_total', 'outstanding_amount', 'currency', 'posting_date', 'due_date', 'modified'],
    fields: [
      { name: 'supplier', type: 'string', required: true, example: 'Global Parts Inc', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'due_date', type: 'date', example: '2026-08-25' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 3200 },
      { name: 'outstanding_amount', type: 'number', example: 3200 },
      { name: 'is_return', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'paid'],
  },

  {
    slug: 'payment-entries',
    doctype: 'Payment Entry',
    tag: 'Payment Entries',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'payment_type', 'party_type', 'party', 'paid_amount', 'paid_from_account_currency', 'posting_date', 'status', 'modified'],
    fields: [
      { name: 'payment_type', type: 'string', required: true, example: 'Receive', description: '"Receive", "Pay", or "Internal Transfer"' },
      { name: 'party_type', type: 'string', required: true, example: 'Customer', filterable: true },
      { name: 'party', type: 'string', required: true, example: 'Acme Corp', filterable: true },
      { name: 'paid_amount', type: 'number', required: true, example: 5000 },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'mode_of_payment', type: 'string', example: 'Bank Transfer', filterable: true },
      { name: 'reference_no', type: 'string' },
      { name: 'reference_date', type: 'date' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'journal-entries',
    doctype: 'Journal Entry',
    tag: 'Journal Entries',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'voucher_type', 'posting_date', 'total_debit', 'total_credit', 'user_remark', 'modified'],
    fields: [
      { name: 'voucher_type', type: 'string', required: true, example: 'Journal Entry', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'total_debit', type: 'number', example: 10000 },
      { name: 'total_credit', type: 'number', example: 10000 },
      { name: 'user_remark', type: 'string' },
      { name: 'cheque_no', type: 'string' },
      { name: 'cheque_date', type: 'date' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'accounts',
    doctype: 'Account',
    tag: 'Chart of Accounts',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'account_name', 'account_type', 'root_type', 'is_group', 'parent_account', 'account_currency', 'modified'],
    fields: [
      { name: 'account_name', type: 'string', required: true, example: 'Cash' },
      { name: 'parent_account', type: 'string', example: 'Current Assets - Z' },
      { name: 'account_type', type: 'string', filterable: true },
      { name: 'root_type', type: 'string', filterable: true },
      { name: 'is_group', type: 'boolean', filterable: true },
      { name: 'account_currency', type: 'string', example: 'USD' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // --- Stock / Inventory ---

  {
    slug: 'warehouses',
    doctype: 'Warehouse',
    tag: 'Warehouses',
    module: 'Stock',
    minTier: 'pro',
    listFields: ['name', 'warehouse_name', 'warehouse_type', 'is_group', 'parent_warehouse', 'city', 'state', 'modified'],
    fields: [
      { name: 'warehouse_name', type: 'string', required: true, example: 'Main Warehouse' },
      { name: 'warehouse_type', type: 'string', example: 'Warehouse', filterable: true },
      { name: 'is_group', type: 'boolean', filterable: true },
      { name: 'parent_warehouse', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'state', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'stock-entries',
    doctype: 'Stock Entry',
    tag: 'Stock Entries',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'stock_entry_type', 'purpose', 'from_warehouse', 'to_warehouse', 'total_amount', 'posting_date', 'modified'],
    fields: [
      { name: 'stock_entry_type', type: 'string', required: true, example: 'Material Transfer', filterable: true },
      { name: 'purpose', type: 'string', filterable: true },
      { name: 'from_warehouse', type: 'string', filterable: true },
      { name: 'to_warehouse', type: 'string', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'total_amount', type: 'number', example: 15000 },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'delivery-notes',
    doctype: 'Delivery Note',
    tag: 'Delivery Notes',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'customer', 'status', 'grand_total', 'currency', 'posting_date', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, example: 'Acme Corp', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'set_warehouse', type: 'string' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 7500 },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'purchase-receipts',
    doctype: 'Purchase Receipt',
    tag: 'Purchase Receipts',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'supplier', 'status', 'grand_total', 'currency', 'posting_date', 'modified'],
    fields: [
      { name: 'supplier', type: 'string', required: true, example: 'Global Parts Inc', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'set_warehouse', type: 'string' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 6200 },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'material-requests',
    doctype: 'Material Request',
    tag: 'Material Requests',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'material_request_type', 'status', 'transaction_date', 'schedule_date', 'modified'],
    fields: [
      { name: 'material_request_type', type: 'string', required: true, example: 'Purchase', filterable: true },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
      { name: 'schedule_date', type: 'date', example: '2026-08-01' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'batches',
    doctype: 'Batch',
    tag: 'Batches',
    module: 'Stock',
    minTier: 'pro',
    listFields: ['name', 'batch_id', 'item', 'expiry_date', 'manufacturing_date', 'batch_qty', 'modified'],
    fields: [
      { name: 'batch_id', type: 'string', required: true, example: 'BATCH-001' },
      { name: 'item', type: 'string', required: true, example: 'IT-001', filterable: true },
      { name: 'expiry_date', type: 'date' },
      { name: 'manufacturing_date', type: 'date' },
      { name: 'batch_qty', type: 'number' },
    ],
    events: ['created', 'updated'],
  },

  {
    slug: 'serial-nos',
    doctype: 'Serial No',
    tag: 'Serial Numbers',
    module: 'Stock',
    minTier: 'pro',
    listFields: ['name', 'serial_no', 'item_code', 'warehouse', 'status', 'modified'],
    fields: [
      { name: 'serial_no', type: 'string', required: true, example: 'SN-00001' },
      { name: 'item_code', type: 'string', required: true, example: 'IT-001', filterable: true },
      { name: 'warehouse', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated'],
  },

  {
    slug: 'stock-balance',
    doctype: 'Bin',
    tag: 'Stock Balance',
    module: 'Stock',
    minTier: 'pro',
    readOnly: true,
    listFields: ['name', 'item_code', 'warehouse', 'actual_qty', 'planned_qty', 'reserved_qty', 'ordered_qty', 'projected_qty', 'valuation_rate', 'stock_value', 'modified'],
    fields: [
      { name: 'item_code', type: 'string', filterable: true },
      { name: 'warehouse', type: 'string', filterable: true },
      { name: 'actual_qty', type: 'number' },
      { name: 'planned_qty', type: 'number' },
      { name: 'reserved_qty', type: 'number' },
      { name: 'ordered_qty', type: 'number' },
      { name: 'projected_qty', type: 'number' },
      { name: 'valuation_rate', type: 'number' },
      { name: 'stock_value', type: 'number' },
    ],
    events: [],
  },

  // --- HR ---

  {
    slug: 'employees',
    doctype: 'Employee',
    tag: 'Employees',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'employee_name', 'designation', 'department', 'status', 'company', 'date_of_joining', 'modified'],
    fields: [
      { name: 'employee_name', type: 'string', required: true, example: 'John Doe' },
      { name: 'first_name', type: 'string', required: true, example: 'John' },
      { name: 'last_name', type: 'string', example: 'Doe' },
      { name: 'designation', type: 'string', example: 'Engineer', filterable: true },
      { name: 'department', type: 'string', example: 'Engineering', filterable: true },
      { name: 'status', type: 'string', example: 'Active', filterable: true },
      { name: 'date_of_joining', type: 'date', example: '2025-01-15' },
      { name: 'company', type: 'string', filterable: true },
      { name: 'gender', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'leave-applications',
    doctype: 'Leave Application',
    tag: 'Leave Applications',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'leave_type', 'from_date', 'to_date', 'total_leave_days', 'status', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, example: 'HR-EMP-00001', filterable: true },
      { name: 'leave_type', type: 'string', required: true, example: 'Casual Leave', filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-08-01' },
      { name: 'to_date', type: 'date', required: true, example: '2026-08-03' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'total_leave_days', type: 'number' },
      { name: 'reason', type: 'string' },
    ],
    events: ['created', 'updated', 'approved', 'rejected', 'cancelled'],
  },

  {
    slug: 'attendance',
    doctype: 'Attendance',
    tag: 'Attendance',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'attendance_date', 'status', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'attendance_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'status', type: 'string', required: true, example: 'Present', filterable: true },
      { name: 'leave_type', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'expense-claims',
    doctype: 'Expense Claim',
    tag: 'Expense Claims',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'total_claimed_amount', 'status', 'posting_date', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'total_claimed_amount', type: 'number', example: 450 },
      { name: 'status', type: 'string', filterable: true },
      { name: 'approval_status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'approved', 'rejected'],
  },

  // --- Projects ---

  {
    slug: 'projects',
    doctype: 'Project',
    tag: 'Projects',
    module: 'Projects',
    minTier: 'pro',
    listFields: ['name', 'project_name', 'status', 'percent_complete', 'expected_start_date', 'expected_end_date', 'company', 'modified'],
    fields: [
      { name: 'project_name', type: 'string', required: true, example: 'Website Redesign' },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'percent_complete', type: 'number', example: 35 },
      { name: 'expected_start_date', type: 'date', example: '2026-07-01' },
      { name: 'expected_end_date', type: 'date', example: '2026-09-30' },
      { name: 'company', type: 'string', filterable: true },
      { name: 'project_type', type: 'string', filterable: true },
      { name: 'priority', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted', 'completed'],
  },

  {
    slug: 'tasks',
    doctype: 'Task',
    tag: 'Tasks',
    module: 'Projects',
    minTier: 'pro',
    listFields: ['name', 'subject', 'project', 'status', 'priority', 'exp_start_date', 'exp_end_date', 'progress', 'modified'],
    fields: [
      { name: 'subject', type: 'string', required: true, example: 'Design mockups' },
      { name: 'project', type: 'string', filterable: true },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'priority', type: 'string', example: 'Medium', filterable: true },
      { name: 'exp_start_date', type: 'date' },
      { name: 'exp_end_date', type: 'date' },
      { name: 'progress', type: 'number', example: 0 },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted', 'completed'],
  },

  {
    slug: 'timesheets',
    doctype: 'Timesheet',
    tag: 'Timesheets',
    module: 'Projects',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'total_hours', 'total_billable_hours', 'status', 'start_date', 'end_date', 'modified'],
    fields: [
      { name: 'employee', type: 'string', filterable: true },
      { name: 'start_date', type: 'date', example: '2026-07-21' },
      { name: 'end_date', type: 'date', example: '2026-07-25' },
      { name: 'total_hours', type: 'number' },
      { name: 'total_billable_hours', type: 'number' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  // --- Manufacturing ---

  {
    slug: 'boms',
    doctype: 'BOM',
    tag: 'Bills of Materials',
    module: 'Manufacturing',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'item', 'item_name', 'is_active', 'is_default', 'total_cost', 'currency', 'modified'],
    fields: [
      { name: 'item', type: 'string', required: true, example: 'IT-001', filterable: true },
      { name: 'quantity', type: 'number', required: true, example: 1 },
      { name: 'is_active', type: 'boolean', filterable: true },
      { name: 'is_default', type: 'boolean', filterable: true },
      { name: 'total_cost', type: 'number' },
      { name: 'currency', type: 'string', example: 'USD' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'work-orders',
    doctype: 'Work Order',
    tag: 'Work Orders',
    module: 'Manufacturing',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'production_item', 'status', 'qty', 'produced_qty', 'planned_start_date', 'modified'],
    fields: [
      { name: 'production_item', type: 'string', required: true, example: 'IT-001', filterable: true },
      { name: 'qty', type: 'number', required: true, example: 100 },
      { name: 'status', type: 'string', filterable: true },
      { name: 'produced_qty', type: 'number' },
      { name: 'planned_start_date', type: 'date', example: '2026-08-01' },
      { name: 'expected_delivery_date', type: 'date' },
      { name: 'bom_no', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'completed', 'cancelled'],
  },

  // --- Support ---

  {
    slug: 'issues',
    doctype: 'Issue',
    tag: 'Support Issues',
    module: 'Support',
    minTier: 'pro',
    listFields: ['name', 'subject', 'customer', 'status', 'priority', 'issue_type', 'opening_date', 'modified'],
    fields: [
      { name: 'subject', type: 'string', required: true, example: 'Login not working' },
      { name: 'customer', type: 'string', filterable: true },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'priority', type: 'string', example: 'Medium', filterable: true },
      { name: 'issue_type', type: 'string', filterable: true },
      { name: 'opening_date', type: 'date' },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'resolved', 'closed'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Assets, Quality, Advanced Manufacturing
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'assets',
    doctype: 'Asset',
    tag: 'Assets',
    module: 'Assets',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'asset_name', 'asset_category', 'status', 'gross_purchase_amount', 'location', 'purchase_date', 'modified'],
    fields: [
      { name: 'asset_name', type: 'string', required: true, example: 'MacBook Pro 16"' },
      { name: 'asset_category', type: 'string', required: true, example: 'Electronic Equipment', filterable: true },
      { name: 'item_code', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'gross_purchase_amount', type: 'number', example: 2500 },
      { name: 'purchase_date', type: 'date', example: '2026-01-15' },
      { name: 'location', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'scrapped'],
  },

  {
    slug: 'quality-inspections',
    doctype: 'Quality Inspection',
    tag: 'Quality Inspections',
    module: 'Stock',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'inspection_type', 'item_code', 'status', 'inspected_by', 'report_date', 'modified'],
    fields: [
      { name: 'inspection_type', type: 'string', required: true, example: 'Incoming', filterable: true },
      { name: 'item_code', type: 'string', required: true, filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'inspected_by', type: 'string' },
      { name: 'report_date', type: 'date', example: '2026-07-25' },
      { name: 'sample_size', type: 'number', example: 5 },
    ],
    events: ['created', 'submitted', 'rejected'],
  },

  {
    slug: 'production-plans',
    doctype: 'Production Plan',
    tag: 'Production Plans',
    module: 'Manufacturing',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'status', 'posting_date', 'total_planned_qty', 'total_produced_qty', 'modified'],
    fields: [
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'total_planned_qty', type: 'number' },
      { name: 'total_produced_qty', type: 'number' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'completed'],
  },

  {
    slug: 'subcontracting-orders',
    doctype: 'Subcontracting Order',
    tag: 'Subcontracting Orders',
    module: 'Subcontracting',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'supplier', 'status', 'transaction_date', 'modified'],
    fields: [
      { name: 'supplier', type: 'string', required: true, filterable: true },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'subscriptions',
    doctype: 'Subscription',
    tag: 'Subscriptions',
    module: 'Accounts',
    minTier: 'business',
    listFields: ['name', 'party_type', 'party', 'status', 'current_invoice_start', 'current_invoice_end', 'modified'],
    fields: [
      { name: 'party_type', type: 'string', required: true, example: 'Customer', filterable: true },
      { name: 'party', type: 'string', required: true, filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'current_invoice_start', type: 'date' },
      { name: 'current_invoice_end', type: 'date' },
    ],
    events: ['created', 'updated', 'cancelled', 'renewed'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FREE TIER — CRM Comms extras
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'addresses',
    doctype: 'Address',
    tag: 'Addresses',
    module: 'Contacts',
    minTier: 'free',
    listFields: ['name', 'address_title', 'address_type', 'city', 'state', 'country', 'pincode', 'modified'],
    fields: [
      { name: 'address_title', type: 'string', required: true, example: 'Acme HQ' },
      { name: 'address_type', type: 'string', required: true, example: 'Billing', filterable: true },
      { name: 'address_line1', type: 'string', required: true, example: '123 Main St' },
      { name: 'address_line2', type: 'string' },
      { name: 'city', type: 'string', required: true, example: 'San Francisco', filterable: true },
      { name: 'state', type: 'string', example: 'CA', filterable: true },
      { name: 'country', type: 'string', required: true, example: 'United States', filterable: true },
      { name: 'pincode', type: 'string', example: '94105' },
      { name: 'is_primary_address', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Banking (Accounts / Payments)
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'banks',
    doctype: 'Bank',
    tag: 'Banks',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'bank_name', 'swift_number', 'website', 'modified'],
    fields: [
      { name: 'bank_name', type: 'string', required: true, example: 'Chase Bank' },
      { name: 'swift_number', type: 'string', example: 'CHASUS33' },
      { name: 'website', type: 'string', example: 'https://www.chase.com' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'bank-accounts',
    doctype: 'Bank Account',
    tag: 'Bank Accounts',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'account_name', 'bank', 'account', 'account_type', 'iban', 'is_default', 'disabled', 'modified'],
    fields: [
      { name: 'account_name', type: 'string', required: true, example: 'Operating - Chase' },
      { name: 'bank', type: 'string', required: true, example: 'Chase Bank', filterable: true },
      { name: 'account', type: 'string', example: '1200 - Bank - Z', filterable: true },
      { name: 'account_type', type: 'string', example: 'Checking', filterable: true },
      { name: 'iban', type: 'string', example: 'DE89370400440532013000' },
      { name: 'bank_account_no', type: 'string', example: '000123456789' },
      { name: 'branch_code', type: 'string' },
      { name: 'is_default', type: 'boolean', filterable: true },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted', 'balance_updated'],
  },

  {
    slug: 'bank-transactions',
    doctype: 'Bank Transaction',
    tag: 'Bank Transactions',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'date', 'bank_account', 'description', 'deposit', 'withdrawal', 'currency', 'status', 'reference_number', 'modified'],
    fields: [
      { name: 'date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'bank_account', type: 'string', required: true, example: 'Operating - Chase', filterable: true },
      { name: 'description', type: 'string', example: 'ACH deposit — Acme Corp' },
      { name: 'deposit', type: 'number', example: 5000 },
      { name: 'withdrawal', type: 'number', example: 0 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'reference_number', type: 'string', example: 'ACH-2026-0001' },
      { name: 'status', type: 'string', example: 'Unreconciled', filterable: true },
      { name: 'party_type', type: 'string', filterable: true },
      { name: 'party', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'matched', 'reconciled', 'unreconciled'],
  },

  {
    slug: 'bank-clearances',
    doctype: 'Bank Clearance',
    tag: 'Bank Clearances',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'account', 'from_date', 'to_date', 'bank_account', 'modified'],
    fields: [
      { name: 'account', type: 'string', required: true, filterable: true },
      { name: 'bank_account', type: 'string', filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-07-01' },
      { name: 'to_date', type: 'date', required: true, example: '2026-07-31' },
      { name: 'include_reconciled_entries', type: 'boolean' },
    ],
    events: ['created', 'updated'],
  },

  {
    slug: 'bank-statement-imports',
    doctype: 'Bank Statement Import',
    tag: 'Bank Statement Imports',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'bank_account', 'bank', 'import_type', 'status', 'import_file', 'company', 'modified'],
    fields: [
      { name: 'company', type: 'string', filterable: true },
      { name: 'bank_account', type: 'string', required: true, filterable: true },
      { name: 'bank', type: 'string', filterable: true },
      { name: 'import_file', type: 'string', example: '/private/files/statement.csv' },
      { name: 'template_options', type: 'string' },
      { name: 'status', type: 'string', example: 'Pending', filterable: true },
      { name: 'reference_doctype', type: 'string' },
      { name: 'import_type', type: 'string', example: 'Insert New Records', filterable: true },
      { name: 'submit_after_import', type: 'boolean' },
      { name: 'google_sheets_url', type: 'string' },
    ],
    events: ['created', 'started', 'completed', 'failed'],
  },

  {
    slug: 'bank-transaction-rules',
    doctype: 'Bank Transaction Rule',
    tag: 'Bank Transaction Rules',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'rule_name', 'transaction_type', 'classify_as', 'priority', 'company', 'modified'],
    fields: [
      { name: 'rule_name', type: 'string', required: true, example: 'Stripe payouts → Sales' },
      { name: 'transaction_type', type: 'string', example: 'Deposit', filterable: true },
      { name: 'min_amount', type: 'number', example: 0 },
      { name: 'max_amount', type: 'number', example: 100000 },
      { name: 'rule_description', type: 'string', example: 'STRIPE PAYOUT' },
      { name: 'classify_as', type: 'string', example: 'Payment Entry' },
      { name: 'account', type: 'string' },
      { name: 'party_type', type: 'string' },
      { name: 'party', type: 'string' },
      { name: 'priority', type: 'number', example: 10, filterable: true },
      { name: 'company', type: 'string', filterable: true },
      { name: 'bank_entry_type', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'bank-guarantees',
    doctype: 'Bank Guarantee',
    tag: 'Bank Guarantees',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'bank', 'bank_account', 'reference_docname', 'bank_guarantee_number', 'amount', 'start_date', 'end_date', 'modified'],
    fields: [
      { name: 'bank', type: 'string', required: true, filterable: true },
      { name: 'bank_account', type: 'string', required: true, filterable: true },
      { name: 'bank_guarantee_number', type: 'string', required: true, example: 'BG-2026-0001' },
      { name: 'reference_doctype', type: 'string', example: 'Purchase Order' },
      { name: 'reference_docname', type: 'string' },
      { name: 'amount', type: 'number', required: true, example: 50000 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'start_date', type: 'date', example: '2026-08-01' },
      { name: 'end_date', type: 'date', example: '2027-08-01' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'mode-of-payments',
    doctype: 'Mode of Payment',
    tag: 'Modes of Payment',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'mode_of_payment', 'type', 'enabled', 'modified'],
    fields: [
      { name: 'mode_of_payment', type: 'string', required: true, example: 'Bank Transfer' },
      { name: 'type', type: 'string', example: 'Bank', filterable: true },
      { name: 'enabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'payment-terms-templates',
    doctype: 'Payment Terms Template',
    tag: 'Payment Terms Templates',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'template_name', 'modified'],
    fields: [
      { name: 'template_name', type: 'string', required: true, example: 'Net 30' },
      { name: 'allocate_payment_based_on_payment_terms', type: 'boolean' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'payment-requests',
    doctype: 'Payment Request',
    tag: 'Payment Requests',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'party_type', 'party', 'reference_doctype', 'reference_name', 'grand_total', 'status', 'transaction_date', 'modified'],
    fields: [
      { name: 'payment_request_type', type: 'string', required: true, example: 'Inward', description: '"Inward" or "Outward"' },
      { name: 'party_type', type: 'string', required: true, filterable: true },
      { name: 'party', type: 'string', required: true, filterable: true },
      { name: 'reference_doctype', type: 'string', example: 'Sales Invoice' },
      { name: 'reference_name', type: 'string' },
      { name: 'grand_total', type: 'number', required: true, example: 5000 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'transaction_date', type: 'date', example: '2026-07-25' },
    ],
    events: ['created', 'updated', 'submitted', 'sent', 'paid', 'cancelled', 'expired'],
  },

  {
    slug: 'payment-reconciliations',
    doctype: 'Payment Reconciliation',
    tag: 'Payment Reconciliations',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'company', 'party_type', 'party', 'receivable_payable_account', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'party_type', type: 'string', required: true, filterable: true },
      { name: 'party', type: 'string', required: true, filterable: true },
      { name: 'receivable_payable_account', type: 'string' },
      { name: 'from_invoice_date', type: 'date' },
      { name: 'to_invoice_date', type: 'date' },
      { name: 'from_payment_date', type: 'date' },
      { name: 'to_payment_date', type: 'date' },
    ],
    events: ['created', 'updated', 'reconciled'],
  },

  {
    slug: 'process-payment-reconciliations',
    doctype: 'Process Payment Reconciliation',
    tag: 'Process Payment Reconciliations',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'company', 'party_type', 'party', 'status', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'party_type', type: 'string', required: true, filterable: true },
      { name: 'party', type: 'string', filterable: true },
      { name: 'receivable_payable_account', type: 'string' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted'],
  },

  {
    slug: 'payment-orders',
    doctype: 'Payment Order',
    tag: 'Payment Orders',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'company_bank_account', 'payment_order_type', 'posting_date', 'modified'],
    fields: [
      { name: 'company_bank_account', type: 'string', required: true, filterable: true },
      { name: 'payment_order_type', type: 'string', example: 'Payment Request', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'payment-gateway-accounts',
    doctype: 'Payment Gateway Account',
    tag: 'Payment Gateway Accounts',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'payment_gateway', 'payment_account', 'currency', 'is_default', 'modified'],
    fields: [
      { name: 'payment_gateway', type: 'string', required: true, example: 'Stripe', filterable: true },
      { name: 'payment_account', type: 'string', required: true },
      { name: 'currency', type: 'string', example: 'USD', filterable: true },
      { name: 'is_default', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'dunnings',
    doctype: 'Dunning',
    tag: 'Dunnings',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'customer', 'posting_date', 'dunning_type', 'status', 'grand_total', 'currency', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'dunning_type', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number' },
      { name: 'currency', type: 'string', example: 'USD' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Accounts extended
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'cost-centers',
    doctype: 'Cost Center',
    tag: 'Cost Centers',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'cost_center_name', 'parent_cost_center', 'is_group', 'company', 'disabled', 'modified'],
    fields: [
      { name: 'cost_center_name', type: 'string', required: true, example: 'Sales - US' },
      { name: 'parent_cost_center', type: 'string' },
      { name: 'is_group', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'fiscal-years',
    doctype: 'Fiscal Year',
    tag: 'Fiscal Years',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'year', 'year_start_date', 'year_end_date', 'disabled', 'modified'],
    fields: [
      { name: 'year', type: 'string', required: true, example: '2026' },
      { name: 'year_start_date', type: 'date', required: true, example: '2026-01-01' },
      { name: 'year_end_date', type: 'date', required: true, example: '2026-12-31' },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'budgets',
    doctype: 'Budget',
    tag: 'Budgets',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'budget_against', 'cost_center', 'project', 'fiscal_year', 'company', 'modified'],
    fields: [
      { name: 'budget_against', type: 'string', required: true, example: 'Cost Center', filterable: true },
      { name: 'cost_center', type: 'string', filterable: true },
      { name: 'project', type: 'string', filterable: true },
      { name: 'fiscal_year', type: 'string', required: true, filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'monthly_distribution', type: 'string' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'pos-invoices',
    doctype: 'POS Invoice',
    tag: 'POS Invoices',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'customer', 'pos_profile', 'status', 'grand_total', 'paid_amount', 'posting_date', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, filterable: true },
      { name: 'pos_profile', type: 'string', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'grand_total', type: 'number', example: 250 },
      { name: 'paid_amount', type: 'number', example: 250 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'is_return', type: 'boolean', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'pos-profiles',
    doctype: 'POS Profile',
    tag: 'POS Profiles',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'company', 'warehouse', 'currency', 'disabled', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'warehouse', type: 'string', filterable: true },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'disabled', type: 'boolean', filterable: true },
      { name: 'write_off_account', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'loyalty-programs',
    doctype: 'Loyalty Program',
    tag: 'Loyalty Programs',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'loyalty_program_name', 'from_date', 'to_date', 'company', 'auto_opt_in', 'modified'],
    fields: [
      { name: 'loyalty_program_name', type: 'string', required: true, example: 'Rewards Club' },
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'auto_opt_in', type: 'boolean', filterable: true },
      { name: 'expiry_duration', type: 'number' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'period-closing-vouchers',
    doctype: 'Period Closing Voucher',
    tag: 'Period Closing Vouchers',
    module: 'Accounts',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'fiscal_year', 'posting_date', 'company', 'closing_account_head', 'modified'],
    fields: [
      { name: 'fiscal_year', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', required: true, example: '2026-12-31' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'closing_account_head', type: 'string', required: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'accounting-periods',
    doctype: 'Accounting Period',
    tag: 'Accounting Periods',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'period_name', 'start_date', 'end_date', 'company', 'modified'],
    fields: [
      { name: 'period_name', type: 'string', required: true, example: 'Q3 2026' },
      { name: 'start_date', type: 'date', required: true, example: '2026-07-01' },
      { name: 'end_date', type: 'date', required: true, example: '2026-09-30' },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'tax-categories',
    doctype: 'Tax Category',
    tag: 'Tax Categories',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'title', 'disabled', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Reduced VAT' },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'sales-taxes-charges-templates',
    doctype: 'Sales Taxes and Charges Template',
    tag: 'Sales Tax Templates',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'title', 'company', 'is_default', 'disabled', 'tax_category', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'US Sales Tax' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'is_default', type: 'boolean', filterable: true },
      { name: 'disabled', type: 'boolean', filterable: true },
      { name: 'tax_category', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'purchase-taxes-charges-templates',
    doctype: 'Purchase Taxes and Charges Template',
    tag: 'Purchase Tax Templates',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'title', 'company', 'is_default', 'disabled', 'tax_category', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'US Purchase Tax' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'is_default', type: 'boolean', filterable: true },
      { name: 'disabled', type: 'boolean', filterable: true },
      { name: 'tax_category', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'accounting-dimensions',
    doctype: 'Accounting Dimension',
    tag: 'Accounting Dimensions',
    module: 'Accounts',
    minTier: 'pro',
    listFields: ['name', 'label', 'document_type', 'fieldname', 'disabled', 'modified'],
    fields: [
      { name: 'label', type: 'string', required: true, example: 'Branch' },
      { name: 'document_type', type: 'string', required: true, example: 'Branch' },
      { name: 'fieldname', type: 'string', example: 'branch' },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'gl-entries',
    doctype: 'GL Entry',
    tag: 'GL Entries',
    module: 'Accounts',
    minTier: 'pro',
    readOnly: true,
    listFields: ['name', 'posting_date', 'account', 'party_type', 'party', 'debit', 'credit', 'voucher_type', 'voucher_no', 'against_voucher', 'modified'],
    fields: [
      { name: 'posting_date', type: 'date', filterable: true },
      { name: 'account', type: 'string', filterable: true },
      { name: 'party_type', type: 'string', filterable: true },
      { name: 'party', type: 'string', filterable: true },
      { name: 'debit', type: 'number' },
      { name: 'credit', type: 'number' },
      { name: 'voucher_type', type: 'string', filterable: true },
      { name: 'voucher_no', type: 'string', filterable: true },
      { name: 'against_voucher', type: 'string' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Stock extended
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'stock-reconciliations',
    doctype: 'Stock Reconciliation',
    tag: 'Stock Reconciliations',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'purpose', 'posting_date', 'company', 'difference_amount', 'modified'],
    fields: [
      { name: 'purpose', type: 'string', required: true, example: 'Stock Reconciliation', filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'difference_amount', type: 'number' },
      { name: 'expense_account', type: 'string' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'pick-lists',
    doctype: 'Pick List',
    tag: 'Pick Lists',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'purpose', 'customer', 'parent_warehouse', 'status', 'company', 'modified'],
    fields: [
      { name: 'purpose', type: 'string', required: true, example: 'Delivery', filterable: true },
      { name: 'customer', type: 'string', filterable: true },
      { name: 'parent_warehouse', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'shipments',
    doctype: 'Shipment',
    tag: 'Shipments',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'pickup_from_type', 'delivery_to_type', 'pickup_date', 'delivery_date', 'status', 'tracking_url', 'modified'],
    fields: [
      { name: 'pickup_from_type', type: 'string', required: true, example: 'Company', filterable: true },
      { name: 'delivery_to_type', type: 'string', required: true, example: 'Customer', filterable: true },
      { name: 'pickup_date', type: 'date', example: '2026-07-26' },
      { name: 'delivery_date', type: 'date', example: '2026-07-28' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'tracking_url', type: 'string' },
      { name: 'carrier', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'delivery-trips',
    doctype: 'Delivery Trip',
    tag: 'Delivery Trips',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'driver', 'driver_name', 'vehicle', 'departure_time', 'status', 'company', 'modified'],
    fields: [
      { name: 'driver', type: 'string', filterable: true },
      { name: 'vehicle', type: 'string' },
      { name: 'departure_time', type: 'date', example: '2026-07-26' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'packing-slips',
    doctype: 'Packing Slip',
    tag: 'Packing Slips',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'delivery_note', 'posting_date', 'from_case_no', 'to_case_no', 'status', 'modified'],
    fields: [
      { name: 'delivery_note', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'from_case_no', type: 'number' },
      { name: 'to_case_no', type: 'number' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'landed-cost-vouchers',
    doctype: 'Landed Cost Voucher',
    tag: 'Landed Cost Vouchers',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'company', 'posting_date', 'total_taxes_and_charges', 'distribute_charges_based_on', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', example: '2026-07-25' },
      { name: 'total_taxes_and_charges', type: 'number' },
      { name: 'distribute_charges_based_on', type: 'string', example: 'Qty', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'putaway-rules',
    doctype: 'Putaway Rule',
    tag: 'Putaway Rules',
    module: 'Stock',
    minTier: 'pro',
    listFields: ['name', 'item_code', 'warehouse', 'priority', 'capacity', 'disable', 'modified'],
    fields: [
      { name: 'item_code', type: 'string', required: true, filterable: true },
      { name: 'warehouse', type: 'string', required: true, filterable: true },
      { name: 'priority', type: 'number', example: 1 },
      { name: 'capacity', type: 'number', example: 100 },
      { name: 'stock_uom', type: 'string' },
      { name: 'disable', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'serial-batch-bundles',
    doctype: 'Serial and Batch Bundle',
    tag: 'Serial & Batch Bundles',
    module: 'Stock',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'item_code', 'warehouse', 'type_of_transaction', 'voucher_type', 'voucher_no', 'total_qty', 'modified'],
    fields: [
      { name: 'item_code', type: 'string', required: true, filterable: true },
      { name: 'warehouse', type: 'string', filterable: true },
      { name: 'type_of_transaction', type: 'string', example: 'Inward', filterable: true },
      { name: 'voucher_type', type: 'string', filterable: true },
      { name: 'voucher_no', type: 'string' },
      { name: 'total_qty', type: 'number' },
      { name: 'has_serial_no', type: 'boolean' },
      { name: 'has_batch_no', type: 'boolean' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'stock-ledger-entries',
    doctype: 'Stock Ledger Entry',
    tag: 'Stock Ledger Entries',
    module: 'Stock',
    minTier: 'pro',
    readOnly: true,
    listFields: ['name', 'posting_date', 'item_code', 'warehouse', 'actual_qty', 'qty_after_transaction', 'voucher_type', 'voucher_no', 'stock_value', 'modified'],
    fields: [
      { name: 'posting_date', type: 'date', filterable: true },
      { name: 'item_code', type: 'string', filterable: true },
      { name: 'warehouse', type: 'string', filterable: true },
      { name: 'actual_qty', type: 'number' },
      { name: 'qty_after_transaction', type: 'number' },
      { name: 'voucher_type', type: 'string', filterable: true },
      { name: 'voucher_no', type: 'string', filterable: true },
      { name: 'stock_value', type: 'number' },
      { name: 'valuation_rate', type: 'number' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — HR extended
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'employee-grades',
    doctype: 'Employee Grade',
    tag: 'Employee Grades',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'default_base_pay', 'modified'],
    fields: [
      { name: 'name', type: 'string', required: true, example: 'Grade A' },
      { name: 'default_base_pay', type: 'number' },
      { name: 'default_leave_policy', type: 'string' },
      { name: 'default_salary_structure', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'departments',
    doctype: 'Department',
    tag: 'Departments',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'department_name', 'parent_department', 'is_group', 'company', 'disabled', 'modified'],
    fields: [
      { name: 'department_name', type: 'string', required: true, example: 'Engineering' },
      { name: 'parent_department', type: 'string' },
      { name: 'is_group', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', filterable: true },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'designations',
    doctype: 'Designation',
    tag: 'Designations',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'designation_name', 'modified'],
    fields: [
      { name: 'designation_name', type: 'string', required: true, example: 'Senior Engineer' },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'leave-types',
    doctype: 'Leave Type',
    tag: 'Leave Types',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'leave_type_name', 'max_leaves_allowed', 'is_carry_forward', 'is_lwp', 'modified'],
    fields: [
      { name: 'leave_type_name', type: 'string', required: true, example: 'Casual Leave' },
      { name: 'max_leaves_allowed', type: 'number', example: 12 },
      { name: 'is_carry_forward', type: 'boolean', filterable: true },
      { name: 'is_lwp', type: 'boolean', filterable: true },
      { name: 'is_ppl', type: 'boolean' },
      { name: 'include_holiday', type: 'boolean' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'leave-allocations',
    doctype: 'Leave Allocation',
    tag: 'Leave Allocations',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'leave_type', 'from_date', 'to_date', 'total_leaves_allocated', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'leave_type', type: 'string', required: true, filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-01-01' },
      { name: 'to_date', type: 'date', required: true, example: '2026-12-31' },
      { name: 'total_leaves_allocated', type: 'number', required: true, example: 12 },
      { name: 'carry_forward', type: 'boolean' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'leave-policies',
    doctype: 'Leave Policy',
    tag: 'Leave Policies',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'title', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Standard Leave Policy' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'attendance-requests',
    doctype: 'Attendance Request',
    tag: 'Attendance Requests',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'from_date', 'to_date', 'reason', 'company', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'to_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'reason', type: 'string', example: 'Work From Home', filterable: true },
      { name: 'explanation', type: 'string' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'approved', 'rejected', 'cancelled'],
  },

  {
    slug: 'employee-checkins',
    doctype: 'Employee Checkin',
    tag: 'Employee Check-ins',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'employee', 'employee_name', 'log_type', 'time', 'device_id', 'shift', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'log_type', type: 'string', required: true, example: 'IN', filterable: true },
      { name: 'time', type: 'date', required: true, example: '2026-07-25' },
      { name: 'device_id', type: 'string' },
      { name: 'shift', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'payroll-entries',
    doctype: 'Payroll Entry',
    tag: 'Payroll Entries',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'posting_date', 'payroll_frequency', 'start_date', 'end_date', 'company', 'status', 'modified'],
    fields: [
      { name: 'posting_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'payroll_frequency', type: 'string', example: 'Monthly', filterable: true },
      { name: 'start_date', type: 'date', required: true, example: '2026-07-01' },
      { name: 'end_date', type: 'date', required: true, example: '2026-07-31' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'salary-slips',
    doctype: 'Salary Slip',
    tag: 'Salary Slips',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'start_date', 'end_date', 'gross_pay', 'net_pay', 'status', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'start_date', type: 'date', example: '2026-07-01' },
      { name: 'end_date', type: 'date', example: '2026-07-31' },
      { name: 'gross_pay', type: 'number' },
      { name: 'net_pay', type: 'number' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'salary_structure', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'salary-structures',
    doctype: 'Salary Structure',
    tag: 'Salary Structures',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'company', 'is_active', 'salary_slip_based_on_timesheet', 'currency', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'is_active', type: 'string', example: 'Yes', filterable: true },
      { name: 'salary_slip_based_on_timesheet', type: 'boolean' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'payroll_frequency', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'salary-structure-assignments',
    doctype: 'Salary Structure Assignment',
    tag: 'Salary Structure Assignments',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'salary_structure', 'from_date', 'base', 'company', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'salary_structure', type: 'string', required: true, filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-07-01' },
      { name: 'base', type: 'number', example: 5000 },
      { name: 'variable', type: 'number' },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'appraisals',
    doctype: 'Appraisal',
    tag: 'Appraisals',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'appraisal_template', 'appraisal_cycle', 'status', 'final_score', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'appraisal_template', type: 'string', filterable: true },
      { name: 'appraisal_cycle', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'final_score', type: 'number' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'employee-advances',
    doctype: 'Employee Advance',
    tag: 'Employee Advances',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'posting_date', 'advance_amount', 'status', 'company', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'purpose', type: 'string', example: 'Travel', filterable: true },
      { name: 'advance_amount', type: 'number', required: true, example: 500 },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'approved', 'rejected', 'cancelled'],
  },

  {
    slug: 'employee-onboardings',
    doctype: 'Employee Onboarding',
    tag: 'Employee Onboardings',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'employee_name', 'job_applicant', 'date_of_joining', 'boarding_status', 'company', 'modified'],
    fields: [
      { name: 'employee_name', type: 'string', required: true, example: 'John Doe' },
      { name: 'job_applicant', type: 'string', filterable: true },
      { name: 'date_of_joining', type: 'date', example: '2026-08-01' },
      { name: 'boarding_status', type: 'string', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'department', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'shift-assignments',
    doctype: 'Shift Assignment',
    tag: 'Shift Assignments',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'shift_type', 'start_date', 'end_date', 'status', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'shift_type', type: 'string', required: true, filterable: true },
      { name: 'start_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'end_date', type: 'date' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'holiday-lists',
    doctype: 'Holiday List',
    tag: 'Holiday Lists',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'holiday_list_name', 'from_date', 'to_date', 'total_holidays', 'modified'],
    fields: [
      { name: 'holiday_list_name', type: 'string', required: true, example: 'US Holidays 2026' },
      { name: 'from_date', type: 'date', required: true, example: '2026-01-01' },
      { name: 'to_date', type: 'date', required: true, example: '2026-12-31' },
      { name: 'total_holidays', type: 'number' },
      { name: 'country', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'shift-types',
    doctype: 'Shift Type',
    tag: 'Shift Types',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'start_time', 'end_time', 'enable_auto_attendance', 'modified'],
    fields: [
      { name: 'name', type: 'string', required: true, example: 'Morning Shift' },
      { name: 'start_time', type: 'string', example: '09:00:00' },
      { name: 'end_time', type: 'string', example: '17:00:00' },
      { name: 'enable_auto_attendance', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Talent / HRMS
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'job-openings',
    doctype: 'Job Opening',
    tag: 'Job Openings',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'job_title', 'department', 'designation', 'status', 'company', 'posted_on', 'modified'],
    fields: [
      { name: 'job_title', type: 'string', required: true, example: 'Senior Backend Engineer' },
      { name: 'department', type: 'string', filterable: true },
      { name: 'designation', type: 'string', filterable: true },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'posted_on', type: 'date', example: '2026-07-25' },
      { name: 'closes_on', type: 'date' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'job-applicants',
    doctype: 'Job Applicant',
    tag: 'Job Applicants',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'applicant_name', 'email_id', 'job_title', 'status', 'source', 'modified'],
    fields: [
      { name: 'applicant_name', type: 'string', required: true, example: 'Jane Doe' },
      { name: 'email_id', type: 'string', required: true, example: 'jane@example.com' },
      { name: 'phone_number', type: 'string' },
      { name: 'job_title', type: 'string', filterable: true },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'source', type: 'string', filterable: true },
      { name: 'resume_link', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'interviews',
    doctype: 'Interview',
    tag: 'Interviews',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'job_applicant', 'interview_round', 'scheduled_on', 'from_time', 'to_time', 'status', 'modified'],
    fields: [
      { name: 'job_applicant', type: 'string', required: true, filterable: true },
      { name: 'interview_round', type: 'string', required: true, filterable: true },
      { name: 'scheduled_on', type: 'date', required: true, example: '2026-08-01' },
      { name: 'from_time', type: 'string', example: '10:00:00' },
      { name: 'to_time', type: 'string', example: '11:00:00' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'average_rating', type: 'number' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'interview-rounds',
    doctype: 'Interview Round',
    tag: 'Interview Rounds',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'round_name', 'designation', 'expected_duration', 'modified'],
    fields: [
      { name: 'round_name', type: 'string', required: true, example: 'Technical Screen' },
      { name: 'designation', type: 'string', filterable: true },
      { name: 'expected_duration', type: 'number', example: 60 },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'job-offers',
    doctype: 'Job Offer',
    tag: 'Job Offers',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'job_applicant', 'applicant_name', 'designation', 'offer_date', 'status', 'company', 'modified'],
    fields: [
      { name: 'job_applicant', type: 'string', required: true, filterable: true },
      { name: 'designation', type: 'string', required: true, filterable: true },
      { name: 'offer_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'accepted', 'rejected', 'cancelled'],
  },

  {
    slug: 'appointment-letters',
    doctype: 'Appointment Letter',
    tag: 'Appointment Letters',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'job_applicant', 'applicant_name', 'appointment_date', 'company', 'modified'],
    fields: [
      { name: 'job_applicant', type: 'string', filterable: true },
      { name: 'applicant_name', type: 'string' },
      { name: 'appointment_date', type: 'date', example: '2026-08-01' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'body', type: 'string' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'goals',
    doctype: 'Goal',
    tag: 'Goals',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'goal_name', 'employee', 'status', 'progress', 'start_date', 'end_date', 'modified'],
    fields: [
      { name: 'goal_name', type: 'string', required: true, example: 'Ship Q3 roadmap' },
      { name: 'employee', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'progress', type: 'number' },
      { name: 'start_date', type: 'date' },
      { name: 'end_date', type: 'date' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'performance-feedbacks',
    doctype: 'Employee Performance Feedback',
    tag: 'Performance Feedbacks',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'employee', 'employee_name', 'reviewer', 'feedback_date', 'total_score', 'modified'],
    fields: [
      { name: 'employee', type: 'string', required: true, filterable: true },
      { name: 'reviewer', type: 'string', filterable: true },
      { name: 'feedback_date', type: 'date', example: '2026-07-25' },
      { name: 'total_score', type: 'number' },
      { name: 'appraisal', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'training-events',
    doctype: 'Training Event',
    tag: 'Training Events',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'event_name', 'event_status', 'start_time', 'end_time', 'location', 'modified'],
    fields: [
      { name: 'event_name', type: 'string', required: true, example: 'Security Awareness Q3' },
      { name: 'event_status', type: 'string', filterable: true },
      { name: 'start_time', type: 'date', example: '2026-08-15' },
      { name: 'end_time', type: 'date', example: '2026-08-15' },
      { name: 'location', type: 'string' },
      { name: 'training_program', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'training-programs',
    doctype: 'Training Program',
    tag: 'Training Programs',
    module: 'HR',
    minTier: 'pro',
    listFields: ['name', 'training_program', 'supplier', 'is_internal', 'modified'],
    fields: [
      { name: 'training_program', type: 'string', required: true, example: 'Data Privacy Basics' },
      { name: 'supplier', type: 'string', filterable: true },
      { name: 'is_internal', type: 'boolean', filterable: true },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'training-results',
    doctype: 'Training Result',
    tag: 'Training Results',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'training_event', 'employee', 'grade', 'modified'],
    fields: [
      { name: 'training_event', type: 'string', required: true, filterable: true },
      { name: 'employee', type: 'string', filterable: true },
      { name: 'grade', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'training-feedbacks',
    doctype: 'Training Feedback',
    tag: 'Training Feedbacks',
    module: 'HR',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'training_event', 'employee', 'course', 'feedback', 'modified'],
    fields: [
      { name: 'training_event', type: 'string', required: true, filterable: true },
      { name: 'employee', type: 'string', filterable: true },
      { name: 'course', type: 'string' },
      { name: 'feedback', type: 'string' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Projects extended
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'project-templates',
    doctype: 'Project Template',
    tag: 'Project Templates',
    module: 'Projects',
    minTier: 'pro',
    listFields: ['name', 'project_type', 'modified'],
    fields: [
      { name: 'name', type: 'string', required: true, example: 'Standard Website Build' },
      { name: 'project_type', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'activity-types',
    doctype: 'Activity Type',
    tag: 'Activity Types',
    module: 'Projects',
    minTier: 'pro',
    listFields: ['name', 'activity_type', 'costing_rate', 'billing_rate', 'disabled', 'modified'],
    fields: [
      { name: 'activity_type', type: 'string', required: true, example: 'Development' },
      { name: 'costing_rate', type: 'number', example: 50 },
      { name: 'billing_rate', type: 'number', example: 120 },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Manufacturing (BOM Creator)
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'bom-creators',
    doctype: 'BOM Creator',
    tag: 'BOM Creators',
    module: 'Manufacturing',
    minTier: 'pro',
    submittable: true,
    listFields: ['name', 'item_code', 'item_name', 'company', 'status', 'currency', 'modified'],
    fields: [
      { name: 'item_code', type: 'string', required: true, filterable: true },
      { name: 'item_name', type: 'string' },
      { name: 'quantity', type: 'number', example: 1 },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Manufacturing advanced
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'job-cards',
    doctype: 'Job Card',
    tag: 'Job Cards',
    module: 'Manufacturing',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'work_order', 'production_item', 'operation', 'workstation', 'status', 'for_quantity', 'total_completed_qty', 'modified'],
    fields: [
      { name: 'work_order', type: 'string', filterable: true },
      { name: 'production_item', type: 'string', filterable: true },
      { name: 'operation', type: 'string', filterable: true },
      { name: 'workstation', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'for_quantity', type: 'number' },
      { name: 'total_completed_qty', type: 'number' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'completed', 'cancelled'],
  },

  {
    slug: 'routings',
    doctype: 'Routing',
    tag: 'Routings',
    module: 'Manufacturing',
    minTier: 'business',
    listFields: ['name', 'routing_name', 'disabled', 'modified'],
    fields: [
      { name: 'routing_name', type: 'string', required: true, example: 'Widget Assembly Line' },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'bom-update-tools',
    doctype: 'BOM Update Tool',
    tag: 'BOM Update Tool',
    module: 'Manufacturing',
    minTier: 'business',
    readOnly: true,
    listFields: ['name', 'update_type', 'current_bom', 'new_bom', 'status', 'modified'],
    fields: [
      { name: 'update_type', type: 'string', example: 'Replace BOM', filterable: true },
      { name: 'current_bom', type: 'string', filterable: true },
      { name: 'new_bom', type: 'string' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: [],
  },

  {
    slug: 'downtime-entries',
    doctype: 'Downtime Entry',
    tag: 'Downtime Entries',
    module: 'Manufacturing',
    minTier: 'business',
    listFields: ['name', 'workstation', 'from_time', 'to_time', 'downtime', 'stop_reason', 'modified'],
    fields: [
      { name: 'workstation', type: 'string', required: true, filterable: true },
      { name: 'from_time', type: 'date', required: true, example: '2026-07-25' },
      { name: 'to_time', type: 'date', required: true, example: '2026-07-25' },
      { name: 'downtime', type: 'number' },
      { name: 'stop_reason', type: 'string', example: 'Material Shortage', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Quality Management
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'quality-inspection-templates',
    doctype: 'Quality Inspection Template',
    tag: 'Quality Inspection Templates',
    module: 'Stock',
    minTier: 'business',
    listFields: ['name', 'quality_inspection_template_name', 'modified'],
    fields: [
      { name: 'quality_inspection_template_name', type: 'string', required: true, example: 'Incoming Widget QC' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'quality-goals',
    doctype: 'Quality Goal',
    tag: 'Quality Goals',
    module: 'Quality Management',
    minTier: 'business',
    listFields: ['name', 'goal', 'frequency', 'unit', 'monitoring_frequency', 'modified'],
    fields: [
      { name: 'goal', type: 'string', required: true, example: 'Reduce defect rate below 0.5%' },
      { name: 'frequency', type: 'string', filterable: true },
      { name: 'unit', type: 'string' },
      { name: 'monitoring_frequency', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'quality-procedures',
    doctype: 'Quality Procedure',
    tag: 'Quality Procedures',
    module: 'Quality Management',
    minTier: 'business',
    listFields: ['name', 'quality_procedure_name', 'is_group', 'parent_quality_procedure', 'modified'],
    fields: [
      { name: 'quality_procedure_name', type: 'string', required: true, example: 'ISO 9001 audit prep' },
      { name: 'is_group', type: 'boolean', filterable: true },
      { name: 'parent_quality_procedure', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'quality-feedbacks',
    doctype: 'Quality Feedback',
    tag: 'Quality Feedbacks',
    module: 'Quality Management',
    minTier: 'business',
    listFields: ['name', 'template', 'document_type', 'document_name', 'modified'],
    fields: [
      { name: 'template', type: 'string', filterable: true },
      { name: 'document_type', type: 'string', example: 'Customer', filterable: true },
      { name: 'document_name', type: 'string' },
      { name: 'parameters', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'non-conformances',
    doctype: 'Non Conformance',
    tag: 'Non Conformances',
    module: 'Quality Management',
    minTier: 'business',
    listFields: ['name', 'subject', 'status', 'procedure', 'process_owner', 'modified'],
    fields: [
      { name: 'subject', type: 'string', required: true, example: 'Wrong SKU shipped' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'procedure', type: 'string', filterable: true },
      { name: 'process_owner', type: 'string' },
      { name: 'full_name', type: 'string' },
      { name: 'details', type: 'string' },
      { name: 'corrective_action', type: 'string' },
      { name: 'preventive_action', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Assets extended
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'asset-categories',
    doctype: 'Asset Category',
    tag: 'Asset Categories',
    module: 'Assets',
    minTier: 'business',
    listFields: ['name', 'asset_category_name', 'enable_cwip_accounting', 'modified'],
    fields: [
      { name: 'asset_category_name', type: 'string', required: true, example: 'Electronic Equipment' },
      { name: 'enable_cwip_accounting', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'asset-capitalizations',
    doctype: 'Asset Capitalization',
    tag: 'Asset Capitalizations',
    module: 'Assets',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'entry_type', 'target_item_code', 'posting_date', 'company', 'status', 'modified'],
    fields: [
      { name: 'entry_type', type: 'string', required: true, example: 'Capitalization', filterable: true },
      { name: 'target_item_code', type: 'string', filterable: true },
      { name: 'posting_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'asset-movements',
    doctype: 'Asset Movement',
    tag: 'Asset Movements',
    module: 'Assets',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'purpose', 'transaction_date', 'company', 'reference_doctype', 'reference_name', 'modified'],
    fields: [
      { name: 'purpose', type: 'string', required: true, example: 'Transfer', filterable: true },
      { name: 'transaction_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'reference_doctype', type: 'string' },
      { name: 'reference_name', type: 'string' },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'asset-repairs',
    doctype: 'Asset Repair',
    tag: 'Asset Repairs',
    module: 'Assets',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'asset', 'asset_name', 'repair_status', 'failure_date', 'completion_date', 'repair_cost', 'modified'],
    fields: [
      { name: 'asset', type: 'string', required: true, filterable: true },
      { name: 'repair_status', type: 'string', filterable: true },
      { name: 'failure_date', type: 'date', example: '2026-07-20' },
      { name: 'completion_date', type: 'date' },
      { name: 'repair_cost', type: 'number' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'completed', 'cancelled'],
  },

  {
    slug: 'asset-value-adjustments',
    doctype: 'Asset Value Adjustment',
    tag: 'Asset Value Adjustments',
    module: 'Assets',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'asset', 'date', 'current_asset_value', 'new_asset_value', 'company', 'modified'],
    fields: [
      { name: 'asset', type: 'string', required: true, filterable: true },
      { name: 'date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'current_asset_value', type: 'number' },
      { name: 'new_asset_value', type: 'number', required: true },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'submitted', 'cancelled'],
  },

  {
    slug: 'asset-depreciation-schedules',
    doctype: 'Asset Depreciation Schedule',
    tag: 'Asset Depreciation Schedules',
    module: 'Assets',
    minTier: 'business',
    readOnly: true,
    listFields: ['name', 'asset', 'finance_book', 'depreciation_method', 'status', 'company', 'modified'],
    fields: [
      { name: 'asset', type: 'string', filterable: true },
      { name: 'finance_book', type: 'string', filterable: true },
      { name: 'depreciation_method', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Subscription / Rental
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'subscription-plans',
    doctype: 'Subscription Plan',
    tag: 'Subscription Plans',
    module: 'Accounts',
    minTier: 'business',
    listFields: ['name', 'plan_name', 'item', 'price_determination', 'cost', 'currency', 'billing_interval', 'modified'],
    fields: [
      { name: 'plan_name', type: 'string', required: true, example: 'Pro Monthly' },
      { name: 'item', type: 'string', required: true, filterable: true },
      { name: 'price_determination', type: 'string', example: 'Fixed Rate', filterable: true },
      { name: 'cost', type: 'number', example: 29 },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'billing_interval', type: 'string', example: 'Month', filterable: true },
      { name: 'billing_interval_count', type: 'number', example: 1 },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Subcontracting
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'subcontracting-receipts',
    doctype: 'Subcontracting Receipt',
    tag: 'Subcontracting Receipts',
    module: 'Subcontracting',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'supplier', 'posting_date', 'status', 'total', 'modified'],
    fields: [
      { name: 'supplier', type: 'string', required: true, filterable: true },
      { name: 'posting_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'total', type: 'number' },
      { name: 'total_qty', type: 'number' },
      { name: 'set_warehouse', type: 'string' },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  {
    slug: 'subcontracting-inward-orders',
    doctype: 'Subcontracting Inward Order',
    tag: 'Subcontracting Inward Orders',
    module: 'Subcontracting',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'customer', 'transaction_date', 'status', 'modified'],
    fields: [
      { name: 'customer', type: 'string', required: true, filterable: true },
      { name: 'transaction_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'sales_order', type: 'string', filterable: true },
      { name: 'set_delivery_warehouse', type: 'string' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'company', type: 'string', required: true, filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Helpdesk
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'support-tickets',
    doctype: 'HD Ticket',
    tag: 'Support Tickets',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'subject', 'status', 'priority', 'ticket_type', 'contact', 'agent_group', 'via_customer_portal', 'modified'],
    fields: [
      { name: 'subject', type: 'string', required: true, example: 'Cannot log in' },
      { name: 'status', type: 'string', example: 'Open', filterable: true },
      { name: 'priority', type: 'string', example: 'Medium', filterable: true },
      { name: 'ticket_type', type: 'string', filterable: true },
      { name: 'contact', type: 'string', filterable: true },
      { name: 'agent_group', type: 'string', filterable: true },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'closed', 'resolved', 'reopened'],
  },

  {
    slug: 'support-articles',
    doctype: 'HD Article',
    tag: 'Support Articles',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'title', 'category', 'status', 'author', 'published_on', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'How to reset your password' },
      { name: 'category', type: 'string', filterable: true },
      { name: 'status', type: 'string', example: 'Draft', filterable: true },
      { name: 'author', type: 'string', filterable: true },
      { name: 'content', type: 'string' },
      { name: 'published_on', type: 'date' },
    ],
    events: ['created', 'updated', 'published', 'deleted'],
  },

  {
    slug: 'support-teams',
    doctype: 'HD Team',
    tag: 'Support Teams',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'team_name', 'ignore_restrictions', 'modified'],
    fields: [
      { name: 'team_name', type: 'string', required: true, example: 'Tier 1 Support' },
      { name: 'ignore_restrictions', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'service-contracts',
    doctype: 'HD Service Contract',
    tag: 'Service Contracts',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'service_contract_name', 'customer', 'start_date', 'end_date', 'status', 'modified'],
    fields: [
      { name: 'service_contract_name', type: 'string', required: true, example: 'Enterprise SLA — Acme' },
      { name: 'customer', type: 'string', filterable: true },
      { name: 'start_date', type: 'date', example: '2026-01-01' },
      { name: 'end_date', type: 'date', example: '2026-12-31' },
      { name: 'status', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'ticket-types',
    doctype: 'HD Ticket Type',
    tag: 'Ticket Types',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'description', 'modified'],
    fields: [
      { name: 'name', type: 'string', required: true, example: 'Bug' },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'ticket-priorities',
    doctype: 'HD Ticket Priority',
    tag: 'Ticket Priorities',
    module: 'Helpdesk',
    minTier: 'pro',
    listFields: ['name', 'description', 'modified'],
    fields: [
      { name: 'name', type: 'string', required: true, example: 'Urgent' },
      { name: 'description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRO TIER — Raven Chat
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'chat-channels',
    doctype: 'Raven Channel',
    tag: 'Chat Channels',
    module: 'Raven',
    minTier: 'pro',
    listFields: ['name', 'channel_name', 'type', 'is_direct_message', 'is_archived', 'is_thread', 'modified'],
    fields: [
      { name: 'channel_name', type: 'string', required: true, example: 'general' },
      { name: 'type', type: 'string', example: 'Public', filterable: true },
      { name: 'is_direct_message', type: 'boolean', filterable: true },
      { name: 'is_archived', type: 'boolean', filterable: true },
      { name: 'is_thread', type: 'boolean', filterable: true },
      { name: 'channel_description', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'chat-messages',
    doctype: 'Raven Message',
    tag: 'Chat Messages',
    module: 'Raven',
    minTier: 'pro',
    listFields: ['name', 'channel_id', 'owner', 'message_type', 'text', 'is_reply', 'creation', 'modified'],
    fields: [
      { name: 'channel_id', type: 'string', required: true, filterable: true },
      { name: 'message_type', type: 'string', example: 'Text', filterable: true },
      { name: 'text', type: 'string' },
      { name: 'is_reply', type: 'boolean', filterable: true },
      { name: 'linked_message', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Insights BI
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'insights-dashboards',
    doctype: 'Insights Dashboard',
    tag: 'Insights Dashboards',
    module: 'Insights',
    minTier: 'business',
    listFields: ['name', 'title', 'owner', 'is_public', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Sales Overview' },
      { name: 'is_public', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'insights-queries',
    doctype: 'Insights Query',
    tag: 'Insights Queries',
    module: 'Insights',
    minTier: 'business',
    listFields: ['name', 'title', 'data_source', 'is_native_query', 'is_stored', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Top customers Q3' },
      { name: 'data_source', type: 'string', filterable: true },
      { name: 'is_native_query', type: 'boolean', filterable: true },
      { name: 'is_stored', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'insights-charts',
    doctype: 'Insights Chart',
    tag: 'Insights Charts',
    module: 'Insights',
    minTier: 'business',
    listFields: ['name', 'title', 'chart_type', 'query', 'data_source', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Revenue by month' },
      { name: 'chart_type', type: 'string', example: 'Line', filterable: true },
      { name: 'query', type: 'string', filterable: true },
      { name: 'data_source', type: 'string', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  {
    slug: 'insights-tables',
    doctype: 'Insights Table',
    tag: 'Insights Tables',
    module: 'Insights',
    minTier: 'business',
    readOnly: true,
    listFields: ['name', 'label', 'table', 'data_source', 'is_query_based', 'hidden', 'modified'],
    fields: [
      { name: 'label', type: 'string', filterable: true },
      { name: 'table', type: 'string', filterable: true },
      { name: 'data_source', type: 'string', filterable: true },
      { name: 'is_query_based', type: 'boolean', filterable: true },
      { name: 'hidden', type: 'boolean', filterable: true },
    ],
    events: [],
  },

  {
    slug: 'insights-data-sources',
    doctype: 'Insights Data Source',
    tag: 'Insights Data Sources',
    module: 'Insights',
    minTier: 'business',
    listFields: ['name', 'title', 'database_type', 'host', 'status', 'is_site_db', 'modified'],
    fields: [
      { name: 'title', type: 'string', required: true, example: 'Primary Warehouse' },
      { name: 'database_type', type: 'string', example: 'MariaDB', filterable: true },
      { name: 'host', type: 'string' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'is_site_db', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Webshop
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'website-items',
    doctype: 'Website Item',
    tag: 'Website Items',
    module: 'Webshop',
    minTier: 'business',
    listFields: ['name', 'web_item_name', 'item_code', 'item_group', 'published', 'website_warehouse', 'modified'],
    fields: [
      { name: 'web_item_name', type: 'string', required: true, example: 'Widget A' },
      { name: 'item_code', type: 'string', required: true, filterable: true },
      { name: 'item_group', type: 'string', filterable: true },
      { name: 'published', type: 'boolean', filterable: true },
      { name: 'website_warehouse', type: 'string', filterable: true },
      { name: 'short_description', type: 'string' },
    ],
    events: ['created', 'updated', 'published', 'unpublished', 'deleted'],
  },

  {
    slug: 'product-bundles',
    doctype: 'Product Bundle',
    tag: 'Product Bundles',
    module: 'Selling',
    minTier: 'business',
    submittable: true,
    listFields: ['name', 'new_item_code', 'description', 'disabled', 'modified'],
    fields: [
      { name: 'new_item_code', type: 'string', required: true, filterable: true },
      { name: 'description', type: 'string' },
      { name: 'disabled', type: 'boolean', filterable: true },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled', 'deleted'],
  },

  {
    slug: 'webshop-slideshows',
    doctype: 'Webshop Slideshow',
    tag: 'Webshop Slideshows',
    module: 'Webshop',
    minTier: 'business',
    listFields: ['name', 'slideshow_name', 'header', 'modified'],
    fields: [
      { name: 'slideshow_name', type: 'string', required: true, example: 'Homepage Hero' },
      { name: 'header', type: 'string' },
    ],
    events: ['created', 'updated', 'deleted'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS TIER — Ecommerce Integrations
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'shopify-settings',
    doctype: 'Shopify Settings',
    tag: 'Shopify Settings',
    module: 'Ecommerce Integrations',
    minTier: 'business',
    requiredAddon: 'ecommerce-integrations',
    listFields: ['name', 'enable_shopify', 'shopify_url', 'shop_name', 'default_customer', 'sync_from', 'modified'],
    fields: [
      { name: 'enable_shopify', type: 'boolean', filterable: true },
      { name: 'shopify_url', type: 'string', example: 'my-store.myshopify.com' },
      { name: 'shop_name', type: 'string' },
      { name: 'default_customer', type: 'string' },
      { name: 'sync_from', type: 'date' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  {
    slug: 'amazon-sp-settings',
    doctype: 'Amazon SP Settings',
    tag: 'Amazon SP Settings',
    module: 'Ecommerce Integrations',
    minTier: 'business',
    requiredAddon: 'ecommerce-integrations',
    listFields: ['name', 'is_active', 'seller_id', 'market_place_id', 'enable_sync', 'modified'],
    fields: [
      { name: 'is_active', type: 'boolean', filterable: true },
      { name: 'seller_id', type: 'string' },
      { name: 'market_place_id', type: 'string' },
      { name: 'enable_sync', type: 'boolean', filterable: true },
      { name: 'after_date', type: 'date' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADD-ON — Ecommerce Integrations (Unicommerce + logs)
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'unicommerce-settings',
    doctype: 'Unicommerce Settings',
    tag: 'Unicommerce Settings',
    module: 'Ecommerce Integrations',
    minTier: 'pro',
    requiredAddon: 'ecommerce-integrations',
    listFields: ['name', 'enabled', 'company', 'tenant_url', 'default_customer', 'default_warehouse', 'modified'],
    fields: [
      { name: 'enabled', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', filterable: true },
      { name: 'tenant_url', type: 'string', example: 'https://acme.unicommerce.com' },
      { name: 'default_customer', type: 'string' },
      { name: 'default_warehouse', type: 'string' },
      { name: 'sync_from', type: 'date' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  {
    slug: 'ecommerce-integration-logs',
    doctype: 'Ecommerce Integration Log',
    tag: 'Ecommerce Integration Logs',
    module: 'Ecommerce Integrations',
    minTier: 'pro',
    requiredAddon: 'ecommerce-integrations',
    readOnly: true,
    listFields: ['name', 'integration', 'status', 'method', 'reference_doctype', 'reference_name', 'company', 'modified'],
    fields: [
      { name: 'integration', type: 'string', filterable: true },
      { name: 'status', type: 'string', filterable: true, example: 'Success' },
      { name: 'method', type: 'string', filterable: true },
      { name: 'reference_doctype', type: 'string', filterable: true },
      { name: 'reference_name', type: 'string' },
      { name: 'company', type: 'string', filterable: true },
    ],
    events: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADD-ON — DATEV Export
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'datev-settings',
    doctype: 'DATEV Settings',
    tag: 'DATEV Settings',
    module: 'Erpnext Datev',
    minTier: 'pro',
    requiredAddon: 'erpnext-datev',
    listFields: ['name', 'enabled', 'company', 'client_number', 'consultant_number', 'account_length', 'modified'],
    fields: [
      { name: 'enabled', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'client_number', type: 'string', example: '12345' },
      { name: 'consultant_number', type: 'string', example: '67890' },
      { name: 'account_length', type: 'number', example: 4 },
      { name: 'temporary_against_account_number', type: 'string' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  {
    slug: 'datev-exports',
    doctype: 'DATEV Export',
    tag: 'DATEV Exports',
    module: 'Erpnext Datev',
    minTier: 'pro',
    requiredAddon: 'erpnext-datev',
    submittable: true,
    listFields: ['name', 'company', 'from_date', 'to_date', 'status', 'export_type', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'from_date', type: 'date', required: true, example: '2026-07-01' },
      { name: 'to_date', type: 'date', required: true, example: '2026-07-31' },
      { name: 'export_type', type: 'string', example: 'Bookings', filterable: true },
      { name: 'status', type: 'string', filterable: true },
      { name: 'include_pdfs', type: 'boolean' },
    ],
    events: ['created', 'updated', 'submitted', 'cancelled'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADD-ON — Digital Signer
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'digital-signer-settings',
    doctype: 'Digital Signer Settings',
    tag: 'Digital Signer Settings',
    module: 'Digital Signer',
    minTier: 'pro',
    requiredAddon: 'digital-signer',
    listFields: ['name', 'enabled', 'company', 'provider', 'default_signer', 'modified'],
    fields: [
      { name: 'enabled', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'provider', type: 'string', example: 'DocuSign', filterable: true },
      { name: 'default_signer', type: 'string' },
      { name: 'callback_url', type: 'string' },
      { name: 'signature_reason', type: 'string', example: 'Contract acceptance' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  {
    slug: 'signed-documents',
    doctype: 'Signed Document',
    tag: 'Signed Documents',
    module: 'Digital Signer',
    minTier: 'pro',
    requiredAddon: 'digital-signer',
    listFields: ['name', 'reference_doctype', 'reference_name', 'signer', 'status', 'signed_on', 'company', 'modified'],
    fields: [
      { name: 'reference_doctype', type: 'string', required: true, filterable: true },
      { name: 'reference_name', type: 'string', required: true },
      { name: 'signer', type: 'string', required: true, filterable: true },
      { name: 'status', type: 'string', filterable: true, example: 'Pending' },
      { name: 'signed_on', type: 'date' },
      { name: 'company', type: 'string', filterable: true },
      { name: 'signed_file', type: 'string' },
    ],
    events: ['created', 'signed', 'revoked'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADD-ON — Payments Processor
  // ═══════════════════════════════════════════════════════════════════

  {
    slug: 'payments-processor-settings',
    doctype: 'Payments Processor Settings',
    tag: 'Payments Processor Settings',
    module: 'Payments Processor',
    minTier: 'pro',
    requiredAddon: 'payments-processor',
    listFields: ['name', 'enabled', 'company', 'processor', 'default_bank_account', 'default_mode_of_payment', 'modified'],
    fields: [
      { name: 'enabled', type: 'boolean', filterable: true },
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'processor', type: 'string', example: 'Stripe', filterable: true },
      { name: 'default_bank_account', type: 'string' },
      { name: 'default_mode_of_payment', type: 'string' },
      { name: 'auto_reconcile', type: 'boolean' },
    ],
    events: ['created', 'updated', 'enabled', 'disabled'],
  },

  {
    slug: 'payment-batches',
    doctype: 'Payment Batch',
    tag: 'Payment Batches',
    module: 'Payments Processor',
    minTier: 'pro',
    requiredAddon: 'payments-processor',
    submittable: true,
    listFields: ['name', 'company', 'status', 'posting_date', 'total_amount', 'currency', 'bank_account', 'modified'],
    fields: [
      { name: 'company', type: 'string', required: true, filterable: true },
      { name: 'bank_account', type: 'string', filterable: true },
      { name: 'posting_date', type: 'date', required: true, example: '2026-07-25' },
      { name: 'status', type: 'string', filterable: true },
      { name: 'total_amount', type: 'number' },
      { name: 'currency', type: 'string', example: 'USD' },
      { name: 'processor', type: 'string', filterable: true },
    ],
    events: ['created', 'submitted', 'processed', 'failed', 'cancelled'],
  },
];

export function getResourceBySlug(slug: string): ResourceDefinition | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}

export function getResourcesByTier(tier: 'free' | 'pro' | 'business'): ResourceDefinition[] {
  const rank = { free: 0, pro: 1, business: 2 };
  return RESOURCES.filter((r) => rank[r.minTier] <= rank[tier]);
}
