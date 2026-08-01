# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Seed baseline ERPNext / HRMS master data.

zivvy_brand's tenant provisioner creates Company + CoA + warehouses directly
via ``frappe.get_doc({"doctype": "Company", ...}).insert()`` and never runs
ERPNext's setup wizard (or HRMS ``make_fixtures``), so on sites first
provisioned that way the fixture DocTypes end up empty. This module is the
idempotent backfill: safe to run on every migrate and once *before* the first
tenant Company is created.

Core selling/stock masters are delegated to ERPNext's
:func:`erpnext.setup.setup_wizard.operations.install_fixtures.install`.
Salutation, Gender, Price List, Fiscal Year, Payment Term, and Bank are
seeded here. When HRMS is installed we also call ``hrms.setup.make_fixtures``
(Leave Type, Employment Type, Expense Claim Type, …).
"""

from __future__ import annotations

from datetime import date
from typing import Iterable

import frappe


_DEFAULT_COUNTRY = "United States"
_DEFAULT_CURRENCY = "USD"

# Canonical frappe defaults — kept here so we don't depend on frappe's
# private install-time bootstrap having ever run on this site.
_DEFAULT_SALUTATIONS: tuple[str, ...] = (
	"Mr",
	"Ms",
	"Mrs",
	"Miss",
	"Madam",
	"Master",
	"Dr",
	"Prof",
)

_DEFAULT_GENDERS: tuple[str, ...] = (
	"Male",
	"Female",
	"Other",
	"Transgender",
	"Genderqueer",
	"Non-Conforming",
	"Prefer not to say",
	"Third Gender",
)

# Common bank names so Bank Account → Bank link fields aren't disabled.
# Per-company Bank Account rows are still created by the tenant.
_DEFAULT_BANKS: tuple[str, ...] = (
	"Deutsche Bank",
	"Commerzbank",
	"Sparkasse",
	"DZ Bank",
	"N26",
	"Chase",
	"Bank of America",
	"Wells Fargo",
	"HSBC",
	"Barclays",
	"Revolut",
	"Wise",
)

_DEFAULT_EMPLOYEE_GRADES: tuple[str, ...] = (
	"Junior",
	"Mid",
	"Senior",
	"Lead",
	"Manager",
	"Director",
)

# (name, credit_days) — invoice_portion always 100.
_DEFAULT_PAYMENT_TERMS: tuple[tuple[str, int], ...] = (
	("Due on Receipt", 0),
	("Net 15", 15),
	("Net 30", 30),
	("Net 45", 45),
	("Net 60", 60),
)


def _log(title: str) -> None:
	try:
		frappe.log_error(frappe.get_traceback(), title)
	except Exception:
		pass


def _has_doctype(doctype: str) -> bool:
	try:
		return bool(frappe.db.exists("DocType", doctype))
	except Exception:
		return False


def _count(doctype: str) -> int:
	try:
		return int(frappe.db.count(doctype) or 0)
	except Exception:
		return 0


def _seed_simple_names(doctype: str, values: Iterable[str], name_field: str = "name") -> None:
	"""Insert ``values`` into ``doctype`` when the row is missing.

	Used for Salutation / Gender where the DocType is essentially
	``{name: <label>}``.
	"""
	if not _has_doctype(doctype):
		return
	for value in values:
		if not value:
			continue
		try:
			if frappe.db.exists(doctype, value):
				continue
			doc = frappe.new_doc(doctype)
			if name_field == "name":
				doc.name = value
			else:
				doc.set(name_field, value)
			doc.flags.ignore_permissions = True
			doc.flags.ignore_mandatory = True
			doc.insert(ignore_permissions=True)
		except Exception:
			_log(f"Zivvy masters seed: {doctype}={value!r}")


def _seed_salutations() -> None:
	_seed_simple_names("Salutation", _DEFAULT_SALUTATIONS, name_field="salutation")


def _seed_genders() -> None:
	_seed_simple_names("Gender", _DEFAULT_GENDERS, name_field="gender")


def _rollback_savepoint(sp: str) -> None:
	"""Roll back to ``sp``; fall back to a full rollback if the SP is gone."""
	try:
		frappe.db.rollback(save_point=sp)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass


def _run_with_savepoint(label: str, fn) -> None:
	"""Run ``fn`` inside a SAVEPOINT so Postgres IntegrityError can't poison later steps.

	On Postgres, an unhandled unique-violation aborts the whole transaction;
	subsequent statements no-op until ROLLBACK. ERPNext's fixture installer
	has hit this on ``tabSupplier Scorecard Variable_pkey``, which then
	silently skipped ``_seed_fiscal_year`` in the same call.
	"""
	sp = f"zivvy_ms_{label}"[:63]
	try:
		frappe.db.savepoint(sp)
	except Exception:
		# SAVEPOINT unsupported / connection oddity — best-effort bare call.
		try:
			fn()
		except Exception:
			_log(f"Zivvy masters seed step: {label}")
		return
	try:
		fn()
	except Exception:
		_rollback_savepoint(sp)
		_log(f"Zivvy masters seed step: {label}")


def _run_erpnext_install_fixtures(country: str) -> None:
	"""Call ERPNext's canonical fixture installer.

	Idempotent: internally ``make_records`` skips DocTypes that already exist,
	and ``add_uom_data`` guards every UOM / UOM Category / UOM Conversion
	Factor with ``frappe.db.exists``.

	Caller wraps this in a SAVEPOINT (:func:`_run_with_savepoint`) so a
	Postgres IntegrityError (e.g. ``tabSupplier Scorecard Variable_pkey``)
	cannot abort the surrounding transaction and skip Fiscal Year seeding.
	"""
	from erpnext.setup.setup_wizard.operations.install_fixtures import install as install_erpnext_fixtures

	install_erpnext_fixtures(country=country)


def _seed_price_lists(currency: str = _DEFAULT_CURRENCY) -> None:
	"""Standard Selling / Standard Buying Price Lists.

	ERPNext creates these in ``install_defaults`` (per-company setup wizard
	path). zivvy_brand skips that path so we seed the two standard lists here
	with a safe default currency.
	"""
	if not _has_doctype("Price List"):
		return

	specs = (
		{
			"price_list_name": "Standard Selling",
			"enabled": 1,
			"buying": 0,
			"selling": 1,
			"currency": currency,
		},
		{
			"price_list_name": "Standard Buying",
			"enabled": 1,
			"buying": 1,
			"selling": 0,
			"currency": currency,
		},
	)
	for spec in specs:
		try:
			if frappe.db.exists("Price List", spec["price_list_name"]):
				continue
			doc = frappe.new_doc("Price List")
			doc.update(spec)
			doc.flags.ignore_permissions = True
			doc.flags.ignore_mandatory = True
			doc.insert(ignore_permissions=True)
		except Exception:
			_log(f"Zivvy masters seed: Price List={spec['price_list_name']!r}")

	_seed_selling_settings_defaults()


def _seed_selling_settings_defaults() -> None:
	"""Ensure Quotation / SO forms get selling_price_list via set_missing_values.

	Without this, API inserts fail MandatoryError on selling_price_list /
	price_list_currency / plc_conversion_rate for freshly provisioned tenants.
	"""
	try:
		if not _has_doctype("Selling Settings"):
			return
		if not frappe.db.exists("Price List", "Standard Selling"):
			return
		current = frappe.db.get_single_value("Selling Settings", "selling_price_list")
		if current:
			return
		frappe.db.set_single_value("Selling Settings", "selling_price_list", "Standard Selling")
	except Exception:
		_log("Zivvy masters seed: Selling Settings.selling_price_list")


def _seed_hrms_fixtures() -> None:
	"""Run HRMS ``make_fixtures`` when the app is installed.

	Seeds Leave Type, Employment Type, Expense Claim Type, Job Applicant
	Source, Offer Term, Vehicle Service Item. Idempotent via
	``frappe.desk.page.setup_wizard.setup_wizard.make_records``.
	"""
	if "hrms" not in frappe.get_installed_apps():
		return
	try:
		from hrms.setup import make_fixtures
	except Exception:
		_log("Zivvy masters seed: import hrms.setup.make_fixtures")
		return
	make_fixtures()


def _seed_banks() -> None:
	"""Seed common Bank masters so banking forms can pick a bank."""
	if not _has_doctype("Bank"):
		return
	for bank_name in _DEFAULT_BANKS:
		try:
			if frappe.db.exists("Bank", bank_name):
				continue
			doc = frappe.new_doc("Bank")
			doc.bank_name = bank_name
			doc.flags.ignore_permissions = True
			doc.flags.ignore_mandatory = True
			doc.insert(ignore_permissions=True)
		except Exception:
			_log(f"Zivvy masters seed: Bank={bank_name!r}")


def _seed_payment_terms() -> None:
	"""Seed standard Net-N / Due-on-Receipt Payment Terms."""
	if not _has_doctype("Payment Term"):
		return
	for name, days in _DEFAULT_PAYMENT_TERMS:
		try:
			if frappe.db.exists("Payment Term", name):
				continue
			doc = frappe.new_doc("Payment Term")
			doc.payment_term_name = name
			doc.invoice_portion = 100
			doc.due_date_based_on = "Day(s) after invoice date"
			doc.credit_days = days
			doc.description = name
			doc.flags.ignore_permissions = True
			doc.flags.ignore_mandatory = True
			doc.insert(ignore_permissions=True)
		except Exception:
			_log(f"Zivvy masters seed: Payment Term={name!r}")


def _seed_employee_grades() -> None:
	"""Seed simple Employee Grade labels used on Employee forms."""
	if not _has_doctype("Employee Grade"):
		return
	_seed_simple_names("Employee Grade", _DEFAULT_EMPLOYEE_GRADES)


def _seed_fiscal_year() -> None:
	"""Seed the prior / current / next calendar-year Fiscal Years.

	ERPNext's :func:`get_fiscal_year` (called from ``party.get_dashboard_info``
	via ``Customer.onload`` / ``Supplier.onload``) raises ``FiscalYearError``
	→ HTTP 417 when no non-disabled Fiscal Year covers ``today``. Zivvy's
	tenant provisioner skips the ERPNext setup wizard, so freshly-provisioned
	sites have zero Fiscal Year rows and every Customer/Supplier form 417s.

	We seed three consecutive years so a month-boundary roll doesn't
	re-break the site the moment ``today`` crosses Jan 1.

	Idempotent: existing years (by name or overlapping range) are skipped.
	"""
	if not _has_doctype("Fiscal Year"):
		return

	current_year = date.today().year
	years = (current_year - 1, current_year, current_year + 1)

	for year in years:
		year_name = str(year)
		try:
			if frappe.db.exists("Fiscal Year", year_name):
				# Ensure it's not disabled (an earlier seed may have flipped it).
				try:
					if int(frappe.db.get_value("Fiscal Year", year_name, "disabled") or 0):
						frappe.db.set_value(
							"Fiscal Year", year_name, "disabled", 0, update_modified=False
						)
				except Exception:
					pass
				continue

			doc = frappe.new_doc("Fiscal Year")
			doc.year = year_name
			doc.year_start_date = date(year, 1, 1)
			doc.year_end_date = date(year, 12, 31)
			doc.disabled = 0
			doc.flags.ignore_permissions = True
			doc.flags.ignore_mandatory = True
			doc.insert(ignore_permissions=True)
		except Exception:
			_log(f"Zivvy masters seed: Fiscal Year={year_name!r}")


def _fixtures_already_present() -> bool:
	"""Quick short-circuit when every fixture bucket already has rows.

	Every individual seed helper is itself idempotent; this check just avoids
	the noisy log-error path and repeated ``make_records`` sweeps on
	well-provisioned sites.
	"""
	required = (
		"Salutation",
		"Gender",
		"UOM",
		"Item Group",
		"Customer Group",
		"Supplier Group",
		"Territory",
		"Mode of Payment",
		"Price List",
		"Fiscal Year",
	)
	for doctype in required:
		if not _has_doctype(doctype):
			# DocType missing (framework/erpnext not installed on this site)
			# — bail out; nothing to seed and nothing to short-circuit.
			return True
		if _count(doctype) == 0:
			return False
	# Even if a Fiscal Year row exists, it must actually cover today —
	# otherwise Customer.onload will still 417.
	try:
		current_year = date.today().year
		covering = frappe.db.count(
			"Fiscal Year",
			{
				"disabled": 0,
				"year_start_date": ("<=", date(current_year, 12, 31)),
				"year_end_date": (">=", date(current_year, 1, 1)),
			},
		)
		if not covering:
			return False
	except Exception:
		# On any lookup failure, err toward re-seeding.
		return False
	return True


def seed_erpnext_masters(country: str = _DEFAULT_COUNTRY) -> None:
	"""Idempotently seed baseline ERPNext / Frappe / HRMS masters.

	Safe to call from ``after_install``, ``after_migrate``, and from tenant
	provisioning *before* the first ``Company`` document is inserted (so that
	default Salutation/Gender/UOM references resolve).

	Core selling/stock fixtures short-circuit when already present, but HR /
	Bank / Payment Term polish **always** runs (each helper is idempotent).
	That matters on sites that got core masters first and then gained HRMS.

	Never raises: individual failures are logged via ``frappe.log_error``.
	"""
	need_core = True
	try:
		need_core = not _fixtures_already_present()
	except Exception:
		# If the pre-check itself fails, continue — the per-DocType helpers
		# guard themselves.
		need_core = True

	if need_core:
		core_steps = (
			("salutations", _seed_salutations),
			("genders", _seed_genders),
			("erpnext_fixtures", lambda: _run_erpnext_install_fixtures(country)),
			("price_lists", _seed_price_lists),
			("fiscal_year", _seed_fiscal_year),
		)
		for label, step in core_steps:
			# Nested SAVEPOINT: fixtures helper already has its own; outer wrap
			# still protects steps from each other if one raises outside its
			# internal handler.
			_run_with_savepoint(label, step)

	# Always ensure HR / Bank / payment polish — previously skipped forever
	# once Item Group / UOM / etc. were present.
	polish_steps = (
		("hrms_fixtures", _seed_hrms_fixtures),
		("banks", _seed_banks),
		("payment_terms", _seed_payment_terms),
		("employee_grades", _seed_employee_grades),
		("selling_settings", _seed_selling_settings_defaults),
	)
	for label, step in polish_steps:
		_run_with_savepoint(label, step)

	try:
		frappe.db.commit()
	except Exception:
		pass
