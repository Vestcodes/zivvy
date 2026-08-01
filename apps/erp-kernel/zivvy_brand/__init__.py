__version__ = "1.0.0"

import sys
import types

# ---------------------------------------------------------------------------
# Raven shim: 'raven' (deprecated Sentry SDK) was accidentally added to the
# site's installed_apps list.  Frappe tries to load it on every startup.
# We register mock modules AND patch frappe.get_installed_apps so the stale
# entry is invisible to the framework — no hooks import, no app path lookup.
# ---------------------------------------------------------------------------

_STALE_APPS = frozenset({"raven"})

if "raven" not in sys.modules:
    _m = types.ModuleType("raven")
    _m.__path__ = []
    _m.__file__ = __file__
    _m.__spec__ = None
    _m.__version__ = "0.0.0"
    sys.modules["raven"] = _m

    _h = types.ModuleType("raven.hooks")
    _h.__file__ = __file__
    _h.__spec__ = None
    _h.app_name = "raven"
    _h.app_title = "Raven"
    _h.app_publisher = ""
    _h.app_description = ""
    _h.app_email = ""
    _h.app_license = ""
    sys.modules["raven.hooks"] = _h

    for sub in ("raven.contrib", "raven.contrib.flask", "raven.contrib.django"):
        sm = types.ModuleType(sub)
        sm.__path__ = []
        sys.modules[sub] = sm


def _patch_get_installed_apps():
    """Strip stale apps from frappe.get_installed_apps at the earliest point."""
    try:
        import frappe

        _orig = frappe.get_installed_apps

        def _filtered(*args, **kwargs):
            apps = _orig(*args, **kwargs)
            return [a for a in apps if a not in _STALE_APPS]

        frappe.get_installed_apps = _filtered
    except Exception:
        pass


_patch_get_installed_apps()
