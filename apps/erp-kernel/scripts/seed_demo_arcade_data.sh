#!/usr/bin/env bash
# Idempotent Business-tier sample data for demo@zivvy.xyz / demo-arcade.
# Usage:
#   bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_arcade_data.seed_demo_arcade_data
# Or:
#   ./scripts/seed_demo_arcade_data.sh [site]
#
# Railway:
#   railway ssh -s web -- bash -lc \
#     'su -s /bin/bash frappe -c "cd /home/frappe/frappe-bench && \
#      bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_arcade_data.seed_demo_arcade_data"'
set -euo pipefail
SITE="${1:-zivvy.xyz}"
echo "Seeding demo-arcade sample data on site: ${SITE}"
bench --site "$SITE" execute zivvy_brand.setup.seed_demo_arcade_data.seed_demo_arcade_data
echo "Done."
