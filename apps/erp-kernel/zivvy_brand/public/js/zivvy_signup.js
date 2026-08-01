/*!
 * Zivvy signup — require datacenter + optional company; pass to sign_up.
 * Patches Frappe login.js without replacing the whole login bundle.
 */
(function () {
	"use strict";

	var SIGN_UP_METHODS = {
		"frappe.core.doctype.user.user.sign_up": true,
		"zivvy_brand.auth.signup.sign_up": true,
	};

	function normalizeDatacenter(raw) {
		var code = String(raw || "")
			.trim()
			.toLowerCase()
			.replace(/[_-]+/g, " ");
		if (!code) {
			return "";
		}
		var aliases = {
			in: "india",
			ind: "india",
			india: "india",
			eu: "eu",
			europe: "eu",
			us: "us",
			usa: "us",
			"united states": "us",
		};
		var normalized = aliases[code] || code;
		return normalized === "india" || normalized === "eu" || normalized === "us"
			? normalized
			: "";
	}

	function selectedDatacenter() {
		var form =
			document.querySelector("form.form-signup") ||
			document.querySelector(".form-signup");
		var el = form
			? form.querySelector('input[name="zivvy_datacenter"]:checked')
			: document.querySelector('input[name="zivvy_datacenter"]:checked');
		return normalizeDatacenter(el && el.value);
	}

	function companyName() {
		var form =
			document.querySelector("form.form-signup") ||
			document.querySelector(".form-signup");
		var el = form
			? form.querySelector('input[name="company_name"], #signup_company')
			: document.querySelector('input[name="company_name"], #signup_company');
		return el && el.value ? String(el.value).trim() : "";
	}

	function ensureDatacenterDefault(form) {
		form =
			form ||
			document.querySelector("form.form-signup") ||
			document.querySelector(".form-signup");
		if (!form) {
			return;
		}
		var selected = form.querySelector('input[name="zivvy_datacenter"]:checked');
		if (selected) {
			return;
		}
		var fallback =
			form.querySelector('input[name="zivvy_datacenter"][value="india"]') ||
			form.querySelector('input[name="zivvy_datacenter"]');
		if (fallback) {
			fallback.checked = true;
		}
	}

	function isSignUpCall(opts) {
		opts = opts || {};
		var method = opts.method || "";
		var cmd = (opts.args && opts.args.cmd) || "";
		return !!(SIGN_UP_METHODS[method] || SIGN_UP_METHODS[cmd]);
	}

	function ensureField() {
		var form =
			document.querySelector("form.form-signup") ||
			document.querySelector(".form-signup");
		if (!form) {
			return;
		}
		var actions = form.querySelector(".page-card-actions");

		if (!form.querySelector(".zivvy-company-field")) {
			var companyWrap = document.createElement("div");
			companyWrap.className = "form-group zivvy-company-field";
			companyWrap.innerHTML =
				'<label class="form-label" for="signup_company">Company</label>' +
				'<input type="text" id="signup_company" name="company_name" ' +
				'class="form-control" placeholder="Your company name" autocomplete="organization">' +
				'<p class="text-muted" style="font-size:12px;margin-top:4px;">Creates your private workspace (tenant). Optional — defaults from your name.</p>';
			if (actions && actions.parentNode) {
				actions.parentNode.insertBefore(companyWrap, actions);
			} else {
				form.appendChild(companyWrap);
			}
		}

		if (form.querySelector(".zivvy-datacenter-field")) {
			ensureDatacenterDefault(form);
			return;
		}
		var wrap = document.createElement("div");
		wrap.className = "form-group zivvy-datacenter-field";
		wrap.innerHTML =
			'<label class="form-label" for="signup_datacenter">Datacenter</label>' +
			'<div class="zivvy-datacenter-options" role="radiogroup" aria-required="true">' +
			'<label class="zivvy-datacenter-option"><input type="radio" name="zivvy_datacenter" value="india" checked required><span>India</span></label>' +
			'<label class="zivvy-datacenter-option"><input type="radio" name="zivvy_datacenter" value="eu" required><span>EU</span></label>' +
			'<label class="zivvy-datacenter-option"><input type="radio" name="zivvy_datacenter" value="us" required><span>US</span></label>' +
			"</div>" +
			'<p class="zivvy-datacenter-help text-muted">Pick your preferred data region. This setting is saved to your workspace profile.</p>';
		if (actions && actions.parentNode) {
			actions.parentNode.insertBefore(wrap, actions);
		} else {
			form.appendChild(wrap);
		}
		ensureDatacenterDefault(form);
	}

	function patchFrappeCall() {
		if (!window.frappe || typeof frappe.call !== "function" || frappe.call.__zivvyDatacenter) {
			return;
		}
		var original = frappe.call;
		frappe.call = function (opts) {
			opts = opts || {};
			if (isSignUpCall(opts)) {
				ensureField();
				var dc = selectedDatacenter();
				if (!dc) {
					if (typeof frappe.msgprint === "function") {
						frappe.msgprint({
							title: __("Datacenter required"),
							message: __(
								"Please choose a datacenter (India, EU, or US)."
							),
							indicator: "orange",
						});
					}
					if (opts.btn && opts.btn.prop) {
						opts.btn.prop("disabled", false);
					}
					if (window.login && typeof login.set_status === "function") {
						login.set_status(__("Sign up"), "blue");
					}
					return $.Deferred().reject().promise();
				}
				opts.args = opts.args || {};
				opts.args.zivvy_datacenter = dc;
				var co = companyName();
				if (co) {
					opts.args.company_name = co;
				}
			}
			return original.call(this, opts);
		};
		frappe.call.__zivvyDatacenter = true;
	}

	function boot() {
		ensureField();
		patchFrappeCall();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
	setTimeout(boot, 0);
	setTimeout(boot, 250);
})();
