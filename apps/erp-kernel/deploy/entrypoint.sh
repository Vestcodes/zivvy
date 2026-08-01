#!/usr/bin/env bash
# Railway / Docker entrypoint for Zivvy (Frappe + ERPNext + zivvy_brand + product apps).
# Must not run bench as root (bench exits 1). Sites volume may be empty on first boot.
set -euo pipefail

# shellcheck source=/zivvy-apps.sh
source /zivvy-apps.sh

BENCH_DIR="${BENCH_DIR:-/home/frappe/frappe-bench}"
cd "$BENCH_DIR"

PORT="${PORT:-8000}"
export PORT

# Required by frappe.app under gunicorn (defaults to "." → IncorrectSitePath).
export SITES_PATH="${SITES_PATH:-sites}"

DB_TYPE="postgres"
DB_HOST="${DB_HOST:-${PGHOST:-${POSTGRES_HOST:-}}}"
DB_PORT="${DB_PORT:-${PGPORT:-${POSTGRES_PORT:-5432}}}"
REDIS_CACHE_URL="${REDIS_CACHE:-${REDIS_URL:-}}"
REDIS_QUEUE_URL="${REDIS_QUEUE:-${REDIS_URL:-}}"
REDIS_SOCKETIO_URL="${REDIS_SOCKETIO:-${REDIS_QUEUE_URL}}"
SITE_NAME="${FRAPPE_SITE_NAME:-${SITE_NAME:-zivvy.xyz}}"
export SITE_NAME
export FRAPPE_SITE_NAME="${SITE_NAME}"
export DB_TYPE

as_frappe() {
	# shellcheck disable=SC2086
	su -s /bin/bash frappe -c "cd $(printf %q "$BENCH_DIR") && $*"
}

bootstrap_sites_volume() {
	mkdir -p "$BENCH_DIR/sites"
	# Frappe logger defaults to ~/logs (outside the sites volume).
	mkdir -p /home/frappe/logs
	chown -R frappe:frappe /home/frappe/logs
	# Empty Railway volume overlays image sites/ — restore apps.txt + perms.
	ensure_apps_txt "$BENCH_DIR"
	if [[ ! -f sites/common_site_config.json ]]; then
		echo '{}' > sites/common_site_config.json
	fi
	# Per-site logs dir (bench / site logger)
	if [[ -d "sites/${SITE_NAME}" ]]; then
		mkdir -p "sites/${SITE_NAME}/logs" "sites/${SITE_NAME}/locks" "sites/${SITE_NAME}/private/files" "sites/${SITE_NAME}/public/files"
		# Belt-and-suspenders: if SITES_PATH were ever ".", ./<site> must resolve.
		ln -sfn "sites/${SITE_NAME}" "${BENCH_DIR}/${SITE_NAME}"
		chown -h frappe:frappe "${BENCH_DIR}/${SITE_NAME}" || true
	fi
	chown -R frappe:frappe "$BENCH_DIR/sites"
}

# Railway volume mounts over sites/ and hides image-baked assets. Recreate
# sites/assets → apps/*/public symlinks and build zivvy_brand CSS when needed.
#
# Critical: frappe.read_file("assets/assets.json") is cwd-relative to the bench
# root (not sites/). Image ships a stale /home/frappe/frappe-bench/assets without
# zivvy_brand — symlink that path to sites/assets so HTML and nginx agree.
ensure_assets() {
	local assets_dir="$BENCH_DIR/sites/assets"
	mkdir -p "$assets_dir"
	link_app_assets "$BENCH_DIR"

	# Prefer sites/assets as the single source of truth for asset maps + files.
	if [[ -e "$BENCH_DIR/assets" && ! -L "$BENCH_DIR/assets" ]]; then
		rm -rf "$BENCH_DIR/assets"
	fi
	ln -sfn "$assets_dir" "$BENCH_DIR/assets"
	chown -h frappe:frappe "$BENCH_DIR/assets" || true

	local need_build=0
	if [[ ! -f "$assets_dir/assets.json" ]]; then
		need_build=1
	elif ! grep -q 'zivvy.bundle' "$assets_dir/assets.json" 2>/dev/null; then
		need_build=1
	elif [[ ! -d "$BENCH_DIR/apps/zivvy_brand/zivvy_brand/public/dist" ]]; then
		need_build=1
	fi

	if [[ "$need_build" == "1" ]]; then
		echo "Building frontend assets (bench build — zivvy_brand + website CSS)…"
		# Build all installed apps so assets.json maps frappe/erpnext/zivvy hashed bundles.
		as_frappe "bench build" || as_frappe "bench build --app zivvy_brand" || true
	fi

	chown -R frappe:frappe "$assets_dir" || true
}

wait_for_tcp() {
	local host="$1" port="$2" label="$3" tries="${4:-60}"
	echo "Waiting for ${label} at ${host}:${port}…"
	for ((i = 1; i <= tries; i++)); do
		if (echo >/dev/tcp/"${host}/${port}") >/dev/null 2>&1; then
			echo "${label} is reachable"
			return 0
		fi
		sleep 2
	done
	echo "ERROR: timed out waiting for ${label} (${host}:${port})" >&2
	return 1
}

configure_bench() {
	if [[ -n "${DB_HOST}" ]]; then
		as_frappe "bench set-config -g db_host $(printf %q "$DB_HOST")"
		as_frappe "bench set-config -gp db_port $(printf %q "$DB_PORT")"
	fi
	if [[ -n "${REDIS_CACHE_URL}" ]]; then
		as_frappe "bench set-config -g redis_cache $(printf %q "$REDIS_CACHE_URL")"
	fi
	if [[ -n "${REDIS_QUEUE_URL}" ]]; then
		as_frappe "bench set-config -g redis_queue $(printf %q "$REDIS_QUEUE_URL")"
	fi
	if [[ -n "${REDIS_SOCKETIO_URL}" ]]; then
		as_frappe "bench set-config -g redis_socketio $(printf %q "$REDIS_SOCKETIO_URL")"
	fi
}

HEALTH_STUB_PID=""

start_health_stub() {
	# Temporary listener so Railway healthchecks pass during long site create.
	# ONLY /api/method/ping returns pong — never rewrite / or other paths to ping.
	echo "Starting temporary health stub on 0.0.0.0:${PORT} (ping path only)"
	PORT="$PORT" /home/frappe/frappe-bench/env/bin/python - <<'PY' &
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

port = int(os.environ.get("PORT", "8000"))

SETUP_HTML = b"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Zivvy</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;
background:linear-gradient(160deg,#0f172a,#1e293b);color:#e2e8f0}
main{max-width:28rem;padding:2rem;text-align:center}
h1{font-size:1.75rem;letter-spacing:-0.02em;margin:0 0 .75rem}
p{margin:0;color:#94a3b8;line-height:1.5}
</style></head><body><main>
<h1>Zivvy</h1>
<p>We&rsquo;re finishing first-time setup. The site will be ready shortly.</p>
</main></body></html>
"""

class Handler(BaseHTTPRequestHandler):
	def _send(self, code, content_type, body):
		self.send_response(code)
		self.send_header("Content-Type", content_type)
		self.send_header("Content-Length", str(len(body)))
		self.send_header("Cache-Control", "no-store")
		self.end_headers()
		self.wfile.write(body)

	def do_GET(self):
		path = urlparse(self.path).path.rstrip("/") or "/"
		if path == "/api/method/ping":
			self._send(200, "application/json", b'{"message":"pong"}')
			return
		# Never leak ping/pong onto / or marketing routes.
		self._send(503, "text/html; charset=utf-8", SETUP_HTML)

	def do_HEAD(self):
		self.do_GET()

	def log_message(self, fmt, *args):
		return

HTTPServer(("0.0.0.0", port), Handler).serve_forever()
PY
	HEALTH_STUB_PID=$!
}

stop_health_stub() {
	if [[ -n "${HEALTH_STUB_PID}" ]] && kill -0 "${HEALTH_STUB_PID}" 2>/dev/null; then
		echo "Stopping temporary health stub (pid ${HEALTH_STUB_PID})"
		kill "${HEALTH_STUB_PID}" 2>/dev/null || true
		wait "${HEALTH_STUB_PID}" 2>/dev/null || true
		HEALTH_STUB_PID=""
	fi
}

maybe_create_site() {
	local site_cfg="sites/${SITE_NAME}/site_config.json"
	local force="${FORCE_RECREATE_SITE:-0}"

	local admin_pw="${ADMIN_PASSWORD:-${RFP_SITE_ADMIN_PASSWORD:-}}"
	local db_root_pw="${POSTGRES_ROOT_PASSWORD:-${POSTGRES_PASSWORD:-${DB_PASSWORD:-}}}"
	local db_root_user="${DB_ROOT_USER:-${POSTGRES_USER:-${DB_USER:-postgres}}}"

	if [[ "${force}" == "1" || "${force}" == "true" ]]; then
		echo "FORCE_RECREATE_SITE=1 — removing site ${SITE_NAME} (files + DB)"
		if [[ -n "${db_root_pw}" ]]; then
			as_frappe "bench drop-site $(printf %q "$SITE_NAME") \
				--force --no-backup \
				--db-root-username=$(printf %q "$db_root_user") \
				--db-root-password=$(printf %q "$db_root_pw")" || true
		fi
		rm -rf "sites/${SITE_NAME}"
		chown -R frappe:frappe sites
		export FORCE_RECREATE_SITE=1
	elif [[ -f "${site_cfg}" ]]; then
		echo "Site ${SITE_NAME} already present"
		# Keep Railway healthchecks green during long migrate (ping path only).
		start_health_stub
		trap stop_health_stub EXIT
		as_frappe "bench --site $(printf %q "$SITE_NAME") migrate" || true
		install_site_apps "$SITE_NAME"
		as_frappe "bench set-config -g default_site $(printf %q "$SITE_NAME")" || true
		as_frappe "./env/bin/python -c $(printf %q "import frappe; frappe.init(site='${SITE_NAME}', sites_path='sites'); frappe.connect(); frappe.db.set_single_value('Website Settings', 'home_page', 'home'); frappe.db.commit()")" || true
		stop_health_stub
		trap - EXIT
		printf '%s\n' "${SITE_NAME}" > sites/currentsite.txt
		chown frappe:frappe sites/currentsite.txt
		as_frappe "bench set-config -gp dns_multitenant 0" || true
		ln -sfn "sites/${SITE_NAME}" "${BENCH_DIR}/${SITE_NAME}"
		chown -h frappe:frappe "${BENCH_DIR}/${SITE_NAME}" || true
		return 0
	fi

	# Auto-create when credentials exist unless explicitly disabled.
	local auto="${AUTO_CREATE_SITE:-1}"
	if [[ "${auto}" == "0" || "${auto}" == "false" ]]; then
		echo "WARNING: site missing and AUTO_CREATE_SITE=${auto} — skipping bootstrap"
		return 0
	fi

	if [[ -z "${admin_pw}" || -z "${db_root_pw}" ]]; then
		echo "ERROR: Site ${SITE_NAME} missing. Set ADMIN_PASSWORD and POSTGRES_PASSWORD (or POSTGRES_ROOT_PASSWORD / DB_PASSWORD) for first boot." >&2
		return 1
	fi

	start_health_stub
	trap stop_health_stub EXIT
	echo "Creating site ${SITE_NAME} (this can take several minutes)…"
	if ! /railway-setup.sh; then
		# Prefer serving the real site (even partial) over leaving the health stub on :$PORT.
		if [[ -f "sites/${SITE_NAME}/site_config.json" ]]; then
			echo "WARNING: railway-setup.sh failed but site files exist — continuing to Gunicorn" >&2
		else
			stop_health_stub
			trap - EXIT
			echo "ERROR: site bootstrap failed and no site_config.json present" >&2
			return 1
		fi
	fi
	stop_health_stub
	trap - EXIT
	printf '%s\n' "${SITE_NAME}" > sites/currentsite.txt
	chown frappe:frappe sites/currentsite.txt
	as_frappe "bench set-config -gp dns_multitenant 0" || true
	mkdir -p "sites/${SITE_NAME}/logs"
	ln -sfn "sites/${SITE_NAME}" "${BENCH_DIR}/${SITE_NAME}"
	chown -h frappe:frappe "${BENCH_DIR}/${SITE_NAME}" || true
}

bootstrap_sites_volume
ensure_assets

if [[ -n "${DB_HOST}" ]]; then
	wait_for_tcp "${DB_HOST}" "${DB_PORT}" "PostgreSQL" 90
fi

configure_bench
maybe_create_site
# Site create / migrate may touch assets; re-link after volume work.
ensure_assets

echo "Starting processes on 0.0.0.0:${PORT}"
exec "$@"
