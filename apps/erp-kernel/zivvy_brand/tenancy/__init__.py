# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Company-per-tenant multi-tenancy for Zivvy (Phase 1).

Phase 1 (this module): one Railway site (`zivvy.xyz`), isolated via
Zivvy Tenant → Company + User Permissions.

Phase 2 (future): site-per-tenant benches — see TENANCY.md / DEPLOY.md.
"""

from __future__ import annotations

TENANT_DOCTYPE = "Zivvy Tenant"
TENANT_FIELD = "zivvy_tenant"
