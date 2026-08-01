# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Polar webhook receiver — Standard Webhooks signature verification."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import time
from typing import Any

import frappe
from frappe import _

from zivvy_brand.billing.polar_client import get_polar_config
from zivvy_brand.billing.subscription import tier_for_product_id
from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_FREE


@frappe.whitelist(allow_guest=True, methods=["POST"])
def polar_webhook():
	"""
	Webhook URL (register in Polar dashboard):

	  https://<site>/api/method/zivvy_brand.billing.webhooks.polar_webhook

	Subscribe at least to:
	  subscription.created, subscription.updated, subscription.active,
	  subscription.canceled, subscription.revoked, order.paid
	"""
	cfg = get_polar_config()
	raw = frappe.request.get_data(as_text=False) or b""
	headers = {k.lower(): v for k, v in frappe.request.headers.items()}

	if not cfg.get("webhook_secret"):
		frappe.log_error(
			"Polar webhook received but POLAR_WEBHOOK_SECRET / Polar Settings secret is unset",
			"Zivvy Polar Webhook",
		)
		frappe.local.response["http_status_code"] = 503
		return {"ok": False, "error": "webhook_secret_not_configured"}

	try:
		verify_standard_webhook(raw, headers, cfg["webhook_secret"])
	except WebhookVerificationError as e:
		frappe.local.response["http_status_code"] = 403
		return {"ok": False, "error": str(e)}

	try:
		event = json.loads(raw.decode("utf-8"))
	except Exception:
		frappe.local.response["http_status_code"] = 400
		return {"ok": False, "error": "invalid_json"}

	event_type = event.get("type") or event.get("event") or ""
	data = event.get("data") or {}

	try:
		_handle_event(event_type, data)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy Polar Webhook Handler")
		# Return 202 so Polar does not disable the endpoint for app bugs;
		# inspect Error Log and redeliver from Polar if needed.
		frappe.local.response["http_status_code"] = 202
		return {"ok": False, "error": "handler_error"}

	frappe.local.response["http_status_code"] = 202
	return {"ok": True, "type": event_type}


class WebhookVerificationError(Exception):
	pass


def verify_standard_webhook(payload: bytes, headers: dict, secret: str, *, tolerance: int = 300):
	"""Validate Polar / Standard Webhooks signatures.

	See https://www.standardwebhooks.com/ and Polar webhook docs.
	Secret may be plain or `whsec_` + base64url.
	"""
	headers_lc = {str(k).lower(): v for k, v in (headers or {}).items()}
	msg_id = headers_lc.get("webhook-id") or headers_lc.get("svix-id")
	timestamp = headers_lc.get("webhook-timestamp") or headers_lc.get("svix-timestamp")
	signature_header = headers_lc.get("webhook-signature") or headers_lc.get("svix-signature")

	if not msg_id or not timestamp or not signature_header:
		_log_signature_metadata(
			reason="missing_signature_headers",
			headers_lc=headers_lc,
			payload_len=len(payload or b""),
			secret_mode="unavailable",
			secret_len=0,
			candidate_count=0,
			candidate_lengths=[],
		)
		raise WebhookVerificationError("missing_signature_headers")

	try:
		ts = int(timestamp)
	except ValueError as e:
		_log_signature_metadata(
			reason="invalid_timestamp",
			headers_lc=headers_lc,
			payload_len=len(payload or b""),
			secret_mode="unavailable",
			secret_len=0,
			candidate_count=0,
			candidate_lengths=[],
		)
		raise WebhookVerificationError("invalid_timestamp") from e

	if abs(time.time() - ts) > tolerance:
		_log_signature_metadata(
			reason="timestamp_out_of_tolerance",
			headers_lc=headers_lc,
			payload_len=len(payload or b""),
			secret_mode="unavailable",
			secret_len=0,
			candidate_count=0,
			candidate_lengths=[],
			age_seconds=round(time.time() - ts, 3),
			tolerance=tolerance,
		)
		raise WebhookVerificationError("timestamp_out_of_tolerance")

	signed = f"{msg_id}.{timestamp}.".encode("utf-8") + payload
	secret_keys = _secret_key_candidates(secret)
	candidates = _extract_signature_candidates(str(signature_header or ""))
	for secret_mode, key in secret_keys:
		digest = hmac.new(key, signed, hashlib.sha256).digest()
		expected_std = base64.b64encode(digest).decode("utf-8")
		expected_url = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
		for candidate in candidates:
			clean = candidate.strip()
			if not clean:
				continue
			decoded = _try_decode_base64_bytes(clean)
			if decoded is not None and hmac.compare_digest(digest, decoded):
				return
			if hmac.compare_digest(expected_std, clean):
				return
			if hmac.compare_digest(expected_url, clean.rstrip("=")):
				return

	_log_signature_metadata(
		reason="invalid_signature",
		headers_lc=headers_lc,
		payload_len=len(payload or b""),
		secret_mode="|".join(mode for mode, _ in secret_keys),
		secret_len=max((len(key) for _, key in secret_keys), default=0),
		candidate_count=len(candidates),
		candidate_lengths=sorted({len(c) for c in candidates if c})[:8],
		content_type=str(headers_lc.get("content-type") or ""),
		signature_header_len=len(str(signature_header or "")),
		content_encoding=str(headers_lc.get("content-encoding") or ""),
	)
	# Keep API stable: callers currently inspect invalid_signature.
	raise WebhookVerificationError("invalid_signature")


def _extract_signature_candidates(signature_header: str) -> list[str]:
	"""Extract v1 signatures from Standard Webhooks header variants.

	Examples seen in the wild:
	- "v1,<sig>"
	- "v1,<sig1> v1,<sig2>"
	- "v1,<sig1>,v1,<sig2>"
	"""
	header = (signature_header or "").strip()
	if not header:
		return []

	versioned = re.findall(r"(?:^|[\s,])v1[=,]([^,\s]+)", header)
	if versioned:
		return [s.strip() for s in versioned if s and s.strip()]

	# Fallback for non-versioned or atypical formats.
	raw = [p.strip() for p in re.split(r"[\s,]+", header) if p and p.strip()]
	return [p for p in raw if not re.fullmatch(r"v\d+", p)]


def _secret_key_candidates(secret: str) -> list[tuple[str, bytes]]:
	"""Build acceptable secret-key derivations for provider compatibility.

	- raw_literal: use secret exactly as configured (current Polar behavior).
	- prefixed_base64: Standard Webhooks canonical derivation for whsec_*
	"""
	secret = (secret or "").strip()
	out: list[tuple[str, bytes]] = [("raw_literal", secret.encode("utf-8"))]

	for prefix in ("whsec_", "polar_whs_", "polar_whsec_"):
		if secret.startswith(prefix):
			encoded = secret[len(prefix) :]
			decoded = _try_decode_base64_bytes(encoded)
			if decoded is not None:
				out.append(("prefixed_base64", decoded))
			break

	# Deduplicate by key bytes while preserving order.
	seen: set[bytes] = set()
	deduped: list[tuple[str, bytes]] = []
	for mode, key in out:
		if key in seen:
			continue
		seen.add(key)
		deduped.append((mode, key))
	return deduped


def _try_decode_base64_bytes(value: str) -> bytes | None:
	"""Decode standard or URL-safe base64, with implicit padding."""
	if not value:
		return b""
	text = (value or "").strip()
	if not text:
		return b""
	padding = "=" * (-len(text) % 4)
	padded = text + padding
	try:
		return base64.urlsafe_b64decode(padded.encode("utf-8"))
	except Exception:
		pass
	try:
		return base64.b64decode(padded.encode("utf-8"), validate=True)
	except Exception:
		return None


def _log_signature_metadata(
	*,
	reason: str,
	headers_lc: dict[str, Any],
	payload_len: int,
	secret_mode: str,
	secret_len: int,
	candidate_count: int,
	candidate_lengths: list[int],
	**extra,
) -> None:
	"""Log safe signature-debug metadata without exposing secrets/signatures."""
	meta = {
		"reason": reason,
		"payload_len": int(payload_len or 0),
		"has_webhook_id": bool(headers_lc.get("webhook-id")),
		"has_webhook_timestamp": bool(headers_lc.get("webhook-timestamp")),
		"has_webhook_signature": bool(headers_lc.get("webhook-signature")),
		"has_svix_id": bool(headers_lc.get("svix-id")),
		"has_svix_timestamp": bool(headers_lc.get("svix-timestamp")),
		"has_svix_signature": bool(headers_lc.get("svix-signature")),
		"secret_mode": secret_mode,
		"secret_len": int(secret_len or 0),
		"candidate_count": int(candidate_count or 0),
		"candidate_lengths": candidate_lengths or [],
	}
	meta.update(extra or {})
	try:
		frappe.log_error(
			title="Zivvy Polar Webhook Signature",
			message=json.dumps(meta, sort_keys=True),
		)
	except Exception:
		# Signature failures should never crash request handling.
		pass


def _resolve_tenant_from_event(data: dict[str, Any]) -> str | None:
	"""Find Zivvy Tenant from Polar metadata / customer / subscription ids."""
	import frappe

	meta = data.get("metadata") or {}
	if isinstance(meta, dict):
		tid = meta.get("zivvy_tenant") or meta.get("tenant") or meta.get("tenant_id")
		if tid and frappe.db.exists("Zivvy Tenant", tid):
			return tid

	customer = data.get("customer") or {}
	customer_id = customer.get("id") or data.get("customer_id")
	if customer_id:
		name = frappe.db.get_value("Zivvy Tenant", {"polar_customer_id": customer_id}, "name")
		if name:
			return name

	subscription_id = data.get("id") if "subscription" in (data.get("type") or "") else data.get("id")
	# For subscription events, id is the subscription
	sub_id = data.get("id")
	if sub_id:
		name = frappe.db.get_value("Zivvy Tenant", {"polar_subscription_id": sub_id}, "name")
		if name:
			return name

	# external_id on customer
	ext = None
	if isinstance(customer, dict):
		ext = customer.get("external_id") or customer.get("externalId")
	if ext and frappe.db.exists("Zivvy Tenant", ext):
		return ext
	return None


def _apply_update(*, tenant_name: str | None = None, raw_event: str | None = None, **kwargs):
	"""Write Polar sync to tenant when known; also keep site Single as ops fallback."""
	from zivvy_brand.billing.subscription import apply_subscription_update
	from zivvy_brand.tenancy.provision import apply_tenant_subscription_update

	if tenant_name:
		apply_tenant_subscription_update(tenant_name, **kwargs)
		return
	apply_subscription_update(raw_event=raw_event, **kwargs)


def _handle_event(event_type: str, data: dict[str, Any]):
	tenant_name = _resolve_tenant_from_event(data)
	if event_type.startswith("subscription."):
		_sync_from_subscription(data, event_type, tenant_name=tenant_name)
	elif event_type == "order.paid":
		product = data.get("product") or {}
		product_id = product.get("id") or data.get("product_id")
		customer = data.get("customer") or {}
		meta = data.get("metadata") or {}
		meta_tier = ""
		if isinstance(meta, dict):
			meta_tier = str(meta.get("tier") or meta.get("zivvy_tier") or "").strip().lower()
		if meta_tier in ("pro", "business"):
			tier = meta_tier
		else:
			tier = tier_for_product_id(product_id)
		if tier:
			seats = _extract_seats(data)
			_apply_update(
				tenant_name=tenant_name,
				tier=tier,
				status="active",
				seats_allowed=seats,
				polar_customer_id=customer.get("id"),
				product_id=product_id,
				raw_event=event_type if not tenant_name else None,
			)
	elif event_type == "checkout.updated":
		# Guard against premature upgrades: checkout.updated can fire while the
		# checkout is still open (before payment / subscription activation).
		# We only trust order.paid + subscription.* for entitlement changes.
		status = (data.get("status") or "").strip().lower()
		if status not in {"succeeded", "completed", "confirmed"}:
			return
		product = data.get("product") or {}
		product_id = product.get("id") or data.get("product_id")
		customer = data.get("customer") or {}
		meta = data.get("metadata") or {}
		meta_tier = ""
		if isinstance(meta, dict):
			meta_tier = str(meta.get("tier") or meta.get("zivvy_tier") or "").strip().lower()
		if meta_tier in ("pro", "business"):
			tier = meta_tier
		else:
			tier = tier_for_product_id(product_id)
		if tier:
			seats = _extract_seats(data)
			_apply_update(
				tenant_name=tenant_name,
				tier=tier,
				status="active",
				seats_allowed=seats,
				polar_customer_id=customer.get("id"),
				product_id=product_id,
				raw_event=event_type if not tenant_name else None,
			)


def _sync_from_subscription(data: dict[str, Any], event_type: str, *, tenant_name: str | None = None):
	status = (data.get("status") or "").lower()
	product = data.get("product") or {}
	product_id = product.get("id") or data.get("product_id")
	customer = data.get("customer") or {}
	customer_id = customer.get("id") or data.get("customer_id")
	subscription_id = data.get("id")
	seats = _extract_seats(data)
	period_end = data.get("current_period_end") or data.get("ends_at")
	cancel_at_period_end = bool(data.get("cancel_at_period_end"))

	# Self-serve tier checkout attaches ``metadata.tier`` (pro / business) so we
	# can resolve tier even when Polar Settings does not yet know the product id.
	# Add-ons live in a different flow (``metadata.addon_slug``) — do not confuse
	# the two: an addon subscription with no tier metadata should short-circuit
	# to the seat-tier product-id lookup, not upsert Zivvy Subscription with a
	# tier it does not carry.
	meta = data.get("metadata") or {}
	if not isinstance(meta, dict):
		meta = {}
	meta_tier = str(meta.get("tier") or meta.get("zivvy_tier") or "").strip().lower()
	if meta_tier in ("pro", "business"):
		tier = meta_tier
	else:
		tier = tier_for_product_id(product_id)
	# Re-resolve if metadata arrived on nested checkout
	if not tenant_name:
		tenant_name = _resolve_tenant_from_event(data)

	if event_type in ("subscription.canceled", "subscription.revoked") or status in (
		"canceled",
		"cancelled",
		"revoked",
		"incomplete_expired",
	):
		_apply_update(
			tenant_name=tenant_name,
			tier=TIER_FREE,
			status=status or "canceled",
			seats_allowed=DEFAULT_SEAT_CAPS[TIER_FREE],
			polar_subscription_id=subscription_id,
			polar_customer_id=customer_id,
			product_id=product_id,
			current_period_end=period_end,
			cancel_at_period_end=cancel_at_period_end,
			raw_event=event_type if not tenant_name else None,
		)
		return

	if not tier:
		_apply_update(
			tenant_name=tenant_name,
			status=status or "active",
			seats_allowed=seats,
			polar_subscription_id=subscription_id,
			polar_customer_id=customer_id,
			product_id=product_id,
			current_period_end=period_end,
			cancel_at_period_end=cancel_at_period_end,
			raw_event=event_type if not tenant_name else None,
		)
		frappe.log_error(
			f"Polar product {product_id} not mapped to Pro/Business in Polar Settings",
			"Zivvy Polar Product Map",
		)
		return

	_apply_update(
		tenant_name=tenant_name,
		tier=tier,
		status=status or "active",
		seats_allowed=seats,
		polar_subscription_id=subscription_id,
		polar_customer_id=customer_id,
		product_id=product_id,
		current_period_end=period_end,
		cancel_at_period_end=cancel_at_period_end,
		raw_event=event_type if not tenant_name else None,
	)


def _extract_seats(data: dict) -> int | None:
	for key in ("seats", "seat_count", "quantity"):
		if data.get(key) is not None:
			try:
				return max(1, int(data[key]))
			except (TypeError, ValueError):
				pass
	# Nested prices / items
	items = data.get("items") or []
	if items and isinstance(items, list):
		try:
			return max(1, int(items[0].get("quantity") or items[0].get("seats") or 1))
		except Exception:
			pass
	return None
