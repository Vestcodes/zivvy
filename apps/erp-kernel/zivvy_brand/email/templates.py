"""
Branded email HTML shell for outbound transactional mail — welcome, invite,
password reset, etc.

Inlines the emerald Zivvy mark as SVG so we don't depend on the site's
brand-image asset (which historically drifted from the frontend palette
and left the old magenta logo in customer inboxes).

Everything caller-supplied is HTML-escaped by frappe.utils.escape_html
before interpolation. Never pass raw user input into the shell.
"""

from __future__ import annotations

import frappe

# Emerald mark — matches the frontend icon.svg exactly (linear gradient
# #3db892 → #1b9872, white "Z"). Kept as a self-contained SVG so email
# clients that block remote images still render it.
ZIVVY_LOGO_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 32 32" style="display:block;">
  <defs>
    <linearGradient id="zg" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3db892"/>
      <stop offset="1" stop-color="#1b9872"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#zg)"/>
  <text x="16" y="22" text-anchor="middle" font-family="-apple-system, Segoe UI, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Z</text>
</svg>
""".strip()

_FOOTER_HTML = """
<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8edec;color:#5a687c;font-size:12px;line-height:1.6;">
	<div style="margin-bottom:6px;">
		<a href="https://zivvy.xyz" style="color:#178262;text-decoration:none;">zivvy.xyz</a>
		&nbsp;·&nbsp;
		<a href="https://zivvy.xyz/terms" style="color:#5a687c;text-decoration:none;">Terms</a>
		&nbsp;·&nbsp;
		<a href="https://zivvy.xyz/privacy" style="color:#5a687c;text-decoration:none;">Privacy</a>
		&nbsp;·&nbsp;
		<a href="mailto:contact@vestcodes.com" style="color:#5a687c;text-decoration:none;">contact@vestcodes.com</a>
	</div>
	<div style="color:#8b96a8;">Vestcodes · You're receiving this because you signed up for Zivvy.</div>
</div>
""".strip()


def wrap(inner_html: str, preheader: str = "") -> str:
	"""Wrap the given HTML content in the branded Zivvy shell.

	`preheader` is a preview line shown by most inbox clients next to the
	subject; keep it short and honest ("Set your password to activate your
	Zivvy workspace" beats "Welcome!"). Included as a display:none div so
	only the preview reads it, not the message body.
	"""
	preheader_html = (
		f'<div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">{frappe.utils.escape_html(preheader)}</div>'
		if preheader
		else ""
	)

	return f"""<!doctype html>
<html>
	<body style="margin:0;padding:0;background:#f7f8f8;font-family:-apple-system,Segoe UI,sans-serif;color:#0f1729;">
		{preheader_html}
		<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
			<div style="display:inline-block;margin-bottom:24px;">{ZIVVY_LOGO_SVG}</div>
			<div style="background:#ffffff;border:1px solid #e8edec;border-radius:12px;padding:32px 28px;font-size:15px;line-height:1.6;">
				{inner_html}
			</div>
			{_FOOTER_HTML}
		</div>
	</body>
</html>""".strip()


def cta_button(label: str, href: str) -> str:
	"""Emerald primary CTA button — bulletproof HTML for old Outlook."""
	safe_label = frappe.utils.escape_html(label)
	return f"""
<div style="margin:24px 0;">
	<a href="{href}" style="display:inline-block;padding:12px 22px;background:linear-gradient(180deg,#22c393,#1b9872);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
		{safe_label}
	</a>
</div>
<div style="color:#5a687c;font-size:13px;line-height:1.5;">
	Or paste this link into your browser:<br/>
	<a href="{href}" style="color:#178262;word-break:break-all;">{href}</a>
</div>
""".strip()
