"""
Developer settings API — webhook and event management from the SaaS dashboard.
Called by zivvy-web's Settings > Developer page.
"""

from __future__ import annotations

import json

import frappe
from frappe import _


@frappe.whitelist()
def list_webhooks() -> list[dict]:
	"""List webhook subscriptions for the current user's tenant."""
	tenant = _get_tenant()
	if not tenant:
		return []

	return frappe.get_all(
		"Zivvy Webhook",
		filters={"zivvy_tenant": tenant},
		fields=[
			"name", "url", "label", "events", "enabled",
			"last_status", "total_deliveries", "creation",
		],
		order_by="creation desc",
		limit_page_length=50,
	)


@frappe.whitelist()
def create_webhook(url: str, label: str = "", events: str = "*") -> dict:
	"""Create a webhook subscription."""
	tenant = _get_tenant()
	if not tenant:
		frappe.throw(_("No tenant found for current user"))

	if not url.startswith("https://"):
		if not (url.startswith("http://localhost") or url.startswith("http://127.0.0.1")):
			frappe.throw(_("Webhook URL must use HTTPS"))

	event_list = [e.strip() for e in events.split(",") if e.strip()]
	if not event_list:
		event_list = ["*"]

	doc = frappe.get_doc({
		"doctype": "Zivvy Webhook",
		"url": url,
		"label": label,
		"events": json.dumps(event_list),
		"zivvy_tenant": tenant,
		"enabled": 1,
	}).insert(ignore_permissions=True)

	return {"name": doc.name, "url": doc.url, "label": doc.label}


@frappe.whitelist()
def delete_webhook(webhook_name: str) -> dict:
	"""Delete a webhook subscription."""
	tenant = _get_tenant()
	doc = frappe.get_doc("Zivvy Webhook", webhook_name)
	if doc.zivvy_tenant != tenant:
		frappe.throw(_("Webhook not found"), frappe.DoesNotExistError)

	frappe.delete_doc("Zivvy Webhook", webhook_name, ignore_permissions=True)
	return {"ok": True}


@frappe.whitelist()
def list_events() -> list[dict]:
	"""List recent events for the current user's tenant."""
	tenant = _get_tenant()
	if not tenant:
		return []

	return frappe.get_all(
		"Zivvy Event Log",
		filters={"zivvy_tenant": tenant},
		fields=["name", "event_type", "resource", "resource_name", "creation"],
		order_by="creation desc",
		limit_page_length=100,
	)


def _get_tenant() -> str | None:
	"""Resolve the current user's tenant."""
	user = frappe.session.user
	if not user or user == "Guest":
		return None

	try:
		from zivvy_brand.tenancy.context import get_user_tenant_name
		return get_user_tenant_name(user)
	except Exception:
		return None
