from __future__ import annotations

import frappe
from frappe.utils import cint

_REQUIRED_SETUP_APPS = ("frappe", "erpnext", "zivvy_brand")


def ensure_saas_setup_complete() -> dict:
	"""Mark setup complete for SaaS desks (wizard should never trap tenant users)."""
	changed = {
		"system_settings": False,
		"installed_apps": [],
	}

	# Legacy guard: some flows still read System Settings.setup_complete.
	lang = frappe.db.get_single_value("System Settings", "language") or "en"
	tz = frappe.db.get_single_value("System Settings", "time_zone") or "Asia/Kolkata"
	if not cint(frappe.db.get_single_value("System Settings", "setup_complete")):
		frappe.db.set_single_value(
			"System Settings",
			{
				"setup_complete": 1,
				"language": lang,
				"time_zone": tz,
			},
			update_modified=False,
		)
		changed["system_settings"] = True

	# Primary guard on modern Frappe: frappe.is_setup_complete() checks Installed Application.
	if frappe.db.exists("DocType", "Installed Application"):
		rows = frappe.get_all(
			"Installed Application",
			filters={"app_name": ["in", list(_REQUIRED_SETUP_APPS)]},
			fields=["name", "app_name", "is_setup_complete"],
		)
		for row in rows:
			if cint(row.get("is_setup_complete")):
				continue
			frappe.db.set_value(
				"Installed Application",
				row["name"],
				"is_setup_complete",
				1,
				update_modified=False,
			)
			changed["installed_apps"].append(row["app_name"])

	return changed
