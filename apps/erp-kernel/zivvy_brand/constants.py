# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Production brand + domain defaults for Zivvy by Vestcodes."""

PRODUCTION_HOST = "zivvy.xyz"
PRODUCTION_ORIGIN = "https://zivvy.xyz"
WWW_ORIGIN = "https://www.zivvy.xyz"

PRODUCT_NAME = "Zivvy"
PRODUCT_LOCKUP = "Zivvy"
LEGAL_ENTITY = "Vestcodes Co"
CONTACT_EMAIL = "contact@vestcodes.com"
COMPANY_SITE = "https://vestcodes.com"

# Polar checkout / portal return defaults (absolute production URLs)
POLAR_SUCCESS_URL = f"{PRODUCTION_ORIGIN}/app/billing"
POLAR_CANCEL_URL = f"{PRODUCTION_ORIGIN}/pricing"
POLAR_WEBHOOK_PATH = "/api/method/zivvy_brand.billing.webhooks.polar_webhook"
POLAR_WEBHOOK_URL = f"{PRODUCTION_ORIGIN}{POLAR_WEBHOOK_PATH}"

# Seat products (USD cents) — used by setup_polar_products
# Annual = round(monthly × 0.8) per seat / month, billed yearly (20% off).
POLAR_PRO_NAME = "Zivvy Pro"
POLAR_BUSINESS_NAME = "Zivvy Business"
POLAR_PRO_ANNUAL_NAME = "Zivvy Pro Annual"
POLAR_BUSINESS_ANNUAL_NAME = "Zivvy Business Annual"
POLAR_PRO_PRICE_CENTS = 1800  # $18 / seat / month
POLAR_BUSINESS_PRICE_CENTS = 3000  # $30 / seat / month
POLAR_PRO_ANNUAL_PRICE_CENTS = 16800  # $168 / seat / year ($14/mo equiv)
POLAR_BUSINESS_ANNUAL_PRICE_CENTS = 28800  # $288 / seat / year ($24/mo equiv)
POLAR_ANNUAL_DISCOUNT = 0.20

# ActimiXYZ partner coupon (Polar discounts; codes are unique per org).
# Monthly: fixed $5 USD / ₹429.83 forever → $30 → $25 (code redeemable on Polar).
# Annual: 10% forever on Business Annual (no Polar code — same string mapped in checkout API).
ACTIMI_COUPON_CODE = "ActimiXYZ"
ACTIMI_BUSINESS_MONTHLY_DISCOUNT_ID = "e9f5f06b-1f3b-4f17-9dcd-c8c240c35fb0"
ACTIMI_BUSINESS_ANNUAL_DISCOUNT_ID = "3d7b40da-3188-46a0-b2ee-8bef51e576de"

# ActimiTrial — Polar promo code (no app mapping; enter on Polar checkout).
# 100% once on Business monthly → first invoice $0, then normal $30/seat/mo.
ACTIMI_TRIAL_CODE = "ActimiTrial"
ACTIMI_TRIAL_DISCOUNT_ID = "9033b3d4-fb15-48bd-b84c-f1248c2cbd2d"

# Resend SMTP (https://resend.com/docs/send-with-smtp)
RESEND_SMTP_SERVER = "smtp.resend.com"
RESEND_SMTP_PORT = 465
RESEND_SMTP_USER = "resend"
RESEND_ACCOUNT_NAME = "Zivvy"
DEFAULT_RESEND_FROM_EMAIL = "Zivvy <noreply@zivvy.xyz>"
FALLBACK_RESEND_FROM_EMAIL = f"Zivvy <{CONTACT_EMAIL}>"
