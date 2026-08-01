# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class ZivvyTenantAddon(Document):
	def before_insert(self):
		if not self.status:
			self.status = "trialing"
		if not self.quantity:
			self.quantity = 1
		if not self.current_period_start:
			self.current_period_start = now_datetime()

	def on_update(self):
		# Invalidate per-request cache so gating picks up changes immediately
		if hasattr(frappe.local, "zivvy_tenant_addons"):
			try:
				delattr(frappe.local, "zivvy_tenant_addons")
			except Exception:
				pass
		if hasattr(frappe.local, "zivvy_tenant_addon_doctypes"):
			try:
				delattr(frappe.local, "zivvy_tenant_addon_doctypes")
			except Exception:
				pass

	def mark_cancelled(self):
		self.status = "cancelled"
		if not self.cancelled_at:
			self.cancelled_at = now_datetime()
		self.save(ignore_permissions=True)
