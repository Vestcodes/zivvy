# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Create hot-path Postgres indexes for tenant- and company-scoped workloads.

This patch materializes the index design captured in the tenancy/perf review:
a mix of ``(zivvy_tenant, creation DESC)`` / ``(zivvy_tenant, modified DESC)``
baselines on shared masters and ``(company, ...)`` composites (some partial)
on company-scoped transactional tables.

Notes
-----
* Postgres only. On any other backend the patch is a no-op.
* Uses ``CREATE INDEX CONCURRENTLY`` so it cannot run inside a transaction —
  we commit any open work before entering the DDL loop.
* Each DDL is wrapped in try/except: one bad table (missing DocType, wrong
  column name for a customer install, permission glitch) MUST NOT abort the
  rest of the batch. Failures are logged via ``frappe.log_error`` and the
  loop continues.
* After each create we verify presence in ``pg_indexes`` and roll the result
  into a summary dict that is logged and returned.
"""

from __future__ import annotations

import frappe


# ---------------------------------------------------------------------------
# Index design — source of truth lives in the perf review doc; keep in sync.
# ---------------------------------------------------------------------------
# Each spec:
#   name:    Postgres index name (unique across the database).
#   table:   Physical relation name (e.g. "tabSales Invoice").
#   columns: Ordered list of column expressions. A trailing " DESC" (or
#            " ASC") on a column is preserved as the sort direction; the
#            bare column name is double-quoted.
#   where:   Optional partial-index predicate (raw SQL fragment, no WHERE).
INDEX_SPECS: list[dict] = [
	# ---- Tenant baselines (shared masters, filtered by zivvy_tenant) --------
	{
		"name": "idx_customer_tenant_creation",
		"table": "tabCustomer",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_customer_tenant_modified",
		"table": "tabCustomer",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_lead_tenant_creation",
		"table": "tabLead",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_lead_tenant_modified",
		"table": "tabLead",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_opportunity_tenant_creation",
		"table": "tabOpportunity",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_opportunity_tenant_modified",
		"table": "tabOpportunity",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_contact_tenant_creation",
		"table": "tabContact",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_contact_tenant_modified",
		"table": "tabContact",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_address_tenant_creation",
		"table": "tabAddress",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_address_tenant_modified",
		"table": "tabAddress",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_supplier_tenant_creation",
		"table": "tabSupplier",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_supplier_tenant_modified",
		"table": "tabSupplier",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_item_tenant_creation",
		"table": "tabItem",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_item_tenant_modified",
		"table": "tabItem",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_item_price_tenant_creation",
		"table": "tabItem Price",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_item_price_tenant_modified",
		"table": "tabItem Price",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_item_group_tenant_creation",
		"table": "tabItem Group",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_item_group_tenant_modified",
		"table": "tabItem Group",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	{
		"name": "idx_blog_post_tenant_creation",
		"table": "tabBlog Post",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	{
		"name": "idx_blog_post_tenant_modified",
		"table": "tabBlog Post",
		"columns": ["zivvy_tenant", "modified DESC"],
	},
	# ---- Zivvy Role Template ------------------------------------------------
	{
		"name": "idx_role_template_tenant_creation",
		"table": "tabZivvy Role Template",
		"columns": ["zivvy_tenant", "creation DESC"],
	},
	# ---- Sales Order --------------------------------------------------------
	{
		"name": "idx_sales_order_company_creation",
		"table": "tabSales Order",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_sales_order_co_docstatus_creation",
		"table": "tabSales Order",
		"columns": ["company", "docstatus", "creation DESC"],
		"where": "docstatus < 2",
	},
	# ---- Sales Invoice ------------------------------------------------------
	{
		"name": "idx_sales_invoice_company_creation",
		"table": "tabSales Invoice",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_si_co_docstatus_posting",
		"table": "tabSales Invoice",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	{
		"name": "idx_si_co_outstanding_due",
		"table": "tabSales Invoice",
		"columns": ["company", "due_date", "outstanding_amount"],
		"where": "docstatus = 1 AND outstanding_amount > 0",
	},
	{
		"name": "idx_si_co_modified_submitted",
		"table": "tabSales Invoice",
		"columns": ["company", "modified DESC"],
		"where": "docstatus = 1",
	},
	# ---- Purchase Order -----------------------------------------------------
	{
		"name": "idx_purchase_order_company_creation",
		"table": "tabPurchase Order",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_po_co_docstatus_creation",
		"table": "tabPurchase Order",
		"columns": ["company", "docstatus", "creation DESC"],
		"where": "docstatus < 2",
	},
	{
		"name": "idx_po_co_schedule_date",
		"table": "tabPurchase Order",
		"columns": ["company", "schedule_date"],
		"where": "docstatus = 1",
	},
	# ---- Purchase Invoice ---------------------------------------------------
	{
		"name": "idx_purchase_invoice_company_creation",
		"table": "tabPurchase Invoice",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_pi_co_docstatus_posting",
		"table": "tabPurchase Invoice",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	# ---- Delivery Note ------------------------------------------------------
	{
		"name": "idx_delivery_note_company_creation",
		"table": "tabDelivery Note",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_dn_co_docstatus_posting",
		"table": "tabDelivery Note",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	# ---- Purchase Receipt ---------------------------------------------------
	{
		"name": "idx_purchase_receipt_company_creation",
		"table": "tabPurchase Receipt",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_pr_co_docstatus_posting",
		"table": "tabPurchase Receipt",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	# ---- Stock Entry --------------------------------------------------------
	{
		"name": "idx_stock_entry_company_creation",
		"table": "tabStock Entry",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_se_co_docstatus_posting",
		"table": "tabStock Entry",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	# ---- GL Entry (large, high-value) --------------------------------------
	{
		"name": "idx_gl_entry_company_creation",
		"table": "tabGL Entry",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_gl_entry_company_posting",
		"table": "tabGL Entry",
		"columns": ["company", "posting_date DESC"],
	},
	{
		"name": "idx_gl_entry_co_account_posting",
		"table": "tabGL Entry",
		"columns": ["company", "account", "posting_date DESC"],
	},
	# ---- Stock Ledger Entry -------------------------------------------------
	{
		"name": "idx_sle_company_creation",
		"table": "tabStock Ledger Entry",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_sle_company_posting",
		"table": "tabStock Ledger Entry",
		"columns": ["company", "posting_date DESC"],
	},
	{
		"name": "idx_sle_co_item_wh_posting",
		"table": "tabStock Ledger Entry",
		"columns": ["company", "item_code", "warehouse", "posting_date DESC"],
	},
	# ---- Journal Entry ------------------------------------------------------
	{
		"name": "idx_journal_entry_company_creation",
		"table": "tabJournal Entry",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_je_co_docstatus_posting",
		"table": "tabJournal Entry",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	# ---- Payment Entry ------------------------------------------------------
	{
		"name": "idx_payment_entry_company_creation",
		"table": "tabPayment Entry",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_pe_co_docstatus_posting",
		"table": "tabPayment Entry",
		"columns": ["company", "docstatus", "posting_date DESC"],
		"where": "docstatus < 2",
	},
	{
		"name": "idx_pe_co_party_type_party",
		"table": "tabPayment Entry",
		"columns": ["company", "party_type", "party"],
	},
	# ---- Employee -----------------------------------------------------------
	{
		"name": "idx_employee_company_creation",
		"table": "tabEmployee",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_employee_company_status_active",
		"table": "tabEmployee",
		"columns": ["company", "status"],
		"where": "status = 'Active'",
	},
	# ---- Item Reorder (child) — stock alert KPI ----------------------------
	{
		"name": "idx_item_reorder_level_parent",
		"table": "tabItem Reorder",
		"columns": ["warehouse_reorder_level", "parent"],
		"where": "warehouse_reorder_level > 0",
	},
	# ---- Warehouse ----------------------------------------------------------
	{
		"name": "idx_warehouse_company_creation",
		"table": "tabWarehouse",
		"columns": ["company", "creation DESC"],
	},
	# ---- Account (Chart of Accounts) ----------------------------------------
	{
		"name": "idx_account_company_creation",
		"table": "tabAccount",
		"columns": ["company", "creation DESC"],
	},
	{
		"name": "idx_account_company_root_type",
		"table": "tabAccount",
		"columns": ["company", "root_type"],
	},
	# ---- Cost Center --------------------------------------------------------
	{
		"name": "idx_cost_center_company_creation",
		"table": "tabCost Center",
		"columns": ["company", "creation DESC"],
	},
	# ---- Department ---------------------------------------------------------
	{
		"name": "idx_department_company_creation",
		"table": "tabDepartment",
		"columns": ["company", "creation DESC"],
	},
	# ---- Sales Taxes and Charges Template -----------------------------------
	{
		"name": "idx_stct_company_creation",
		"table": "tabSales Taxes and Charges Template",
		"columns": ["company", "creation DESC"],
	},
	# ---- Purchase Taxes and Charges Template --------------------------------
	{
		"name": "idx_ptct_company_creation",
		"table": "tabPurchase Taxes and Charges Template",
		"columns": ["company", "creation DESC"],
	},
	# ---- Item Tax Template --------------------------------------------------
	{
		"name": "idx_item_tax_template_company_creation",
		"table": "tabItem Tax Template",
		"columns": ["company", "creation DESC"],
	},
	# ---- Bank Account -------------------------------------------------------
	{
		"name": "idx_bank_account_company_creation",
		"table": "tabBank Account",
		"columns": ["company", "creation DESC"],
	},
	# ---- Asset --------------------------------------------------------------
	{
		"name": "idx_asset_company_creation",
		"table": "tabAsset",
		"columns": ["company", "creation DESC"],
	},
	# ---- Holiday List -------------------------------------------------------
	{
		"name": "idx_holiday_list_company_creation",
		"table": "tabHoliday List",
		"columns": ["company", "creation DESC"],
	},
	# ---- Expense Claim ------------------------------------------------------
	{
		"name": "idx_expense_claim_company_creation",
		"table": "tabExpense Claim",
		"columns": ["company", "creation DESC"],
	},
]


# ---------------------------------------------------------------------------
# Column-expression rendering
# ---------------------------------------------------------------------------
_DIRECTIONS = {"ASC", "DESC"}


def _render_column(expr: str) -> str:
	"""Quote a column name, preserving an optional trailing ASC/DESC.

	>>> _render_column("creation DESC")
	'"creation" DESC'
	>>> _render_column("zivvy_tenant")
	'"zivvy_tenant"'
	"""
	parts = expr.strip().split()
	if len(parts) == 2 and parts[1].upper() in _DIRECTIONS:
		return f'"{parts[0]}" {parts[1].upper()}'
	if len(parts) == 1:
		return f'"{parts[0]}"'
	# Anything more exotic (function calls, casts) is not part of the design;
	# refuse rather than emit ambiguous SQL.
	raise ValueError(f"Unsupported column expression: {expr!r}")


def _build_ddl(spec: dict) -> str:
	cols = ", ".join(_render_column(c) for c in spec["columns"])
	ddl = (
		f'CREATE INDEX CONCURRENTLY IF NOT EXISTS "{spec["name"]}" '
		f'ON "{spec["table"]}" ({cols})'
	)
	where = spec.get("where")
	if where:
		ddl += f" WHERE {where}"
	return ddl


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------
def _index_exists(name: str) -> bool:
	row = frappe.db.sql(
		"SELECT indexname FROM pg_indexes WHERE indexname = %s",
		(name,),
	)
	return bool(row)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def execute() -> dict:
	"""Create the hot-path indexes; return a summary dict.

	Summary shape::

	    {
	        "backend": "postgres" | "skipped",
	        "total": int,
	        "created": [name, ...],       # newly created OR already present
	        "failed":  [{"name": ..., "error": ...}, ...],
	        "missing": [name, ...],       # verification did not find them
	    }
	"""
	summary = {
		"backend": frappe.db.db_type,
		"total": len(INDEX_SPECS),
		"created": [],
		"failed": [],
		"missing": [],
	}

	if frappe.db.db_type != "postgres":
		summary["backend"] = "skipped"
		frappe.logger().info(
			"add_hotpath_indexes: db_type=%r; skipping (Postgres-only patch).",
			frappe.db.db_type,
		)
		return summary

	# CREATE INDEX CONCURRENTLY cannot run inside a transaction block, and
	# Frappe opens its Postgres connection with autocommit=False. Flush any
	# pending work, then flip the underlying psycopg2 connection to autocommit
	# for the duration of the DDL loop so each CONCURRENTLY statement runs
	# as its own top-level command. Restore autocommit afterward.
	frappe.db.commit()

	conn = frappe.db._conn  # psycopg2 connection
	prev_autocommit = conn.autocommit
	conn.autocommit = True
	try:
		for spec in INDEX_SPECS:
			name = spec["name"]
			try:
				ddl = _build_ddl(spec)
				frappe.db.sql(ddl)
			except Exception as exc:
				frappe.log_error(
					title=f"add_hotpath_indexes: failed to create {name}",
					message=f"table={spec.get('table')!r}\ncolumns={spec.get('columns')!r}\n"
					f"where={spec.get('where')!r}\nerror={exc!r}",
				)
				summary["failed"].append({"name": name, "error": repr(exc)})
				continue

			# Verify — an unlogged-but-swallowed failure would still show up as
			# missing here (e.g. INVALID index left behind by a prior aborted run).
			try:
				if _index_exists(name):
					summary["created"].append(name)
				else:
					summary["missing"].append(name)
					frappe.log_error(
						title=f"add_hotpath_indexes: verification missing {name}",
						message=(
							f"pg_indexes did not report {name!r} after CREATE INDEX "
							f"CONCURRENTLY IF NOT EXISTS on {spec.get('table')!r}."
						),
					)
			except Exception as exc:
				frappe.log_error(
					title=f"add_hotpath_indexes: verification error for {name}",
					message=repr(exc),
				)
				summary["missing"].append(name)
	finally:
		conn.autocommit = prev_autocommit

	frappe.logger().info(
		"add_hotpath_indexes: total=%d created=%d failed=%d missing=%d",
		summary["total"],
		len(summary["created"]),
		len(summary["failed"]),
		len(summary["missing"]),
	)
	return summary
