#!/usr/bin/env bash
# One-shot site bootstrap for Railway (also called from entrypoint on first boot).
set -euo pipefail

# shellcheck source=/zivvy-apps.sh
source /zivvy-apps.sh

BENCH_DIR="${BENCH_DIR:-/home/frappe/frappe-bench}"
cd "$BENCH_DIR"

SITE_NAME="${FRAPPE_SITE_NAME:-${SITE_NAME:-zivvy.xyz}}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-${RFP_SITE_ADMIN_PASSWORD:-}}"
DB_TYPE="postgres"
DB_ROOT_PASSWORD="${POSTGRES_ROOT_PASSWORD:-${POSTGRES_PASSWORD:-${DB_PASSWORD:-}}}"
DB_ROOT_USER="${DB_ROOT_USER:-${POSTGRES_USER:-${DB_USER:-postgres}}}"
DB_HOST="${DB_HOST:-${PGHOST:-127.0.0.1}}"
DB_PORT="${DB_PORT:-${PGPORT:-5432}}"
HOST_NAME="${SITE_URL:-https://zivvy.xyz}"

as_frappe() {
	su -s /bin/bash frappe -c "cd $(printf %q "$BENCH_DIR") && $*"
}

ensure_site_defaults() {
	# currentsite + default_site so bench helpers resolve; nginx sets X-Frappe-Site-Name for Host aliases.
	printf '%s\n' "${SITE_NAME}" > sites/currentsite.txt
	chown frappe:frappe sites/currentsite.txt
	as_frappe "bench set-config -g default_site $(printf %q "$SITE_NAME")" || true
	as_frappe "bench set-config -gp dns_multitenant 0" || true
	as_frappe "bench --site $(printf %q "$SITE_NAME") set-config host_name $(printf %q "$HOST_NAME")" || true
	# Website home → Zivvy marketing (also seeded by zivvy_brand.after_install / after_migrate)
	as_frappe "./env/bin/python -c $(printf %q "import frappe; frappe.init(site='${SITE_NAME}', sites_path='sites'); frappe.connect(); frappe.db.set_single_value('Website Settings', 'home_page', 'home'); frappe.db.commit(); print('home_page=home')")" || true
	as_frappe "bench --site $(printf %q "$SITE_NAME") clear-cache" || true
}

if [[ -z "${ADMIN_PASSWORD}" ]]; then
	echo "ERROR: Set ADMIN_PASSWORD (Administrator password for new site)." >&2
	exit 1
fi

if [[ -z "${DB_ROOT_PASSWORD}" ]]; then
	echo "ERROR: Set POSTGRES_PASSWORD / POSTGRES_ROOT_PASSWORD / DB_PASSWORD for PostgreSQL root access." >&2
	exit 1
fi

# Volume may be empty — ensure apps list exists before new-site / migrate.
mkdir -p sites
ensure_apps_txt "$BENCH_DIR"
chown -R frappe:frappe sites

if [[ -f "sites/${SITE_NAME}/site_config.json" ]]; then
	echo "Site ${SITE_NAME} already exists — migrate + install apps if needed"
	as_frappe "bench --site $(printf %q "$SITE_NAME") migrate" || true
	as_frappe "bench --site $(printf %q "$SITE_NAME") install-app erpnext" || true
	install_site_apps "$SITE_NAME"
	ensure_site_defaults
	exit 0
fi

# --force replaces an orphan DB left by a previous interrupted bootstrap
FORCE_ARG=""
if [[ "${FORCE_RECREATE_SITE:-0}" == "1" || "${FORCE_RECREATE_SITE:-0}" == "true" ]]; then
	FORCE_ARG="--force"
fi

echo "Creating site ${SITE_NAME}…"
as_frappe "bench new-site $(printf %q "$SITE_NAME") \
	--db-type=postgres \
	--db-host=$(printf %q "$DB_HOST") \
	--db-port=$(printf %q "$DB_PORT") \
	--admin-password=$(printf %q "$ADMIN_PASSWORD") \
	--db-root-username=$(printf %q "$DB_ROOT_USER") \
	--db-root-password=$(printf %q "$DB_ROOT_PASSWORD") \
	${FORCE_ARG} \
	--install-app erpnext \
	--set-default"

install_site_apps "$SITE_NAME"
ensure_site_defaults

echo "Site ${SITE_NAME} ready."
echo "Polar webhook: ${HOST_NAME}/api/method/zivvy_brand.billing.webhooks.polar_webhook"
