# Zivvy production image — Frappe/ERPNext **backend** + `zivvy_brand` overlay
# Frontend UX: ../zivvy-web (Next.js). Do not bake product SPAs into this image.
#
#   docker build -f deploy/Dockerfile -t zivvy:latest .
#
# Railway: set service root / Dockerfile path to this file, or `railway up` from repo root.

ARG ERPNEXT_VERSION=v15
FROM frappe/erpnext:${ERPNEXT_VERSION}

USER root

# Force `RUN` to use bash — Railway's Metal builder ships dash as /bin/sh,
# and dash doesn't grok `set -euo pipefail`. Every RUN below assumes bash
# semantics (arrays, brace expansion, indirect expansion).
SHELL ["/bin/bash", "-c"]

RUN apt-get update \
	&& apt-get install -y --no-install-recommends supervisor nginx gettext-base git build-essential python3-dev \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /var/log/supervisor /etc/supervisor/conf.d \
	&& rm -f /etc/nginx/sites-enabled/default

COPY deploy/supervisord.conf /etc/supervisor/conf.d/zivvy.conf
COPY deploy/nginx.conf.template /etc/nginx/nginx.conf.template
COPY deploy/entrypoint.sh /entrypoint.sh
COPY deploy/railway-setup.sh /railway-setup.sh
COPY deploy/run-gunicorn.sh /run-gunicorn.sh
COPY deploy/zivvy-apps.sh /zivvy-apps.sh
RUN chmod +x /entrypoint.sh /railway-setup.sh /run-gunicorn.sh /zivvy-apps.sh

# Brand overlay + backend apps only (HRMS, payments, ecommerce sync, banking).
# No crm/helpdesk/insights/wiki/webshop SPAs — those belong in zivvy-web.
COPY --chown=frappe:frappe . /tmp/zivvy_brand_src
RUN set -euo pipefail \
	&& . /zivvy-apps.sh \
	&& mkdir -p /home/frappe/frappe-bench/apps \
	&& rm -rf /home/frappe/frappe-bench/apps/zivvy_brand \
	&& cp -a /tmp/zivvy_brand_src /home/frappe/frappe-bench/apps/zivvy_brand \
	&& for spec in "${ZIVVY_CLONE_SPECS[@]}"; do \
		app="${spec%%|*}"; rest="${spec#*|}"; url="${rest%%|*}"; branch="${rest##*|}"; \
		rm -rf "/home/frappe/frappe-bench/apps/${app}"; \
		git clone --depth 1 --branch "${branch}" "${url}" "/home/frappe/frappe-bench/apps/${app}"; \
	done \
	&& rm -rf /tmp/zivvy_brand_src \
	&& chown -R frappe:frappe /home/frappe/frappe-bench/apps

USER frappe
WORKDIR /home/frappe/frappe-bench

# Editable installs + apps.txt; bench build when Node is available in the image.
RUN set -euo pipefail \
	&& . /zivvy-apps.sh \
	&& ./env/bin/pip install --no-cache-dir -e apps/zivvy_brand \
	&& for spec in "${ZIVVY_CLONE_SPECS[@]}"; do \
		app="${spec%%|*}"; \
		./env/bin/pip install --no-cache-dir -e "apps/${app}"; \
	done \
	&& ensure_apps_txt /home/frappe/frappe-bench \
	&& (./env/bin/bench build || echo "WARNING: bench build failed in image build — entrypoint will retry")

USER root
ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
