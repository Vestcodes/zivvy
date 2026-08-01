#!/usr/bin/env bash
# Shared Zivvy bench app inventory — BACKEND ONLY.
# Frontend UX lives in ../zivvy-web (Next.js). Do not add Vue/React product SPAs here.
# Order matters for install-app: dependencies before dependents.

# shellcheck disable=SC2034
# NOTE: install order matters. Dependencies must come before dependents:
#   payments      → webshop, ecommerce_integrations
#   telephony     → helpdesk (voice / call popup)
#   erpnext       → hrms, banking, webshop (all lean on ERPNext core)
ZIVVY_CORE_APPS=(
	frappe
	erpnext
	zivvy_brand
	banking
	hrms
	payments
	telephony
	crm
	wiki
	helpdesk
	insights
	ecommerce_integrations
	webshop
)

# Apps cloned into the image. ERPNext is overridden from the Vestcodes fork
# (branding, Postgres compat, banking fixes); the base image's copy is replaced.
# Format: "app_name|git_url|branch"
#
# The Frappe product apps (crm/wiki/helpdesk/insights/webshop/telephony)
# are bundled here so their DocTypes + REST APIs land on the site. We do NOT
# render their Vue/React SPAs — customer-facing UI lives in ../zivvy-web
# (Next.js) and hits Frappe's DocType APIs directly. The Frappe desk still
# has their JS bundles available for admins signing into /app/*.
ZIVVY_CLONE_SPECS=(
	"erpnext|https://github.com/Vestcodes/erpnext.git|develop"
	"banking|https://github.com/alyf-de/banking.git|version-15"
	"hrms|https://github.com/frappe/hrms.git|version-15"
	"payments|https://github.com/frappe/payments.git|version-15"
	"telephony|https://github.com/frappe/telephony.git|develop"
	"crm|https://github.com/frappe/crm.git|main"
	"wiki|https://github.com/frappe/wiki.git|master"
	"helpdesk|https://github.com/frappe/helpdesk.git|main"
	"insights|https://github.com/frappe/insights.git|main"
	"ecommerce_integrations|https://github.com/frappe/ecommerce_integrations.git|version-15"
	"webshop|https://github.com/frappe/webshop.git|version-15"
)

# Public asset package dirs under apps/<name>/<pkg>/public (API/assets only)
ZIVVY_ASSET_LINKS=(
	"frappe:frappe"
	"erpnext:erpnext"
	"zivvy_brand:zivvy_brand"
	"banking:banking"
	"hrms:hrms"
	"payments:payments"
	"telephony:telephony"
	"crm:crm"
	"wiki:wiki"
	"helpdesk:helpdesk"
	"insights:insights"
	"ecommerce_integrations:ecommerce_integrations"
	"webshop:webshop"
)

ensure_apps_txt() {
	local bench_dir="${1:-.}"
	local apps_txt="${bench_dir}/sites/apps.txt"
	mkdir -p "${bench_dir}/sites"
	if [[ ! -f "${apps_txt}" ]] || ! grep -qxF frappe "${apps_txt}" 2>/dev/null; then
		printf '%s\n' "${ZIVVY_CORE_APPS[@]}" > "${apps_txt}"
		return 0
	fi
	local app
	for app in "${ZIVVY_CORE_APPS[@]}"; do
		if [[ -d "${bench_dir}/apps/${app}" ]] && ! grep -qxF "${app}" "${apps_txt}" 2>/dev/null; then
			echo "${app}" >> "${apps_txt}"
		fi
	done
	# Remove stale apps that are no longer in ZIVVY_CORE_APPS and have no
	# directory on disk (e.g. raven after removal).
	local tmp_txt
	tmp_txt=$(mktemp)
	while IFS= read -r app || [[ -n "$app" ]]; do
		app="${app// /}"
		[[ -z "$app" ]] && continue
		if printf '%s\n' "${ZIVVY_CORE_APPS[@]}" | grep -qxF "$app"; then
			echo "$app" >> "$tmp_txt"
		elif [[ -d "${bench_dir}/apps/${app}" ]]; then
			echo "$app" >> "$tmp_txt"
		else
			echo "Removing stale app from apps.txt: ${app}"
		fi
	done < "$apps_txt"
	mv "$tmp_txt" "$apps_txt"
}

link_app_assets() {
	local bench_dir="${1:-.}"
	local assets_dir="${bench_dir}/sites/assets"
	mkdir -p "${assets_dir}"
	local spec app pkg
	for spec in "${ZIVVY_ASSET_LINKS[@]}"; do
		app="${spec%%:*}"
		pkg="${spec##*:}"
		if [[ -d "${bench_dir}/apps/${app}/${pkg}/public" ]]; then
			ln -sfn "${bench_dir}/apps/${app}/${pkg}/public" "${assets_dir}/${pkg}"
		fi
	done
}

install_site_apps() {
	local site_name="$1"
	local app
	# Order matters — see ZIVVY_CORE_APPS comment. Payments before webshop so
	# webshop's Razorpay/Stripe adapters resolve their imports; telephony
	# before helpdesk so the call-popup form registers cleanly.
	for app in \
		zivvy_brand banking hrms payments telephony \
		crm wiki helpdesk insights \
		ecommerce_integrations webshop
	do
		if [[ -d "apps/${app}" ]]; then
			as_frappe "bench --site $(printf %q "$site_name") install-app ${app}" || true
		fi
	done
}
