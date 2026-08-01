# Zivvy Full User QA Report

**Date:** 2026-07-26T03:24:19.826Z → 2026-07-26T03:29:09.572Z
**Base:** https://zivvy.xyz
**Account:** demo@zivvy.xyz (Business)
**Verdict: PASS WITH ISSUES**

## 1. Summary

- Checks: 105 (pass 38, warn 61, fail 6)
- Bugs: 5 (critical 0, high 5, medium 0, low 0)
- Console errors captured: 525
- Notable network failures (4xx/5xx on zivvy): 524

### By section

- **marketing**: 14 pass / 0 warn / 4 fail (of 18)
- **auth**: 4 pass / 0 warn / 1 fail (of 5)
- **app**: 17 pass / 61 warn / 1 fail (of 79)
- **mobile**: 3 pass / 0 warn / 0 fail (of 3)

## 2. What was tested

- [x] Marketing pages: /, /pricing, /product-tour, /solutions, /compare, /features, /about, /contact, /blog, /resources, /integrations, /terms, /privacy, /cookies, /acceptable-use, /www
- [x] Homepage nav mega-menus + HeroVideoDialog attempt + CTAs
- [x] Auth: signup tab, update-password, wrong password, Business login, logout, session reload
- [x] App modules (65 routes from launcher/sidebar inventory)
- [x] Light detail open on sample lists; create/cancel on sample lists
- [x] Billing plan context, search/awesomebar, notifications (if present)
- [x] Mobile viewport: marketing nav + login + sidebar
- [x] Console errors + failed network logging

## 3. Bugs found

### 1. [HIGH] Marketing page broken: Solutions

- **URL:** https://zivvy.xyz/solutions
- **Steps:** Navigate to https://zivvy.xyz/solutions
- **Expected:** Page loads with content
- **Actual:** status=200 blank=false error=true
- **Screenshot:** `e2e-screenshots/full-qa/marketing-fail-Solutions.png`

### 2. [HIGH] Marketing page broken: Blog

- **URL:** https://zivvy.xyz/blog
- **Steps:** Navigate to https://zivvy.xyz/blog
- **Expected:** Page loads with content
- **Actual:** status=200 blank=false error=true
- **Screenshot:** `e2e-screenshots/full-qa/marketing-fail-Blog.png`

### 3. [HIGH] Marketing page broken: WWW redirect

- **URL:** https://zivvy.xyz/
- **Steps:** Navigate to https://zivvy.xyz/www
- **Expected:** Page loads with content
- **Actual:** status=200 blank=false error=false
- **Screenshot:** `e2e-screenshots/full-qa/marketing-fail-WWW_redirect.png`

### 4. [HIGH] App screen issue: Messages

- **URL:** https://zivvy.xyz/messages
- **Steps:** Login as Business demo → Open /messages
- **Expected:** Module loads without blank/error/incorrect plan gate
- **Actual:** HTTP 404
- **Screenshot:** `e2e-screenshots/full-qa/app-fail-workspace-Messages.png`

### 5. [HIGH] Logout did not clear session

- **URL:** https://zivvy.xyz/dashboard
- **Steps:** Log out → Visit /dashboard
- **Expected:** Redirect to /login
- **Actual:** /dashboard
- **Screenshot:** `e2e-screenshots/full-qa/logout-session-not-cleared.png`

## 4. Screenshots

- `e2e-screenshots/full-qa/marketing-fail-Solutions.png`
- `e2e-screenshots/full-qa/marketing-fail-Blog.png`
- `e2e-screenshots/full-qa/marketing-fail-WWW_redirect.png`
- `e2e-screenshots/full-qa/auth-signup-tab.png`
- `e2e-screenshots/full-qa/auth-business-login.png`
- `e2e-screenshots/full-qa/app-billing-business.png`
- `e2e-screenshots/full-qa/app-fail-workspace-Dashboard.png`
- `e2e-screenshots/full-qa/app-fail-workspace-Messages.png`
- `e2e-screenshots/full-qa/app-fail-workspace-Apps_launcher.png`
- `e2e-screenshots/full-qa/app-fail-crm-CRM_Leads.png`
- `e2e-screenshots/full-qa/app-detail-CRM_Leads.png`
- `e2e-screenshots/full-qa/app-fail-crm-CRM_Opportunities.png`
- `e2e-screenshots/full-qa/app-fail-sales-Customers.png`
- `e2e-screenshots/full-qa/app-detail-Customers.png`
- `e2e-screenshots/full-qa/app-fail-sales-Quotations.png`
- `e2e-screenshots/full-qa/app-fail-sales-Sales_orders.png`
- `e2e-screenshots/full-qa/app-fail-sales-Invoices.png`
- `e2e-screenshots/full-qa/app-detail-Invoices.png`
- `e2e-screenshots/full-qa/app-fail-sales-Deliveries.png`
- `e2e-screenshots/full-qa/app-fail-pos-POS_invoices.png`
- `e2e-screenshots/full-qa/app-fail-pos-POS_profiles.png`
- `e2e-screenshots/full-qa/app-fail-pos-POS_opening.png`
- `e2e-screenshots/full-qa/app-fail-pos-POS_closing.png`
- `e2e-screenshots/full-qa/app-fail-procurement-Suppliers.png`
- `e2e-screenshots/full-qa/app-fail-procurement-RFQs.png`
- `e2e-screenshots/full-qa/app-fail-procurement-Purchase_orders.png`
- `e2e-screenshots/full-qa/app-fail-procurement-Purchase_invoices.png`
- `e2e-screenshots/full-qa/app-fail-stock-Items.png`
- `e2e-screenshots/full-qa/app-detail-Items.png`
- `e2e-screenshots/full-qa/app-fail-stock-Stock_entries.png`
- `e2e-screenshots/full-qa/app-fail-stock-Reorder.png`
- `e2e-screenshots/full-qa/app-fail-stock-Barcode_scan.png`
- `e2e-screenshots/full-qa/app-fail-shipping-Shipments.png`
- `e2e-screenshots/full-qa/app-fail-shipping-Parcels.png`
- `e2e-screenshots/full-qa/app-fail-shipping-Shipping_rules.png`
- `e2e-screenshots/full-qa/app-fail-shipping-Carriers.png`
- `e2e-screenshots/full-qa/app-fail-finance-Payments.png`
- `e2e-screenshots/full-qa/app-fail-finance-Journal_entries.png`
- `e2e-screenshots/full-qa/app-fail-finance-Reports.png`
- `e2e-screenshots/full-qa/app-fail-hr-Employees.png`
- `e2e-screenshots/full-qa/app-detail-Employees.png`
- `e2e-screenshots/full-qa/app-fail-hr-Time_off.png`
- `e2e-screenshots/full-qa/app-fail-hr-Attendance.png`
- `e2e-screenshots/full-qa/app-fail-hr-Shifts.png`
- `e2e-screenshots/full-qa/app-fail-hr-Payroll.png`
- `e2e-screenshots/full-qa/app-fail-hr-Expenses.png`
- `e2e-screenshots/full-qa/app-fail-hr-Loans.png`
- `e2e-screenshots/full-qa/app-fail-hr-Onboarding.png`
- `e2e-screenshots/full-qa/app-fail-talent-Job_openings.png`
- `e2e-screenshots/full-qa/app-fail-talent-Applicants.png`
- `e2e-screenshots/full-qa/app-fail-talent-Interviews.png`
- `e2e-screenshots/full-qa/app-fail-talent-Appraisals.png`
- `e2e-screenshots/full-qa/app-fail-talent-Goals.png`
- `e2e-screenshots/full-qa/app-fail-talent-Training.png`
- `e2e-screenshots/full-qa/app-fail-manufacturing-BOMs.png`
- `e2e-screenshots/full-qa/app-detail-BOMs.png`
- `e2e-screenshots/full-qa/app-fail-manufacturing-Work_orders.png`
- `e2e-screenshots/full-qa/app-fail-manufacturing-Job_cards.png`
- `e2e-screenshots/full-qa/app-fail-manufacturing-Subcontracting.png`
- `e2e-screenshots/full-qa/app-fail-assets-Assets.png`
- `e2e-screenshots/full-qa/app-fail-assets-Maintenance.png`
- `e2e-screenshots/full-qa/app-fail-assets-Movements.png`
- `e2e-screenshots/full-qa/app-fail-assets-Depreciation.png`
- `e2e-screenshots/full-qa/app-fail-projects-Projects.png`
- `e2e-screenshots/full-qa/app-detail-Projects.png`
- `e2e-screenshots/full-qa/app-fail-projects-Tasks.png`
- `e2e-screenshots/full-qa/app-fail-projects-Timesheets.png`
- `e2e-screenshots/full-qa/app-fail-support-Tickets.png`
- `e2e-screenshots/full-qa/app-fail-support-Issues.png`
- `e2e-screenshots/full-qa/app-fail-support-Warranty.png`
- `e2e-screenshots/full-qa/app-fail-support-SLAs.png`
- `e2e-screenshots/full-qa/app-fail-setup-Team.png`
- `e2e-screenshots/full-qa/app-fail-setup-Billing.png`
- `e2e-screenshots/full-qa/app-fail-setup-Settings.png`
- `e2e-screenshots/full-qa/app-fail-setup-Help.png`
- `e2e-screenshots/full-qa/logout-session-not-cleared.png`
- `e2e-screenshots/full-qa/mobile-marketing-nav.png`
- `e2e-screenshots/full-qa/mobile-dashboard.png`
- `e2e-screenshots/full-qa/mobile-app-sidebar.png`

## 5. Console / network notables

### Console
- `mobile` @ https://zivvy.xyz/: Failed to load resource: the server responded with a status of 403 ()
- `mobile` @ https://zivvy.xyz/dashboard: Failed to load resource: the server responded with a status of 500 ()
- `desktop` @ https://zivvy.xyz/login: Failed to load resource: the server responded with a status of 401 ()
- `desktop` @ https://zivvy.xyz/dashboard: Failed to load resource: the server responded with a status of 404 ()

### Network
- **403** https://zivvy.xyz/api/method/frappe.ping (from https://zivvy.xyz/)
- **500** https://zivvy.xyz/solutions/canada?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/singapore?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/uae?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/eu?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/uk?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/usa?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/germany?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/solutions/india?_rsc=xpg1jlO5a3IpSyMd (from https://zivvy.xyz/solutions)
- **500** https://zivvy.xyz/compare/odoo?_rsc=1SfzXOvHUThkSklk (from https://zivvy.xyz/compare)
- **500** https://zivvy.xyz/compare/netsuite?_rsc=1SfzXOvHUThkSklk (from https://zivvy.xyz/compare)
- **500** https://zivvy.xyz/compare/zoho?_rsc=1SfzXOvHUThkSklk (from https://zivvy.xyz/compare)
- **500** https://zivvy.xyz/developers/mcp?_rsc=h2vb-LAkAGynSY5z (from https://zivvy.xyz/contact)
- **500** https://zivvy.xyz/developers/webhooks?_rsc=h2vb-LAkAGynSY5z (from https://zivvy.xyz/contact)
- **500** https://zivvy.xyz/blog/accounting-for-agencies-from-retainer-chaos-to-clean-monthly-close?_rsc=oz-_Q2BhlE850NaL (from https://zivvy.xyz/blog)
- **500** https://zivvy.xyz/blog/why-spreadsheet-inventory-fails-after-your-first-warehouse?_rsc=oz-_Q2BhlE850NaL (from https://zivvy.xyz/blog)
- **500** https://zivvy.xyz/blog/the-quiet-cost-of-running-crm-in-spreadsheets-for-smb-sales-teams?_rsc=oz-_Q2BhlE850NaL (from https://zivvy.xyz/blog)
- **500** https://zivvy.xyz/blog/how-to-move-from-spreadsheet-ops-to-a-real-erp-without-chaos?_rsc=oz-_Q2BhlE850NaL (from https://zivvy.xyz/blog)
- **500** https://zivvy.xyz/integrations/slack?_rsc=QBZHFzq82ohXA5a1 (from https://zivvy.xyz/integrations)
- **500** https://zivvy.xyz/integrations/hubspot?_rsc=QBZHFzq82ohXA5a1 (from https://zivvy.xyz/integrations)
- **500** https://zivvy.xyz/integrations/salesforce?_rsc=QBZHFzq82ohXA5a1 (from https://zivvy.xyz/integrations)
- **500** https://zivvy.xyz/support/changelog?_rsc=5CB68i4pnAekjehf (from https://zivvy.xyz/)
- **500** https://zivvy.xyz/developers/mcp?_rsc=5CB68i4pnAekjehf (from https://zivvy.xyz/)
- **500** https://zivvy.xyz/developers/webhooks?_rsc=5CB68i4pnAekjehf (from https://zivvy.xyz/)
- **500** https://zivvy.xyz/solutions/startups?_rsc=5CB68i4pnAekjehf (from https://zivvy.xyz/)
- **500** https://zivvy.xyz/sales/invoices?_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **500** https://zivvy.xyz/sales/invoices?new=1&_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **404** https://zivvy.xyz/crm/leads/CRM-LEAD-2026-00013?_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **404** https://zivvy.xyz/crm/leads/CRM-LEAD-2026-00012?_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **500** https://zivvy.xyz/sales/customers?new=1&_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **500** https://zivvy.xyz/sales/customers?_rsc=j79Vj4yH5aoiafxS (from https://zivvy.xyz/dashboard)
- **500** https://zivvy.xyz/settings/addons?_rsc=thv1twb_ekybfkeG (from https://zivvy.xyz/billing)
- **500** https://zivvy.xyz/settings/developer?_rsc=thv1twb_ekybfkeG (from https://zivvy.xyz/billing)
- **500** https://zivvy.xyz/settings/team?_rsc=thv1twb_ekybfkeG (from https://zivvy.xyz/billing)
- **404** https://zivvy.xyz/messages (from https://zivvy.xyz/dashboard)
- **500** https://zivvy.xyz/support/changelog?_rsc=jdIj7OpSJrBiTWnp (from https://zivvy.xyz/messages)
- **500** https://zivvy.xyz/developers/mcp?_rsc=jdIj7OpSJrBiTWnp (from https://zivvy.xyz/messages)
- **500** https://zivvy.xyz/developers/webhooks?_rsc=jdIj7OpSJrBiTWnp (from https://zivvy.xyz/messages)
- **500** https://zivvy.xyz/stock/reorder?_rsc=cWtjF4KTw5lUSBEH (from https://zivvy.xyz/apps)
- **500** https://zivvy.xyz/stock/scan?_rsc=cWtjF4KTw5lUSBEH (from https://zivvy.xyz/apps)

## 6. What could not be tested

- Did not create real signup accounts (avoid spam / tenant pollution).
- Did not complete Polar checkout / payment (live billing).
- Did not run destructive deletes or submit irreversible documents.
- AI features: only noted if visible in UI during walkthrough.
- Print/PDF: only if controls appeared during detail opens.
- Keyboard shortcuts beyond Cmd/Ctrl+K search probe.

## 7. Checklist detail

| Section | Name | Status | Notes |
|---------|------|--------|-------|
| marketing | Homepage | pass | The clean way to run your whole business |
| marketing | Pricing | pass | Pricing that scales with you |
| marketing | Product tour | pass | See Zivvy in motion |
| marketing | Solutions | fail | /solutions |
| marketing | Compare | pass | Zivvy versus the incumbents
Zivvy versus the incumbents |
| marketing | Features | pass | Features — Zivvy |
| marketing | About | pass | About Zivvy |
| marketing | Contact | pass | Talk to us |
| marketing | Blog | fail | /blog |
| marketing | Resources | pass | Resource center
Resource center |
| marketing | Integrations | pass | Connect tools without losing the workflow
Connect tools without losing the workf |
| marketing | Terms | pass | Terms of Service |
| marketing | Privacy | pass | Privacy Policy |
| marketing | Cookies | pass | Cookie Policy |
| marketing | Acceptable use | pass | Acceptable Use Policy |
| marketing | WWW redirect | fail | / |
| marketing | Nav mega: Product | pass | opened/hovered |
| marketing | Homepage interactions | fail | locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('bu |
| auth | Signup tab loads | pass | Create account UI visible |
| auth | Update password page | pass | Sign in — Zivvy |
| auth | Wrong password shows error | pass | Request failed (401) |
| auth | Business demo login | pass | landed /dashboard |
| app | Billing shows Business plan | pass | All apps Setup Team, billing, preferences Team Add-ons Developer Billing Setting |
| app | Dashboard | warn | page ok but 4 API 5xx |
| app | Messages | fail | HTTP 404 |
| app | Apps launcher | warn | page ok but 16 API 5xx |
| app | CRM Leads | warn | page ok but 7 API 5xx |
| app | CRM Leads → detail | pass | /crm/leads |
| app | CRM Leads light create/cancel | pass | opened-create-ui |
| app | CRM Opportunities | warn | page ok but 5 API 5xx |
| app | Customers | warn | page ok but 4 API 5xx |
| app | Customers → detail | pass | /sales/customers |
| app | Customers light create/cancel | pass | opened-create-ui |
| app | Quotations | warn | page ok but 4 API 5xx |
| app | Sales orders | warn | page ok but 4 API 5xx |
| app | Invoices | warn | page ok but 4 API 5xx |
| app | Invoices → detail | pass | /sales/customers |
| app | Deliveries | warn | page ok but 4 API 5xx |
| app | POS invoices | warn | page ok but 3 API 5xx |
| app | POS profiles | warn | page ok but 3 API 5xx |
| app | POS opening | warn | page ok but 3 API 5xx |
| app | POS closing | warn | page ok but 3 API 5xx |
| app | Suppliers | warn | page ok but 3 API 5xx |
| app | RFQs | warn | page ok but 3 API 5xx |
| app | Purchase orders | warn | page ok but 3 API 5xx |
| app | Purchase invoices | warn | page ok but 3 API 5xx |
| app | Items | warn | page ok but 4 API 5xx |
| app | Items → detail | pass | /stock/items/SMOKE-ITEM-1785036359300 |
| app | Warehouses | pass | Warehouses |
| app | Stock entries | warn | page ok but 8 API 5xx |
| app | Reorder | warn | page ok but 4 API 5xx |
| app | Barcode scan | warn | page ok but 4 API 5xx |
| app | Shipments | warn | page ok but 3 API 5xx |
| app | Parcels | warn | page ok but 3 API 5xx |
| app | Shipping rules | warn | page ok but 3 API 5xx |
| app | Carriers | warn | page ok but 3 API 5xx |
| app | Chart of accounts | pass | Accounts |
| app | Payments | warn | page ok but 12 API 5xx |
| app | Journal entries | warn | page ok but 6 API 5xx |
| app | Reports | warn | page ok but 8 API 5xx |
| app | Employees | warn | page ok but 7 API 5xx |
| app | Employees → detail | pass | /hr/employees |
| app | Time off | warn | page ok but 7 API 5xx |
| app | Attendance | warn | page ok but 7 API 5xx |
| app | Shifts | warn | page ok but 7 API 5xx |
| app | Payroll | warn | page ok but 7 API 5xx |
| app | Expenses | warn | page ok but 7 API 5xx |
| app | Loans | warn | page ok but 7 API 5xx |
| app | Onboarding | warn | page ok but 7 API 5xx |
| app | Job openings | warn | page ok but 5 API 5xx |
| app | Applicants | warn | page ok but 5 API 5xx |
| app | Interviews | warn | page ok but 5 API 5xx |
| app | Appraisals | warn | page ok but 5 API 5xx |
| app | Goals | warn | page ok but 5 API 5xx |
| app | Training | warn | page ok but 5 API 5xx |
| app | BOMs | warn | page ok but 3 API 5xx |
| app | BOMs → detail | pass | /manufacturing/bom |
| app | Work orders | warn | page ok but 3 API 5xx |
| app | Job cards | warn | page ok but 3 API 5xx |
| app | Subcontracting | warn | page ok but 3 API 5xx |
| app | Quality | pass | Quality inspections |
| app | Assets | warn | page ok but 3 API 5xx |
| app | Maintenance | warn | page ok but 2 API 5xx |
| app | Movements | warn | page ok but 2 API 5xx |
| app | Depreciation | warn | page ok but 2 API 5xx |
| app | Projects | warn | page ok but 2 API 5xx |
| app | Projects → detail | pass | /projects |
| app | Tasks | warn | page ok but 1 API 5xx |
| app | Tasks light create/cancel | pass | opened-create-ui |
| app | Timesheets | warn | page ok but 1 API 5xx |
| app | Tickets | warn | page ok but 3 API 5xx |
| app | Issues | warn | page ok but 3 API 5xx |
| app | Warranty | warn | page ok but 3 API 5xx |
| app | SLAs | warn | page ok but 3 API 5xx |
| app | Team | warn | page ok but 2 API 5xx |
| app | Billing | warn | page ok but 3 API 5xx |
| app | Settings | warn | page ok but 4 API 5xx |
| app | Help | warn | page ok but 8 API 5xx |
| app | Search / awesomebar | pass | opened |
| app | Notifications | pass | opened |
| app | Session persists on reload | pass | /dashboard |
| auth | Logout clears session | fail | UI logout |
| mobile | Marketing nav sheet | pass | sheet open |
| mobile | Business login (mobile) | pass | /dashboard |
| mobile | App sidebar sheet | pass |  |
