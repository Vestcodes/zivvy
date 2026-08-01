# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import json

import frappe
from frappe.model.document import Document


class ZivvyAddon(Document):
	def validate(self):
		slug = (self.slug or "").strip().lower()
		self.slug = slug
		if not slug:
			frappe.throw(frappe._("Slug is required"))

		self._validate_json_list("doctypes_unlocked")
		self._validate_json_list("modules_unlocked")

	def _validate_json_list(self, fieldname: str):
		raw = (getattr(self, fieldname, None) or "").strip()
		if not raw:
			return
		try:
			data = json.loads(raw)
		except Exception:
			frappe.throw(frappe._("{0} must be a JSON array").format(fieldname))
			return
		if not isinstance(data, list):
			frappe.throw(frappe._("{0} must be a JSON array").format(fieldname))
		for item in data:
			if not isinstance(item, str):
				frappe.throw(frappe._("{0} entries must be strings").format(fieldname))

	def get_doctypes_unlocked(self) -> list[str]:
		return _parse_json_list(self.doctypes_unlocked)

	def get_modules_unlocked(self) -> list[str]:
		return _parse_json_list(self.modules_unlocked)


def _parse_json_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	raw = raw.strip()
	if not raw:
		return []
	try:
		data = json.loads(raw)
	except Exception:
		return []
	if not isinstance(data, list):
		return []
	return [str(x) for x in data if isinstance(x, str)]
