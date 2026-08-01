# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_FREE, normalize_tier


class ZivvyTenant(Document):
	def before_insert(self):
		if not self.created:
			self.created = now_datetime()
		self.plan = normalize_tier(self.plan)
		if not self.seat_limit:
			self.seat_limit = DEFAULT_SEAT_CAPS.get(self.plan, DEFAULT_SEAT_CAPS[TIER_FREE])
		if not self.status:
			self.status = "trial"
		if not self.subscription_status:
			self.subscription_status = "none"

	def validate(self):
		self.plan = normalize_tier(self.plan)
		slug = (self.slug or "").strip().lower()
		self.slug = slug
		if not slug:
			frappe.throw(frappe._("Slug is required"))
		# Keep autoname == slug
		if self.name and self.name != slug and not self.is_new():
			# Renames are disallowed (allow_rename=0); still normalize on create
			pass
