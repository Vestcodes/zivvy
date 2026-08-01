# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe import _
from frappe.model.document import Document

from zivvy_brand.tenancy.context import get_user_tenant_name, is_ops_user


class ZivvyRoleTemplate(Document):
	def before_insert(self):
		self._stamp_tenant()

	def validate(self):
		self._validate_roles()
		self._validate_unique_name_per_tenant()
		if self.is_default:
			self._clear_other_defaults()

	def _stamp_tenant(self):
		if frappe.flags.in_install or frappe.flags.in_migrate:
			return
		user = frappe.session.user
		tenant = get_user_tenant_name(user)
		if tenant:
			self.zivvy_tenant = tenant
		elif not is_ops_user(user):
			frappe.throw(
				_("Cannot create a role template without a workspace."),
				frappe.PermissionError,
			)

	def _validate_roles(self):
		from zivvy_brand.tenants.api import ASSIGNABLE_ROLES

		seen = set()
		for row in self.roles:
			if row.role not in ASSIGNABLE_ROLES:
				frappe.throw(
					_("Role {0} is not assignable by tenant admins.").format(row.role),
				)
			if row.role in seen:
				frappe.throw(_("Duplicate role: {0}").format(row.role))
			seen.add(row.role)

	def _validate_unique_name_per_tenant(self):
		if not self.zivvy_tenant or not self.template_name:
			return
		existing = frappe.db.exists(
			"Zivvy Role Template",
			{
				"zivvy_tenant": self.zivvy_tenant,
				"template_name": self.template_name,
				"name": ("!=", self.name),
			},
		)
		if existing:
			frappe.throw(
				_("A template named {0} already exists in your workspace.").format(
					self.template_name
				),
			)

	def _clear_other_defaults(self):
		if not self.zivvy_tenant:
			return
		others = frappe.get_all(
			"Zivvy Role Template",
			filters={
				"zivvy_tenant": self.zivvy_tenant,
				"is_default": 1,
				"name": ("!=", self.name),
			},
			pluck="name",
		)
		for name in others:
			frappe.db.set_value(
				"Zivvy Role Template", name, "is_default", 0, update_modified=False
			)
