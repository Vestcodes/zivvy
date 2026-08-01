# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

import frappe

no_cache = 1


def get_context(context):
	frappe.local.flags.redirect_location = "/"
	raise frappe.Redirect
