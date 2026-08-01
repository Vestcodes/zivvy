#!/usr/bin/env bash
# Launch Gunicorn with SITES_PATH=sites (frappe.app reads it at import time).
set -euo pipefail
cd /home/frappe/frappe-bench
export SITES_PATH="${SITES_PATH:-sites}"
export HOME="${HOME:-/home/frappe}"
exec /home/frappe/frappe-bench/env/bin/gunicorn \
	-b 127.0.0.1:8001 \
	-w "${GUNICORN_WORKERS:-2}" \
	-t "${GUNICORN_TIMEOUT:-120}" \
	--threads "${GUNICORN_THREADS:-4}" \
	frappe.app:application
