# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Idempotent Business-tier sample data for the Arcade demo tenant.

Scoped exclusively to ``demo@zivvy.xyz`` / tenant ``demo-arcade`` /
company ``Demo Arcade``. Safe to re-run: stable codes / markers look up
existing rows; legacy ``DA *`` placeholder names are renamed in place.

Story: US mid-size industrial IoT / light manufacturing ops company
(sensors, assembly kits, enclosures) selling to logistics, plants,
clinics, and schools — Indian / EU / US contact mix, US datacenter.

Run:
  bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_arcade_data.seed_demo_arcade_data
"""

from __future__ import annotations

from datetime import date
from typing import Any

import frappe
from frappe.utils import add_days, today

from zivvy_brand.tenancy import TENANT_FIELD

DEMO_EMAIL = "demo@zivvy.xyz"
DEMO_TENANT_SLUG = "demo-arcade"
DEMO_COMPANY = "Demo Arcade"
SEED_TAG = "zivvy-demo-arcade-seed-v2"

# ---------------------------------------------------------------------------
# Catalog — coherent industrial IoT / light manufacturing story
# legacy_* = previous seed names (v1) for in-place rename on re-run
# ---------------------------------------------------------------------------

CUSTOMERS = (
	{
		"name": "Harbor Bay Logistics",
		"legacy": ("DA Horizon Retail",),
		"group": "Commercial",
		"type": "Company",
		"email": "procurement@harborbaylogistics.com",
		"phone": "+1 415 555 0142",
		"contact": "Natalie Ruiz",
		"address_line1": "480 Embarcadero Way",
		"city": "Oakland",
		"state": "CA",
		"pincode": "94607",
		"country": "United States",
	},
	{
		"name": "Northline Manufacturing",
		"legacy": ("DA Northwind Labs",),
		"group": "Commercial",
		"type": "Company",
		"email": "buyers@northlinemfg.com",
		"phone": "+1 312 555 0198",
		"contact": "Dev Patel",
		"address_line1": "2200 West Armitage Ave",
		"city": "Chicago",
		"state": "IL",
		"pincode": "60647",
		"country": "United States",
	},
	{
		"name": "Cedar Valley Clinics",
		"legacy": ("DA Cedar Clinics",),
		"group": "Commercial",
		"type": "Company",
		"email": "ops@cedarvalleyclinics.org",
		"phone": "+1 503 555 0166",
		"contact": "Amelia Grant",
		"address_line1": "91 Hawthorne Blvd",
		"city": "Portland",
		"state": "OR",
		"pincode": "97214",
		"country": "United States",
	},
	{
		"name": "BrightPath Schools",
		"legacy": ("DA Bright Schools",),
		"group": "Commercial",
		"type": "Company",
		"email": "facilities@brightpathschools.edu",
		"phone": "+1 617 555 0133",
		"contact": "Marcus Quinn",
		"address_line1": "15 Commonwealth Ave",
		"city": "Boston",
		"state": "MA",
		"pincode": "02116",
		"country": "United States",
	},
	{
		"name": "Elena Vargas",
		"legacy": ("DA Solo Buyer",),
		"group": "Individual",
		"type": "Individual",
		"email": "elena.vargas@example.com",
		"phone": "+1 206 555 0177",
		"contact": "Elena Vargas",
		"address_line1": "812 Pike Street Apt 4B",
		"city": "Seattle",
		"state": "WA",
		"pincode": "98101",
		"country": "United States",
	},
)

SUPPLIERS = (
	{
		"name": "Apex Precision Components",
		"legacy": ("DA Apex Components",),
		"group": "Local",
		"email": "orders@apexpercision.com",
		"phone": "+1 408 555 0110",
		"contact": "Kenji Watanabe",
		"address_line1": "3500 Great America Pkwy",
		"city": "Santa Clara",
		"state": "CA",
		"pincode": "95054",
		"country": "United States",
	},
	{
		"name": "Pacific Polymer Parts",
		"legacy": ("DA Pacific Parts",),
		"group": "Local",
		"email": "sales@pacificpolymer.parts",
		"phone": "+1 562 555 0188",
		"contact": "Sofia Alvarez",
		"address_line1": "11800 Alameda St",
		"city": "Lynwood",
		"state": "CA",
		"pincode": "90262",
		"country": "United States",
	},
	{
		"name": "Cascade Cloud Hosting",
		"legacy": ("DA Cloud Hosting Co",),
		"group": "Services",
		"email": "billing@cascadecloud.io",
		"phone": "+31 20 555 0144",
		"contact": "Lars de Vries",
		"address_line1": "Herengracht 182",
		"city": "Amsterdam",
		"state": "NH",
		"pincode": "1016 BR",
		"country": "Netherlands",
	},
)

LEADS = (
	{
		"lead_name": "Priya Sharma",
		"legacy_names": ("Dana Ortega",),
		"status": "Open",
		"company_name": "VitaSoft Analytics",
		"legacy_orgs": ("DA Prospect SoftCo",),
		"email": "priya.sharma@vitasoft.io",
		"phone": "+91 98765 43210",
		"gender": "Female",
	},
	{
		"lead_name": "James Whitfield",
		"legacy_names": ("Sam Patel",),
		"status": "Replied",
		"company_name": "Helix Health Systems",
		"legacy_orgs": ("DA Prospect Health",),
		"email": "j.whitfield@helixhealth.com",
		"phone": "+1 646 555 0121",
		"gender": "Male",
	},
	{
		"lead_name": "Elena Rossi",
		"legacy_names": ("Riley Chen",),
		"status": "Opportunity",
		"company_name": "EduForge Labs",
		"legacy_orgs": ("DA Prospect Edu",),
		"email": "elena.rossi@eduforge.eu",
		"phone": "+39 02 555 0190",
		"gender": "Female",
	},
)

# (item_code, item_name, item_group, stock_uom, is_stock, valuation, selling, buying)
# Codes stay stable so existing SO/SI/PO lines keep resolving.
ITEMS = (
	("DA-FG-KIT", "Meridian Assembly Kit", "Products", "Nos", 1, 45.0, 129.0, 55.0),
	("DA-FG-SENSOR", "Meridian IoT Sensor Node", "Products", "Nos", 1, 28.0, 89.0, 35.0),
	("DA-RM-BOARD", "Industrial Circuit Board", "Raw Material", "Nos", 1, 12.0, 0.0, 14.0),
	("DA-RM-CASE", "Polymer Enclosure Case", "Raw Material", "Nos", 1, 6.0, 0.0, 7.5),
	("DA-SVC-SETUP", "Onsite Commissioning", "Services", "Hour", 0, 0.0, 150.0, 0.0),
	("DA-SVC-SUPPORT", "Priority Support Plan", "Services", "Nos", 0, 0.0, 49.0, 0.0),
)

EMPLOYEES = (
	{
		"emp_id": "DA-EMP-001",
		"first": "Alex",
		"last": "Morgan",
		"designation": "Sales Manager",
		"gender": "Male",
		"email": "alex.morgan@demo-arcade.zivvy.xyz",
	},
	{
		"emp_id": "DA-EMP-002",
		"first": "Jordan",
		"last": "Lee",
		"designation": "Purchase Manager",
		"gender": "Female",
		"email": "jordan.lee@demo-arcade.zivvy.xyz",
	},
	{
		"emp_id": "DA-EMP-003",
		"first": "Priya",
		"last": "Nair",
		"legacy_first": "Casey",
		"legacy_last": "Nguyen",
		"designation": "Accountant",
		"gender": "Female",
		"email": "priya.nair@demo-arcade.zivvy.xyz",
	},
	{
		"emp_id": "DA-EMP-004",
		"first": "Marco",
		"last": "Bianchi",
		"legacy_first": "Taylor",
		"legacy_last": "Brooks",
		"designation": "Executive",
		"gender": "Male",
		"email": "marco.bianchi@demo-arcade.zivvy.xyz",
	},
)

PROJECTS = (
	{
		"name": "Harbor Bay fleet rollout",
		"legacy": ("DA Rollout Horizon",),
		"status": "Open",
		"customer": "Harbor Bay Logistics",
	},
	{
		"name": "Northline sensor pilot",
		"legacy": ("DA Sensor Pilot",),
		"status": "Completed",
		"customer": "Northline Manufacturing",
	},
)

CUSTOMER_NAMES = tuple(c["name"] for c in CUSTOMERS)
SUPPLIER_NAMES = tuple(s["name"] for s in SUPPLIERS)


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


def _rollback_sp(sp: str) -> None:
	try:
		frappe.db.rollback(save_point=sp)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass


def _run_step(counts: dict[str, Any], label: str, fn) -> None:
	"""Run one seed step; isolate failures without poisoning the PG transaction."""
	sp = f"da_{label}"[:63]
	try:
		frappe.db.savepoint(sp)
	except Exception:
		sp = None
	try:
		result = fn()
		counts[label] = result if result is not None else "ok"
		try:
			frappe.db.commit()
		except Exception:
			_log(f"Zivvy demo-arcade seed commit: {label}")
			try:
				frappe.db.rollback()
			except Exception:
				pass
	except Exception as exc:
		if sp:
			_rollback_sp(sp)
		else:
			try:
				frappe.db.rollback()
			except Exception:
				pass
		_log(f"Zivvy demo-arcade seed: {label}")
		counts[label] = {"error": str(exc)[:240]}
		try:
			frappe.db.rollback()
		except Exception:
			pass


def _resolve_context() -> dict[str, str]:
	if not frappe.db.exists("User", DEMO_EMAIL):
		frappe.throw(f"Demo user {DEMO_EMAIL} missing — run seed_demo_accounts first.")

	tenant = None
	if frappe.db.has_column("User", TENANT_FIELD):
		tenant = frappe.db.get_value("User", DEMO_EMAIL, TENANT_FIELD)
	if not tenant:
		tenant = frappe.db.get_value("Zivvy Tenant", {"slug": DEMO_TENANT_SLUG}, "name")
	if not tenant:
		frappe.throw("demo-arcade tenant missing — run seed_demo_accounts / migrate_existing_tenants.")

	company = frappe.db.get_value("Zivvy Tenant", tenant, "company") or DEMO_COMPANY
	if not frappe.db.exists("Company", company):
		frappe.throw(f"Company {company!r} missing for demo-arcade.")

	abbr = frappe.db.get_value("Company", company, "abbr") or "DEM5"
	currency = frappe.db.get_value("Company", company, "default_currency") or "USD"
	cost_center = frappe.db.get_value("Company", company, "cost_center") or f"Main - {abbr}"
	warehouse = frappe.db.get_value(
		"Warehouse", {"company": company, "warehouse_name": "Stores"}, "name"
	) or f"Stores - {abbr}"
	fg_warehouse = frappe.db.get_value(
		"Warehouse", {"company": company, "warehouse_name": "Finished Goods"}, "name"
	) or f"Finished Goods - {abbr}"

	return {
		"email": DEMO_EMAIL,
		"tenant": tenant,
		"company": company,
		"abbr": abbr,
		"currency": currency,
		"cost_center": cost_center,
		"warehouse": warehouse,
		"fg_warehouse": fg_warehouse,
	}


def _ensure_masters() -> str:
	from zivvy_brand.setup.masters_seed import seed_erpnext_masters

	seed_erpnext_masters(country="United States")
	return "ensured"


def _stamp(doc, ctx: dict[str, str]):
	"""Explicitly bind tenant-scoped docs (seed runs as Administrator)."""
	if frappe.get_meta(doc.doctype).has_field(TENANT_FIELD):
		setattr(doc, TENANT_FIELD, ctx["tenant"])
	doc.flags.ignore_permissions = True
	doc.flags.ignore_mandatory = True
	if doc.doctype == "Item":
		doc.flags.ignore_links = True
	return doc


def _pick_link(doctype: str, preferred: tuple[str, ...], fallback_field: str | None = None) -> str | None:
	for name in preferred:
		if frappe.db.exists(doctype, name):
			return name
	rows = frappe.get_all(doctype, pluck="name", limit=5)
	if rows:
		for r in rows:
			if "All " not in r:
				return r
		return rows[0]
	return None


def _rename_if_needed(doctype: str, current: str, target: str) -> str:
	"""Rename legacy placeholder docs to canonical names when safe."""
	if current == target:
		return target
	if frappe.db.exists(doctype, target):
		return target
	if not frappe.db.exists(doctype, current):
		return target
	try:
		frappe.rename_doc(doctype, current, target, force=True, merge=False)
		frappe.db.commit()
		return target
	except Exception:
		_log(f"Zivvy demo-arcade rename {doctype} {current} -> {target}")
		return current


def _find_existing_name(doctype: str, canonical: str, legacy: tuple[str, ...] = ()) -> str | None:
	if frappe.db.exists(doctype, canonical):
		return canonical
	for old in legacy:
		if frappe.db.exists(doctype, old):
			return old
	return None


def _ensure_address(
	ctx: dict[str, str],
	*,
	link_doctype: str,
	link_name: str,
	address_title: str,
	line1: str,
	city: str,
	state: str,
	pincode: str,
	country: str,
	email: str | None = None,
	phone: str | None = None,
) -> str | None:
	if not _has_doctype("Address"):
		return None
	marker = f"{SEED_TAG}:{link_doctype}:{link_name}"
	existing = frappe.db.get_value("Address", {"address_title": address_title}, "name")
	if not existing:
		# Also match legacy titles that reused party name
		existing = frappe.db.get_value(
			"Address",
			{"address_title": link_name},
			"name",
		)
	payload = {
		"address_title": address_title,
		"address_type": "Billing",
		"address_line1": line1,
		"city": city,
		"state": state,
		"pincode": pincode,
		"country": country if frappe.db.exists("Country", country) else "United States",
		"email_id": email,
		"phone": phone,
		"is_primary_address": 1,
		"is_shipping_address": 1,
	}
	try:
		if existing:
			doc = frappe.get_doc("Address", existing)
			for k, v in payload.items():
				if v is not None:
					setattr(doc, k, v)
			# Ensure link
			linked = any(r.link_doctype == link_doctype and r.link_name == link_name for r in doc.links)
			if not linked:
				doc.append("links", {"link_doctype": link_doctype, "link_name": link_name})
			_stamp(doc, ctx)
			doc.save(ignore_permissions=True)
			return doc.name
		doc = frappe.get_doc({"doctype": "Address", **payload, "links": [
			{"link_doctype": link_doctype, "link_name": link_name}
		]})
		# Store marker in address_line2 when empty slot useful for idempotency notes
		if frappe.get_meta("Address").has_field("address_line2"):
			doc.address_line2 = marker[:140]
		_stamp(doc, ctx)
		doc.insert(ignore_permissions=True)
		return doc.name
	except Exception:
		_log(f"Zivvy demo-arcade seed: Address {link_name}")
		return None


def _ensure_contact(
	ctx: dict[str, str],
	*,
	link_doctype: str,
	link_name: str,
	full_name: str,
	email: str | None = None,
	phone: str | None = None,
) -> str | None:
	if not _has_doctype("Contact") or not full_name:
		return None
	parts = full_name.strip().split(None, 1)
	first = parts[0]
	last = parts[1] if len(parts) > 1 else ""
	existing = frappe.db.get_value(
		"Dynamic Link",
		{"link_doctype": link_doctype, "link_name": link_name, "parenttype": "Contact"},
		"parent",
	)
	try:
		if existing:
			doc = frappe.get_doc("Contact", existing)
			doc.first_name = first
			doc.last_name = last
			if email and frappe.get_meta("Contact").has_field("email_id"):
				doc.email_id = email
			if phone and frappe.get_meta("Contact").has_field("phone"):
				doc.phone = phone
			# Ensure email row
			if email and hasattr(doc, "email_ids"):
				if not any(getattr(r, "email_id", None) == email for r in (doc.email_ids or [])):
					doc.append("email_ids", {"email_id": email, "is_primary": 1})
			if phone and hasattr(doc, "phone_nos"):
				if not any(getattr(r, "phone", None) == phone for r in (doc.phone_nos or [])):
					doc.append("phone_nos", {"phone": phone, "is_primary_phone": 1})
			_stamp(doc, ctx)
			doc.save(ignore_permissions=True)
			return doc.name
		doc = frappe.get_doc(
			{
				"doctype": "Contact",
				"first_name": first,
				"last_name": last,
				"is_primary_contact": 1,
				"links": [{"link_doctype": link_doctype, "link_name": link_name}],
			}
		)
		if email:
			doc.append("email_ids", {"email_id": email, "is_primary": 1})
		if phone:
			doc.append("phone_nos", {"phone": phone, "is_primary_phone": 1})
		_stamp(doc, ctx)
		doc.insert(ignore_permissions=True)
		return doc.name
	except Exception:
		_log(f"Zivvy demo-arcade seed: Contact {link_name}")
		return None


def _seed_customers(ctx: dict[str, str]) -> dict[str, int]:
	created = updated = renamed = 0
	group = _pick_link("Customer Group", ("Commercial", "Individual", "All Customer Groups"))
	territory = _pick_link("Territory", ("United States", "Rest Of The World", "All Territories"))
	for spec in CUSTOMERS:
		name = spec["name"]
		legacy = tuple(spec.get("legacy") or ())
		existing = _find_existing_name("Customer", name, legacy)
		g = spec["group"] if frappe.db.exists("Customer Group", spec["group"]) else group
		if existing and existing != name:
			existing = _rename_if_needed("Customer", existing, name)
			if existing == name:
				renamed += 1
		if existing and frappe.db.exists("Customer", existing):
			doc = frappe.get_doc("Customer", existing if existing == name else name)
			# After rename, name is canonical
			if not frappe.db.exists("Customer", name):
				doc = frappe.get_doc("Customer", existing)
			else:
				doc = frappe.get_doc("Customer", name)
			doc.customer_name = name
			doc.customer_type = spec["type"]
			doc.customer_group = g
			doc.territory = territory
			if spec.get("email") and frappe.get_meta("Customer").has_field("email_id"):
				doc.email_id = spec["email"]
			if spec.get("phone") and frappe.get_meta("Customer").has_field("mobile_no"):
				doc.mobile_no = spec["phone"]
			_stamp(doc, ctx)
			doc.save(ignore_permissions=True)
			updated += 1
		else:
			payload = {
				"doctype": "Customer",
				"customer_name": name,
				"customer_type": spec["type"],
				"customer_group": g,
				"territory": territory,
			}
			if spec.get("email") and frappe.get_meta("Customer").has_field("email_id"):
				payload["email_id"] = spec["email"]
			if spec.get("phone") and frappe.get_meta("Customer").has_field("mobile_no"):
				payload["mobile_no"] = spec["phone"]
			doc = frappe.get_doc(payload)
			_stamp(doc, ctx)
			doc.insert(ignore_permissions=True)
			created += 1
		# Party extras
		_ensure_address(
			ctx,
			link_doctype="Customer",
			link_name=name if frappe.db.exists("Customer", name) else (existing or name),
			address_title=f"{name} HQ",
			line1=spec["address_line1"],
			city=spec["city"],
			state=spec["state"],
			pincode=spec["pincode"],
			country=spec["country"],
			email=spec.get("email"),
			phone=spec.get("phone"),
		)
		_ensure_contact(
			ctx,
			link_doctype="Customer",
			link_name=name if frappe.db.exists("Customer", name) else (existing or name),
			full_name=spec.get("contact") or name,
			email=spec.get("email"),
			phone=spec.get("phone"),
		)
	return {"created": created, "updated": updated, "renamed": renamed}


def _seed_suppliers(ctx: dict[str, str]) -> dict[str, int]:
	created = updated = renamed = 0
	for spec in SUPPLIERS:
		name = spec["name"]
		legacy = tuple(spec.get("legacy") or ())
		existing = _find_existing_name("Supplier", name, legacy)
		g = (
			spec["group"]
			if frappe.db.exists("Supplier Group", spec["group"])
			else _pick_link("Supplier Group", ("Local", "Services", "All Supplier Groups"))
		)
		if existing and existing != name:
			existing = _rename_if_needed("Supplier", existing, name)
			if existing == name:
				renamed += 1
		if frappe.db.exists("Supplier", name):
			doc = frappe.get_doc("Supplier", name)
			doc.supplier_name = name
			doc.supplier_group = g
			doc.supplier_type = "Company"
			if spec.get("email") and frappe.get_meta("Supplier").has_field("email_id"):
				doc.email_id = spec["email"]
			if spec.get("phone") and frappe.get_meta("Supplier").has_field("mobile_no"):
				doc.mobile_no = spec["phone"]
			_stamp(doc, ctx)
			doc.save(ignore_permissions=True)
			updated += 1
		else:
			payload = {
				"doctype": "Supplier",
				"supplier_name": name,
				"supplier_group": g,
				"supplier_type": "Company",
			}
			if spec.get("email") and frappe.get_meta("Supplier").has_field("email_id"):
				payload["email_id"] = spec["email"]
			doc = frappe.get_doc(payload)
			_stamp(doc, ctx)
			doc.insert(ignore_permissions=True)
			created += 1
		_ensure_address(
			ctx,
			link_doctype="Supplier",
			link_name=name,
			address_title=f"{name} Warehouse",
			line1=spec["address_line1"],
			city=spec["city"],
			state=spec["state"],
			pincode=spec["pincode"],
			country=spec["country"],
			email=spec.get("email"),
			phone=spec.get("phone"),
		)
		_ensure_contact(
			ctx,
			link_doctype="Supplier",
			link_name=name,
			full_name=spec.get("contact") or name,
			email=spec.get("email"),
			phone=spec.get("phone"),
		)
	return {"created": created, "updated": updated, "renamed": renamed}


def _seed_leads(ctx: dict[str, str]) -> dict[str, int]:
	created = updated = 0
	territory = _pick_link("Territory", ("United States", "Rest Of The World"))
	for spec in LEADS:
		lead_name = spec["lead_name"]
		# Prefer tenant-scoped match, then any by lead_name / legacy
		existing = None
		if frappe.db.has_column("Lead", TENANT_FIELD):
			existing = frappe.db.exists(
				"Lead", {"lead_name": lead_name, TENANT_FIELD: ctx["tenant"]}
			)
		if not existing:
			existing = frappe.db.exists("Lead", {"lead_name": lead_name})
		if not existing:
			for old in spec.get("legacy_names") or ():
				existing = frappe.db.exists("Lead", {"lead_name": old})
				if existing:
					break
		gender = (
			spec["gender"]
			if frappe.db.exists("Gender", spec["gender"])
			else _pick_link("Gender", ("Female", "Male", "Other"))
		)
		fields = {
			"lead_name": lead_name,
			"status": spec["status"]
			if spec["status"] in ("Open", "Replied", "Opportunity", "Interested")
			else "Open",
			"company_name": spec["company_name"],
			"territory": territory,
			"gender": gender,
			"source": "Campaign" if frappe.db.exists("Lead Source", "Campaign") else None,
		}
		if spec.get("email") and frappe.get_meta("Lead").has_field("email_id"):
			fields["email_id"] = spec["email"]
		if spec.get("phone") and frappe.get_meta("Lead").has_field("mobile_no"):
			fields["mobile_no"] = spec["phone"]

		if existing:
			doc = frappe.get_doc("Lead", existing)
			for k, v in fields.items():
				if v is not None:
					setattr(doc, k, v)
			_stamp(doc, ctx)
			doc.save(ignore_permissions=True)
			updated += 1
		else:
			doc = frappe.get_doc({"doctype": "Lead", **fields})
			_stamp(doc, ctx)
			doc.insert(ignore_permissions=True)
			created += 1
	return {"created": created, "updated": updated}


def _seed_items(ctx: dict[str, str]) -> dict[str, int]:
	created = updated = skipped = 0
	errors: list[str] = []
	prev_pl = frappe.db.get_single_value("Selling Settings", "selling_price_list")
	try:
		frappe.db.set_single_value("Selling Settings", "selling_price_list", None)
	except Exception:
		prev_pl = None

	for code, name, group, uom, is_stock, valuation, selling, buying in ITEMS:
		try:
			ig = group if frappe.db.exists("Item Group", group) else _pick_link(
				"Item Group", ("Products", "Raw Material", "Services", "All Item Groups")
			)
			suom = uom if frappe.db.exists("UOM", uom) else _pick_link("UOM", ("Nos", "Unit", "Hour"))
			if frappe.db.exists("Item", code):
				doc = frappe.get_doc("Item", code)
				doc.item_name = name
				doc.item_group = ig
				doc.stock_uom = suom
				doc.is_stock_item = 1 if is_stock else 0
				doc.include_item_in_manufacturing = 1 if code.startswith(("DA-RM", "DA-FG")) else 0
				doc.valuation_rate = valuation
				doc.standard_rate = 0
				doc.is_purchase_item = 1 if buying or is_stock else 0
				doc.is_sales_item = 1 if selling else 0
				doc.description = f"{name} — industrial IoT catalog ({SEED_TAG})"
				_stamp(doc, ctx)
				doc.save(ignore_permissions=True)
				updated += 1
			else:
				doc = frappe.get_doc(
					{
						"doctype": "Item",
						"item_code": code,
						"item_name": name,
						"item_group": ig,
						"stock_uom": suom,
						"is_stock_item": 1 if is_stock else 0,
						"include_item_in_manufacturing": 1
						if code.startswith(("DA-RM", "DA-FG"))
						else 0,
						"valuation_rate": valuation,
						"standard_rate": 0,
						"is_purchase_item": 1 if buying or is_stock else 0,
						"is_sales_item": 1 if selling else 0,
						"description": f"{name} — industrial IoT catalog ({SEED_TAG})",
					}
				)
				_stamp(doc, ctx)
				doc.insert(ignore_permissions=True)
				created += 1

			for price_list, rate, buying_flag, selling_flag in (
				("Standard Selling", selling, 0, 1),
				("Standard Buying", buying, 1, 0),
			):
				if not rate or not frappe.db.exists("Price List", price_list):
					continue
				existing_ip = frappe.db.exists(
					"Item Price",
					{
						"item_code": code,
						"price_list": price_list,
						"selling": selling_flag,
						"buying": buying_flag,
					},
				)
				if existing_ip:
					ip = frappe.get_doc("Item Price", existing_ip)
					ip.price_list_rate = rate
					ip.currency = ctx["currency"]
					_stamp(ip, ctx)
					ip.save(ignore_permissions=True)
				else:
					ip = frappe.get_doc(
						{
							"doctype": "Item Price",
							"item_code": code,
							"price_list": price_list,
							"price_list_rate": rate,
							"selling": selling_flag,
							"buying": buying_flag,
							"currency": ctx["currency"],
						}
					)
					_stamp(ip, ctx)
					ip.insert(ignore_permissions=True)
		except Exception as exc:
			try:
				frappe.db.rollback()
			except Exception:
				pass
			errors.append(f"{code}:{str(exc)[:120]}")
	if prev_pl:
		try:
			frappe.db.set_single_value("Selling Settings", "selling_price_list", prev_pl)
		except Exception:
			pass
	out: dict[str, Any] = {"created": created, "updated": updated, "skipped": skipped}
	if errors:
		out["errors"] = errors[:6]
	return out


def _seed_opening_stock(ctx: dict[str, str]) -> dict[str, Any]:
	"""Material Receipt so stock items can be sold / used in WO.

	On Postgres, Stock Entry submit often fails on Inventory Dimension DISTINCT/ORDER BY.
	We still create a draft entry for demo lists when submit is impossible.
	"""
	# Accept v1 or v2 marker
	for marker in (f"{SEED_TAG}-opening-stock", "zivvy-demo-arcade-seed-v1-opening-stock"):
		existing = frappe.db.exists(
			"Stock Entry", {"remarks": marker, "company": ctx["company"], "docstatus": ("!=", 2)}
		)
		if existing:
			# Refresh remarks to v2 marker
			try:
				frappe.db.set_value(
					"Stock Entry", existing, "remarks", f"{SEED_TAG}-opening-stock", update_modified=False
				)
			except Exception:
				pass
			return {"skipped": existing}

	stock_items = [
		(code, uom, valuation)
		for code, _n, _g, uom, is_stock, valuation, _s, _b in ITEMS
		if is_stock and frappe.db.exists("Item", code)
	]
	if not stock_items:
		return {"skipped": "no_stock_items"}

	se = frappe.get_doc(
		{
			"doctype": "Stock Entry",
			"stock_entry_type": "Material Receipt",
			"purpose": "Material Receipt",
			"company": ctx["company"],
			"to_warehouse": ctx["warehouse"],
			"posting_date": add_days(today(), -20),
			"remarks": f"{SEED_TAG}-opening-stock",
		}
	)
	for code, uom, valuation in stock_items:
		se.append(
			"items",
			{
				"item_code": code,
				"qty": 100,
				"t_warehouse": ctx["warehouse"],
				"basic_rate": valuation,
				"uom": uom,
				"stock_uom": uom,
				"conversion_factor": 1,
				"transfer_qty": 100,
				"allow_zero_valuation_rate": 0,
			},
		)
	se.insert(ignore_permissions=True)
	return {
		"created_draft": se.name,
		"lines": len(se.items),
		"submit_skipped": "postgres_inventory_dimension_distinct_order_by",
	}


def _seed_quotation(ctx: dict[str, str]) -> dict[str, Any]:
	markers = (f"{SEED_TAG}-quotation-1", "zivvy-demo-arcade-seed-v1-quotation-1")
	existing = None
	for marker in markers:
		existing = frappe.db.exists("Quotation", {"company": ctx["company"], "title": marker})
		if existing:
			break
	customer = CUSTOMER_NAMES[0]
	# Also accept renamed-from legacy if rename failed
	if not frappe.db.exists("Customer", customer):
		for legacy in CUSTOMERS[0].get("legacy") or ():
			if frappe.db.exists("Customer", legacy):
				customer = legacy
				break
	if not frappe.db.exists("Customer", customer):
		return {"skipped": "no_customer"}
	item = "DA-FG-SENSOR"
	if not frappe.db.exists("Item", item):
		return {"skipped": "no_item"}

	if existing:
		doc = frappe.get_doc("Quotation", existing)
		if doc.docstatus == 0:
			doc.party_name = customer
			doc.title = f"{SEED_TAG}-quotation-1"
			doc.save(ignore_permissions=True)
		else:
			# Submitted — only retitle if still draft-safe fields; title may be editable
			try:
				frappe.db.set_value(
					"Quotation", existing, "title", f"{SEED_TAG}-quotation-1", update_modified=False
				)
			except Exception:
				pass
		return {"updated": existing}

	doc = frappe.get_doc(
		{
			"doctype": "Quotation",
			"quotation_to": "Customer",
			"party_name": customer,
			"company": ctx["company"],
			"transaction_date": add_days(today(), -10),
			"valid_till": add_days(today(), 20),
			"order_type": "Sales",
			"currency": ctx["currency"],
			"selling_price_list": "Standard Selling",
			"title": f"{SEED_TAG}-quotation-1",
			"items": [
				{
					"item_code": item,
					"qty": 10,
					"rate": 89.0,
					"warehouse": ctx["warehouse"],
				},
				{
					"item_code": "DA-SVC-SETUP",
					"qty": 2,
					"rate": 150.0,
				},
			],
		}
	)
	doc.insert(ignore_permissions=True)
	doc.submit()
	return {"created": doc.name}


def _customer_ref(index: int) -> str:
	spec = CUSTOMERS[index]
	name = spec["name"]
	if frappe.db.exists("Customer", name):
		return name
	for legacy in spec.get("legacy") or ():
		if frappe.db.exists("Customer", legacy):
			return legacy
	return name


def _supplier_ref(index: int) -> str:
	spec = SUPPLIERS[index]
	name = spec["name"]
	if frappe.db.exists("Supplier", name):
		return name
	for legacy in spec.get("legacy") or ():
		if frappe.db.exists("Supplier", legacy):
			return legacy
	return name


def _seed_sales_orders(ctx: dict[str, str]) -> dict[str, Any]:
	"""Create SOs. Prefer submit; fall back to draft on Postgres bin/if() bugs."""
	out: dict[str, Any] = {"created": [], "drafts": [], "skipped": [], "updated": []}
	specs = (
		("DA-SEED-SO-1", 0, [("DA-FG-SENSOR", 5, 89.0), ("DA-SVC-SUPPORT", 1, 49.0)]),
		("DA-SEED-SO-2", 1, [("DA-FG-KIT", 3, 129.0)]),
		("DA-SEED-SO-3", 2, [("DA-SVC-SETUP", 4, 150.0)]),
	)
	for po_no, cust_idx, lines in specs:
		customer = _customer_ref(cust_idx)
		existing = frappe.db.exists("Sales Order", {"company": ctx["company"], "po_no": po_no})
		if existing:
			try:
				doc = frappe.get_doc("Sales Order", existing)
				if doc.docstatus == 0:
					doc.customer = customer
					doc.save(ignore_permissions=True)
					out["updated"].append(doc.name)
				else:
					out["skipped"].append(po_no)
			except Exception:
				out["skipped"].append(po_no)
			continue
		if not frappe.db.exists("Customer", customer):
			out["skipped"].append(f"{po_no}:no_customer")
			continue
		doc = frappe.get_doc(
			{
				"doctype": "Sales Order",
				"customer": customer,
				"company": ctx["company"],
				"transaction_date": add_days(today(), -7),
				"delivery_date": add_days(today(), 7),
				"po_no": po_no,
				"currency": ctx["currency"],
				"selling_price_list": "Standard Selling",
				"set_warehouse": ctx["warehouse"],
				"items": [
					{
						"item_code": code,
						"qty": qty,
						"rate": rate,
						"delivery_date": add_days(today(), 7),
						"warehouse": ctx["warehouse"],
					}
					for code, qty, rate in lines
					if frappe.db.exists("Item", code)
				],
			}
		)
		doc.insert(ignore_permissions=True)
		out["drafts"].append(doc.name)
		frappe.db.commit()
	return out


def _seed_sales_invoices(ctx: dict[str, str]) -> dict[str, Any]:
	"""Create SIs as drafts when Payment Ledger CTE fails on Postgres submit."""
	out: dict[str, Any] = {"created": [], "drafts": [], "skipped": [], "updated": [], "payments": []}

	def income_account():
		return frappe.db.get_value("Company", ctx["company"], "default_income_account") or frappe.db.get_value(
			"Account",
			{"company": ctx["company"], "account_type": "Income Account", "is_group": 0},
			"name",
		)

	for marker, cust_idx, lines in (
		("DA-SEED-SI-1", 3, [("DA-SVC-SETUP", 2, 150.0), ("DA-SVC-SUPPORT", 1, 49.0)]),
		("DA-SEED-SI-2", 0, [("DA-FG-SENSOR", 2, 89.0)]),
	):
		customer = _customer_ref(cust_idx)
		existing = frappe.db.exists("Sales Invoice", {"company": ctx["company"], "po_no": marker})
		if existing:
			try:
				doc = frappe.get_doc("Sales Invoice", existing)
				if doc.docstatus == 0 and frappe.db.exists("Customer", customer):
					doc.customer = customer
					doc.save(ignore_permissions=True)
					out["updated"].append(doc.name)
				else:
					out["skipped"].append(marker)
			except Exception:
				out["skipped"].append(marker)
			continue
		if not frappe.db.exists("Customer", customer):
			out["skipped"].append(f"{marker}:no_customer")
			continue
		income = income_account()
		doc = frappe.get_doc(
			{
				"doctype": "Sales Invoice",
				"customer": customer,
				"company": ctx["company"],
				"posting_date": add_days(today(), -3) if marker.endswith("1") else today(),
				"due_date": add_days(today(), 27 if marker.endswith("1") else 30),
				"po_no": marker,
				"currency": ctx["currency"],
				"selling_price_list": "Standard Selling",
				"update_stock": 0,
				"items": [
					{
						"item_code": code,
						"qty": qty,
						"rate": rate,
						"income_account": income,
					}
					for code, qty, rate in lines
					if frappe.db.exists("Item", code)
				],
			}
		)
		doc.insert(ignore_permissions=True)
		out["drafts"].append(doc.name)
		frappe.db.commit()

	out["submit_skipped"] = "postgres_payment_ledger_cte_groupby"
	return out


def _seed_purchase_orders(ctx: dict[str, str]) -> dict[str, Any]:
	out: dict[str, Any] = {"created": [], "skipped": [], "updated": [], "receipts": [], "invoices": []}

	def ensure_po(marker: str, supplier_idx: int, lines: list[tuple], *, submit: bool = True):
		supplier = _supplier_ref(supplier_idx)
		existing = frappe.db.exists("Purchase Order", {"company": ctx["company"], "title": marker})
		if existing:
			try:
				doc = frappe.get_doc("Purchase Order", existing)
				if doc.docstatus == 0 and frappe.db.exists("Supplier", supplier):
					doc.supplier = supplier
					doc.save(ignore_permissions=True)
					out["updated"].append(doc.name)
				else:
					out["skipped"].append(marker)
			except Exception:
				out["skipped"].append(marker)
			return existing

		if not frappe.db.exists("Supplier", supplier):
			out["skipped"].append(f"{marker}:no_supplier")
			return None

		doc = frappe.get_doc(
			{
				"doctype": "Purchase Order",
				"supplier": supplier,
				"company": ctx["company"],
				"transaction_date": add_days(today(), -14) if marker.endswith("1") else today(),
				"schedule_date": add_days(today(), -7 if marker.endswith("1") else 14),
				"currency": ctx["currency"],
				"buying_price_list": "Standard Buying",
				"title": marker,
				"set_warehouse": ctx["warehouse"],
				"items": [
					{
						"item_code": code,
						"qty": qty,
						"rate": rate,
						"schedule_date": add_days(today(), -7 if marker.endswith("1") else 14),
						"warehouse": ctx["warehouse"],
					}
					for code, qty, rate in lines
					if frappe.db.exists("Item", code)
				],
			}
		)
		doc.insert(ignore_permissions=True)
		if submit:
			doc.submit()
		out["created"].append(doc.name)
		return doc.name

	po1 = ensure_po(
		"DA-SEED-PO-1",
		0,
		[("DA-RM-BOARD", 50, 14.0), ("DA-RM-CASE", 50, 7.5)],
	)
	if po1 and po1 in out["created"]:
		try:
			from erpnext.buying.doctype.purchase_order.mapper import make_purchase_receipt

			pr = make_purchase_receipt(po1)
			pr.posting_date = add_days(today(), -7)
			pr.insert(ignore_permissions=True)
			pr.submit()
			out["receipts"].append(pr.name)
		except Exception:
			_log("Zivvy demo-arcade seed: PR from PO")

		try:
			from erpnext.buying.doctype.purchase_order.mapper import make_purchase_invoice

			pi = make_purchase_invoice(po1)
			pi.posting_date = add_days(today(), -5)
			pi.bill_no = "DA-SEED-PO-1"
			pi.bill_date = add_days(today(), -5)
			pi.insert(ignore_permissions=True)
			pi.submit()
			out["invoices"].append(pi.name)
		except Exception:
			_log("Zivvy demo-arcade seed: PI from PO")

	ensure_po("DA-SEED-PO-2", 1, [("DA-FG-KIT", 20, 55.0)])
	return out


def _seed_employees(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Employee"):
		return {"skipped": "no_Employee"}
	created = updated = 0
	gender_fallback = _pick_link("Gender", ("Male", "Female", "Other"))
	emp_type = _pick_link("Employment Type", ("Full-time", "Part-time", "Contract"))
	dept = frappe.db.get_value("Department", {"company": ctx["company"]}, "name")
	for spec in EMPLOYEES:
		emp_id = spec["emp_id"]
		existing = frappe.db.exists(
			"Employee", {"employee_number": emp_id, "company": ctx["company"]}
		) or frappe.db.exists("Employee", emp_id)
		desig = (
			spec["designation"]
			if frappe.db.exists("Designation", spec["designation"])
			else _pick_link("Designation", ("Sales Manager", "Executive", "Accountant"))
		)
		g = spec["gender"] if frappe.db.exists("Gender", spec["gender"]) else gender_fallback
		if existing:
			doc = frappe.get_doc("Employee", existing)
			doc.first_name = spec["first"]
			doc.last_name = spec["last"]
			doc.gender = g
			doc.designation = desig
			doc.department = dept
			doc.employment_type = emp_type
			doc.status = "Active"
			doc.company = ctx["company"]
			if frappe.get_meta("Employee").has_field("company_email"):
				doc.company_email = spec["email"]
			_stamp(doc, ctx)
			try:
				doc.save(ignore_permissions=True)
				updated += 1
			except Exception:
				_log(f"Zivvy demo-arcade seed: Employee update {emp_id}")
			continue
		doc = frappe.get_doc(
			{
				"doctype": "Employee",
				"employee_number": emp_id,
				"first_name": spec["first"],
				"last_name": spec["last"],
				"gender": g,
				"date_of_birth": "1990-01-15",
				"date_of_joining": add_days(today(), -400),
				"status": "Active",
				"company": ctx["company"],
				"designation": desig,
				"department": dept,
				"employment_type": emp_type,
				"prefered_contact_email": "Company Email",
				"company_email": spec["email"],
			}
		)
		try:
			doc.insert(ignore_permissions=True)
			created += 1
		except Exception:
			_log(f"Zivvy demo-arcade seed: Employee {emp_id}")
	return {"created": created, "updated": updated}


def _seed_leave(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Leave Application") or not _has_doctype("Leave Type"):
		return {"skipped": "no_leave"}
	emp = frappe.db.get_value(
		"Employee", {"company": ctx["company"], "status": "Active"}, "name"
	)
	if not emp:
		return {"skipped": "no_employee"}
	leave_type = _pick_link("Leave Type", ("Casual Leave", "Privilege Leave", "Sick Leave"))
	if not leave_type:
		return {"skipped": "no_leave_type"}

	out: dict[str, Any] = {"allocation": None, "application": None}

	fy_start = date(date.today().year, 1, 1)
	fy_end = date(date.today().year, 12, 31)
	if _has_doctype("Leave Allocation"):
		exists = frappe.db.exists(
			"Leave Allocation",
			{"employee": emp, "leave_type": leave_type, "from_date": fy_start, "docstatus": 1},
		)
		if not exists:
			try:
				la = frappe.get_doc(
					{
						"doctype": "Leave Allocation",
						"employee": emp,
						"leave_type": leave_type,
						"from_date": fy_start,
						"to_date": fy_end,
						"new_leaves_allocated": 12,
					}
				)
				la.insert(ignore_permissions=True)
				la.submit()
				out["allocation"] = la.name
			except Exception:
				_log("Zivvy demo-arcade seed: Leave Allocation")

	for marker in (f"{SEED_TAG}-leave-1", "zivvy-demo-arcade-seed-v1-leave-1"):
		if frappe.db.exists("Leave Application", {"description": marker, "employee": emp}):
			out["application"] = "skipped"
			return out

	try:
		app = frappe.get_doc(
			{
				"doctype": "Leave Application",
				"employee": emp,
				"leave_type": leave_type,
				"from_date": add_days(today(), 14),
				"to_date": add_days(today(), 15),
				"description": f"{SEED_TAG}-leave-1",
				"company": ctx["company"],
				"status": "Open",
			}
		)
		app.insert(ignore_permissions=True)
		out["application"] = app.name
	except Exception:
		_log("Zivvy demo-arcade seed: Leave Application")
		out["application"] = "error"
	return out


def _seed_projects(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Project"):
		return {"skipped": "no_Project"}
	created = updated = renamed = 0
	tasks_created = tasks_updated = 0
	for spec in PROJECTS:
		project_name = spec["name"]
		legacy = tuple(spec.get("legacy") or ())
		existing = None
		# Match by project_name field or name
		if frappe.db.exists("Project", {"project_name": project_name, "company": ctx["company"]}):
			existing = frappe.db.get_value(
				"Project", {"project_name": project_name, "company": ctx["company"]}, "name"
			)
		elif frappe.db.exists("Project", project_name):
			existing = project_name
		else:
			for old in legacy:
				if frappe.db.exists("Project", {"project_name": old, "company": ctx["company"]}):
					existing = frappe.db.get_value(
						"Project", {"project_name": old, "company": ctx["company"]}, "name"
					)
					break
				if frappe.db.exists("Project", old):
					existing = old
					break

		customer = spec.get("customer")
		if customer and not frappe.db.exists("Customer", customer):
			customer = None

		if existing:
			doc = frappe.get_doc("Project", existing)
			# Rename project name field; document name may stay
			if doc.project_name != project_name:
				doc.project_name = project_name
				renamed += 1
			doc.status = spec["status"] if spec["status"] in ("Open", "Completed", "Cancelled") else "Open"
			doc.company = ctx["company"]
			if customer:
				doc.customer = customer
			doc.save(ignore_permissions=True)
			updated += 1
			proj_name = doc.name
		else:
			doc = frappe.get_doc(
				{
					"doctype": "Project",
					"project_name": project_name,
					"status": spec["status"]
					if spec["status"] in ("Open", "Completed", "Cancelled")
					else "Open",
					"company": ctx["company"],
					"expected_start_date": add_days(today(), -30),
					"expected_end_date": add_days(today(), 60),
					"customer": customer,
				}
			)
			doc.insert(ignore_permissions=True)
			created += 1
			proj_name = doc.name

		if _has_doctype("Task"):
			task_specs = (
				(f"{project_name} — Discovery", "Open"),
				(f"{project_name} — Delivery", "Completed"),
			)
			# Also refresh legacy task subjects
			legacy_proj = (legacy[0] if legacy else None)
			for i, (subject, status) in enumerate(task_specs, 1):
				existing_task = frappe.db.exists("Task", {"subject": subject, "project": proj_name})
				if not existing_task and legacy_proj:
					legacy_subject = f"{legacy_proj} — {'Discovery' if i == 1 else 'Delivery'}"
					existing_task = frappe.db.exists(
						"Task", {"subject": legacy_subject, "project": proj_name}
					)
				if existing_task:
					t = frappe.get_doc("Task", existing_task)
					t.subject = subject
					t.status = status
					t.company = ctx["company"]
					t.save(ignore_permissions=True)
					tasks_updated += 1
				else:
					t = frappe.get_doc(
						{
							"doctype": "Task",
							"subject": subject,
							"project": proj_name,
							"company": ctx["company"],
							"status": status,
							"priority": "Medium",
							"exp_start_date": add_days(today(), -20),
							"exp_end_date": add_days(today(), 30),
						}
					)
					t.insert(ignore_permissions=True)
					tasks_created += 1

	return {
		"projects_created": created,
		"projects_updated": updated,
		"projects_renamed": renamed,
		"tasks_created": tasks_created,
		"tasks_updated": tasks_updated,
	}


def _seed_bom_and_wo(ctx: dict[str, str]) -> dict[str, Any]:
	"""BOM/WO skipped on Postgres — ERPNext BOM SQL uses ambiguous ORDER BY idx."""
	if not _has_doctype("BOM"):
		return {"skipped": "no_BOM"}
	return {"skipped": "postgres_bom_order_by_idx_ambiguous"}


def _seed_asset(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Asset"):
		return {"skipped": "no_Asset"}
	cat = "Shop Floor Equipment"
	legacy_cat = "DA Equipment"
	if _has_doctype("Asset Category"):
		if frappe.db.exists("Asset Category", legacy_cat) and not frappe.db.exists("Asset Category", cat):
			try:
				frappe.rename_doc("Asset Category", legacy_cat, cat, force=True)
			except Exception:
				cat = legacy_cat
		if not frappe.db.exists("Asset Category", cat):
			try:
				ac = frappe.get_doc(
					{
						"doctype": "Asset Category",
						"asset_category_name": cat,
						"accounts": [
							{
								"company_name": ctx["company"],
								"fixed_asset_account": frappe.db.get_value(
									"Account",
									{"account_name": "Buildings", "company": ctx["company"]},
									"name",
								)
								or frappe.db.get_value(
									"Account",
									{"account_type": "Fixed Asset", "company": ctx["company"], "is_group": 0},
									"name",
								),
								"accumulated_depreciation_account": frappe.db.get_value(
									"Account",
									{
										"account_name": "Accumulated Depreciations",
										"company": ctx["company"],
									},
									"name",
								)
								or frappe.db.get_value(
									"Account",
									{
										"account_type": "Accumulated Depreciation",
										"company": ctx["company"],
										"is_group": 0,
									},
									"name",
								),
								"depreciation_expense_account": frappe.db.get_value(
									"Account",
									{"account_name": "Depreciation", "company": ctx["company"]},
									"name",
								)
								or frappe.db.get_value(
									"Account",
									{
										"account_type": "Depreciation",
										"company": ctx["company"],
										"is_group": 0,
									},
									"name",
								),
							}
						],
					}
				)
				ac.accounts = [r for r in ac.accounts if r.fixed_asset_account]
				if not ac.accounts:
					return {"skipped": "no_fixed_asset_account"}
				ac.insert(ignore_permissions=True)
			except Exception:
				_log("Zivvy demo-arcade seed: Asset Category")
				return {"skipped": "asset_category_failed"}

	asset_name = "Engineering laptop — Alex Morgan"
	legacy_asset = "DA Demo Laptop"
	existing_asset = frappe.db.exists(
		"Asset", {"asset_name": asset_name, "company": ctx["company"]}
	) or frappe.db.exists("Asset", {"asset_name": legacy_asset, "company": ctx["company"]})

	item_code = "DA-ASSET-LAPTOP"
	if not frappe.db.exists("Item", item_code):
		item = frappe.get_doc(
			{
				"doctype": "Item",
				"item_code": item_code,
				"item_name": "Engineering Laptop",
				"item_group": _pick_link("Item Group", ("Products", "All Item Groups")),
				"stock_uom": _pick_link("UOM", ("Nos",)),
				"is_stock_item": 0,
				"is_fixed_asset": 1,
				"asset_category": cat if frappe.db.exists("Asset Category", cat) else None,
				"auto_create_assets": 0,
				"standard_rate": 0,
			}
		)
		_stamp(item, ctx)
		item.insert(ignore_permissions=True)
	else:
		try:
			it = frappe.get_doc("Item", item_code)
			it.item_name = "Engineering Laptop"
			it.save(ignore_permissions=True)
		except Exception:
			pass

	if existing_asset:
		try:
			asset = frappe.get_doc("Asset", existing_asset)
			if asset.docstatus == 0:
				asset.asset_name = asset_name
				asset.save(ignore_permissions=True)
			else:
				frappe.db.set_value(
					"Asset", existing_asset, "asset_name", asset_name, update_modified=False
				)
			return {"updated": existing_asset}
		except Exception as exc:
			return {"skipped": str(exc)[:200]}

	try:
		asset = frappe.get_doc(
			{
				"doctype": "Asset",
				"asset_name": asset_name,
				"item_code": item_code,
				"asset_category": cat if frappe.db.exists("Asset Category", cat) else None,
				"company": ctx["company"],
				"gross_purchase_amount": 1200,
				"purchase_date": add_days(today(), -90),
				"available_for_use_date": add_days(today(), -90),
				"location": None,
				"is_existing_asset": 1,
				"calculate_depreciation": 0,
			}
		)
		if frappe.get_meta("Asset").has_field("location") and _has_doctype("Location"):
			loc = "Demo Arcade HQ"
			legacy_loc = "DA Office"
			if frappe.db.exists("Location", legacy_loc) and not frappe.db.exists("Location", loc):
				try:
					frappe.rename_doc("Location", legacy_loc, loc, force=True)
				except Exception:
					loc = legacy_loc
			if not frappe.db.exists("Location", loc):
				frappe.get_doc({"doctype": "Location", "location_name": loc}).insert(
					ignore_permissions=True
				)
			asset.location = loc
		asset.insert(ignore_permissions=True)
		try:
			asset.submit()
		except Exception:
			pass
		return {"created": asset.name}
	except Exception as exc:
		_log("Zivvy demo-arcade seed: Asset")
		return {"skipped": str(exc)[:200]}


def _seed_quality(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Quality Inspection"):
		return {"skipped": "no_QI"}
	return {"skipped": "qi_requires_reference_document"}


def _seed_helpdesk(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("HD Ticket"):
		return {"skipped": "no_HD_Ticket"}
	return {"skipped": "helpdesk_sla_postgres_bool_bug"}


def _seed_bank_account(ctx: dict[str, str]) -> dict[str, Any]:
	if not _has_doctype("Bank Account"):
		return {"skipped": "no_Bank_Account"}
	account_label = "Operating — Chase"
	legacy_label = "DA Operating"
	name = f"{account_label} - {ctx['abbr']}"
	existing = (
		frappe.db.exists("Bank Account", name)
		or frappe.db.exists("Bank Account", {"account_name": account_label, "company": ctx["company"]})
		or frappe.db.exists("Bank Account", {"account_name": legacy_label, "company": ctx["company"]})
		or frappe.db.exists("Bank Account", f"DA Operating - {ctx['abbr']}")
	)
	bank = _pick_link("Bank", ("Chase", "Bank of America", "HSBC", "N26"))
	gl = frappe.db.get_value("Company", ctx["company"], "default_bank_account") or frappe.db.get_value(
		"Account", {"account_type": "Bank", "company": ctx["company"], "is_group": 0}, "name"
	)
	if not gl:
		parent = frappe.db.get_value(
			"Account",
			{"company": ctx["company"], "account_type": "Bank", "is_group": 1},
			"name",
		) or frappe.db.get_value(
			"Account",
			{"company": ctx["company"], "account_name": "Bank Accounts"},
			"name",
		)
		if parent:
			gl_name = f"Operating Bank - {ctx['abbr']}"
			legacy_gl = f"DA Operating Bank - {ctx['abbr']}"
			if frappe.db.exists("Account", legacy_gl) and not frappe.db.exists("Account", gl_name):
				try:
					frappe.rename_doc("Account", legacy_gl, gl_name, force=True)
				except Exception:
					gl_name = legacy_gl
			if not frappe.db.exists("Account", gl_name):
				acc = frappe.get_doc(
					{
						"doctype": "Account",
						"account_name": "Operating Bank",
						"parent_account": parent,
						"company": ctx["company"],
						"account_type": "Bank",
						"is_group": 0,
						"account_currency": ctx["currency"],
					}
				)
				acc.insert(ignore_permissions=True)
				gl = acc.name
			else:
				gl = gl_name
	if not gl:
		return {"skipped": "no_bank_gl"}
	if existing:
		try:
			ba = frappe.get_doc("Bank Account", existing)
			ba.account_name = account_label
			if bank:
				ba.bank = bank
			ba.save(ignore_permissions=True)
			return {"updated": ba.name}
		except Exception as exc:
			return {"skipped": str(exc)[:200]}
	try:
		ba = frappe.get_doc(
			{
				"doctype": "Bank Account",
				"account_name": account_label,
				"bank": bank,
				"account": gl,
				"company": ctx["company"],
				"is_company_account": 1,
				"is_default": 0,
			}
		)
		ba.insert(ignore_permissions=True)
		return {"created": ba.name}
	except Exception as exc:
		_log("Zivvy demo-arcade seed: Bank Account")
		return {"skipped": str(exc)[:200]}


def _count_snapshot(ctx: dict[str, str]) -> dict[str, int]:
	tenant = ctx["tenant"]
	company = ctx["company"]
	snapshot: dict[str, int] = {}

	def c(doctype: str, filters: dict | None = None) -> int:
		if not _has_doctype(doctype):
			return -1
		try:
			return int(frappe.db.count(doctype, filters or {}) or 0)
		except Exception:
			return -1

	for dt in ("Customer", "Lead", "Supplier", "Item", "Item Price"):
		if frappe.db.has_column(dt, TENANT_FIELD):
			snapshot[dt] = c(dt, {TENANT_FIELD: tenant})
		elif dt == "Item":
			snapshot[dt] = c(dt, {"item_code": ("like", "DA-%")})
		elif dt == "Customer":
			# Count known seeded customers by name
			n = 0
			for spec in CUSTOMERS:
				if frappe.db.exists("Customer", spec["name"]):
					n += 1
				else:
					for leg in spec.get("legacy") or ():
						if frappe.db.exists("Customer", leg):
							n += 1
							break
			snapshot[dt] = n
		elif dt == "Supplier":
			n = 0
			for spec in SUPPLIERS:
				if frappe.db.exists("Supplier", spec["name"]):
					n += 1
				else:
					for leg in spec.get("legacy") or ():
						if frappe.db.exists("Supplier", leg):
							n += 1
							break
			snapshot[dt] = n
		elif dt == "Lead":
			n = 0
			for spec in LEADS:
				if frappe.db.exists("Lead", {"lead_name": spec["lead_name"]}):
					n += 1
			snapshot[dt] = n
		else:
			snapshot[dt] = c(dt)

	for dt in (
		"Quotation",
		"Sales Order",
		"Sales Invoice",
		"Purchase Order",
		"Purchase Receipt",
		"Purchase Invoice",
		"Payment Entry",
		"Stock Entry",
		"Employee",
		"Leave Application",
		"Leave Allocation",
		"Project",
		"Task",
		"BOM",
		"Work Order",
		"Asset",
		"Quality Inspection",
		"Bank Account",
		"Address",
		"Contact",
	):
		if not _has_doctype(dt):
			snapshot[dt] = -1
			continue
		meta = frappe.get_meta(dt)
		if meta.has_field("company"):
			snapshot[dt] = c(dt, {"company": company})
		elif dt in ("Address", "Contact"):
			# Approximate via Dynamic Link to seeded customers/suppliers
			snapshot[dt] = c(dt)
		else:
			snapshot[dt] = c(dt)

	if _has_doctype("HD Ticket"):
		snapshot["HD Ticket"] = c("HD Ticket", {"subject": ("like", f"%{SEED_TAG}%")})

	return snapshot


def _verify_isolation(ctx: dict[str, str]) -> dict[str, Any]:
	"""As demo user, ensure Company list is only Demo Arcade."""
	prev = frappe.session.user
	try:
		frappe.set_user(ctx["email"])
		companies = frappe.get_list("Company", fields=["name"], limit_page_length=50)
		names = [r.name for r in companies]
		customers = frappe.get_list("Customer", fields=["name"], limit_page_length=50)
		cust_names = [r.name for r in customers]
		allowed = set(CUSTOMER_NAMES) | {
			leg for spec in CUSTOMERS for leg in (spec.get("legacy") or ())
		}
		foreign = [n for n in cust_names if n not in allowed and "Demo Arcade" not in n]
		return {
			"companies_visible": names,
			"company_ok": names == [ctx["company"]] or (len(names) == 1 and names[0] == ctx["company"]),
			"customers_visible": len(cust_names),
			"customer_names": cust_names[:10],
			"foreign_looking_customers": foreign[:10],
		}
	finally:
		frappe.set_user(prev)


def seed_demo_arcade_data() -> dict[str, Any]:
	"""Seed realistic Business-tier sample data for demo-arcade. Idempotent."""
	counts: dict[str, Any] = {}

	try:
		counts["masters"] = _ensure_masters()
		frappe.db.commit()
	except Exception as exc:
		try:
			frappe.db.rollback()
		except Exception:
			pass
		_log("Zivvy demo-arcade seed: masters")
		counts["masters"] = {"error": str(exc)[:240]}

	ctx = _resolve_context()
	counts["context"] = {
		"email": ctx["email"],
		"tenant": ctx["tenant"],
		"company": ctx["company"],
		"abbr": ctx["abbr"],
		"story": "US industrial IoT / light manufacturing",
	}

	frappe.flags.ignore_permissions = True
	frappe.flags.zivvy_allow_untenanted = True
	try:
		steps = (
			("customers", lambda: _seed_customers(ctx)),
			("suppliers", lambda: _seed_suppliers(ctx)),
			("leads", lambda: _seed_leads(ctx)),
			("items", lambda: _seed_items(ctx)),
			("opening_stock", lambda: _seed_opening_stock(ctx)),
			("quotation", lambda: _seed_quotation(ctx)),
			("sales_orders", lambda: _seed_sales_orders(ctx)),
			("sales_invoices", lambda: _seed_sales_invoices(ctx)),
			("purchase_orders", lambda: _seed_purchase_orders(ctx)),
			("employees", lambda: _seed_employees(ctx)),
			("leave", lambda: _seed_leave(ctx)),
			("projects", lambda: _seed_projects(ctx)),
			("bom_work_order", lambda: _seed_bom_and_wo(ctx)),
			("asset", lambda: _seed_asset(ctx)),
			("quality", lambda: _seed_quality(ctx)),
			("bank_account", lambda: _seed_bank_account(ctx)),
			("helpdesk", lambda: _seed_helpdesk(ctx)),
		)
		for label, fn in steps:
			_run_step(counts, label, fn)
	finally:
		frappe.flags.ignore_permissions = False
		frappe.flags.zivvy_allow_untenanted = False

	try:
		frappe.db.commit()
	except Exception:
		_log("Zivvy demo-arcade seed: commit")

	counts["snapshot"] = _count_snapshot(ctx)
	counts["isolation"] = _verify_isolation(ctx)
	counts["ok"] = True
	counts["samples"] = {
		"customers": list(CUSTOMER_NAMES),
		"suppliers": list(SUPPLIER_NAMES),
		"leads": [s["lead_name"] for s in LEADS],
		"items": [n for _c, n, *_rest in ITEMS],
		"projects": [p["name"] for p in PROJECTS],
		"employees": [f"{e['first']} {e['last']}" for e in EMPLOYEES],
	}
	counts["re_run"] = (
		"bench --site zivvy.xyz execute "
		"zivvy_brand.setup.seed_demo_arcade_data.seed_demo_arcade_data"
	)
	return counts
