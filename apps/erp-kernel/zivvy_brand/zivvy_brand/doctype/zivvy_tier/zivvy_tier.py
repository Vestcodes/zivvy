# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe.model.document import Document


class ZivvyTier(Document):
	def validate(self):
		slug = (self.slug or "").strip().lower()
		self.slug = slug
		if slug not in ("pro", "business"):
			frappe.throw(frappe._("Slug must be 'pro' or 'business'"))
		if not (self.title or "").strip():
			frappe.throw(frappe._("Title is required"))
