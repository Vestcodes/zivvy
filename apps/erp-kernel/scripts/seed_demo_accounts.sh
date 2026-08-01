#!/usr/bin/env bash
# Idempotent demo account seed for Zivvy (run on the bench host).
# Usage:
#   bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts
# Or:
#   ./scripts/seed_demo_accounts.sh [site]
#
# Railway (IMPORTANT): `su` drops env unless you forward DEMO_*_PASSWORD.
# Prefer:
#   railway ssh -s web -- bash -lc \
#     'su -s /bin/bash frappe -c "cd /home/frappe/frappe-bench && \
#      DEMO_FREE_PASSWORD=\"$DEMO_FREE_PASSWORD\" \
#      DEMO_PRO_PASSWORD=\"$DEMO_PRO_PASSWORD\" \
#      DEMO_BUSINESS_PASSWORD=\"$DEMO_BUSINESS_PASSWORD\" \
#      bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts"'
set -euo pipefail
SITE="${1:-zivvy.xyz}"
echo "Seeding demo accounts on site: ${SITE}"
if [[ -z "${DEMO_BUSINESS_PASSWORD:-}" && -z "${DEMO_FREE_PASSWORD:-}" && -z "${DEMO_PRO_PASSWORD:-}" ]]; then
  echo "WARN: DEMO_*_PASSWORD unset in this shell; seed will use/generate site_config demo_password_*." >&2
fi
bench --site "$SITE" execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts
echo "Done. Passwords from DEMO_*_PASSWORD env or site_config demo_password_* (see DEPLOY.md)."
