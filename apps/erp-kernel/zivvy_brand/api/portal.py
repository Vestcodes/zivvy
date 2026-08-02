# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Employee self-service portal API.

Whitelisted methods consumed by the portal.zivvy.xyz Next.js app.
Every method resolves the calling user's linked Employee and returns
only their own data — no cross-employee access.
"""

from __future__ import annotations

import frappe
from frappe import _


def _get_employee_for_user(user: str | None = None) -> str:
	"""Return the Employee name linked to the current user, or throw."""
	user = user or frappe.session.user
	if user in ("Guest", "Administrator"):
		frappe.throw(_("Not an employee"), frappe.PermissionError)

	emp = frappe.db.get_value("Employee", {"user_id": user, "status": "Active"}, "name")
	if not emp:
		frappe.throw(_("No active employee record linked to your account"), frappe.DoesNotExistError)
	return emp


@frappe.whitelist()
def get_my_profile():
	"""Return the logged-in user's Employee record."""
	emp_name = _get_employee_for_user()
	emp = frappe.get_doc("Employee", emp_name)

	return {
		"name": emp.name,
		"employee_name": emp.employee_name,
		"first_name": emp.first_name,
		"last_name": emp.last_name,
		"company": emp.company,
		"department": emp.department,
		"designation": emp.designation,
		"date_of_joining": str(emp.date_of_joining) if emp.date_of_joining else None,
		"company_email": emp.company_email,
		"personal_email": emp.personal_email,
		"cell_phone": emp.cell_phone,
		"image": emp.image,
		"status": emp.status,
		"reports_to": emp.reports_to,
		"leave_approver": emp.leave_approver,
		"expense_approver": emp.expense_approver,
		"holiday_list": emp.holiday_list,
	}


@frappe.whitelist()
def get_my_leaves(year: str | None = None):
	"""Return leave balance and recent applications for the logged-in employee."""
	emp_name = _get_employee_for_user()
	year = year or str(frappe.utils.nowdate()[:4])

	allocations = frappe.get_all(
		"Leave Allocation",
		filters={
			"employee": emp_name,
			"docstatus": 1,
			"from_date": (">=", f"{year}-01-01"),
			"to_date": ("<=", f"{year}-12-31"),
		},
		fields=["leave_type", "total_leaves_allocated", "new_leaves_allocated"],
		order_by="leave_type asc",
	)

	applications = frappe.get_all(
		"Leave Application",
		filters={
			"employee": emp_name,
			"posting_date": (">=", f"{year}-01-01"),
		},
		fields=[
			"name", "leave_type", "from_date", "to_date",
			"total_leave_days", "status", "posting_date",
			"leave_approver", "leave_approver_name",
		],
		order_by="posting_date desc",
		limit_page_length=50,
	)

	balances = []
	for alloc in allocations:
		used = frappe.db.sql(
			"""
			SELECT COALESCE(SUM(total_leave_days), 0)
			FROM `tabLeave Application`
			WHERE employee = %s
			  AND leave_type = %s
			  AND status = 'Approved'
			  AND docstatus = 1
			  AND from_date >= %s
			  AND to_date <= %s
			""",
			(emp_name, alloc.leave_type, f"{year}-01-01", f"{year}-12-31"),
		)[0][0]

		balances.append({
			"leave_type": alloc.leave_type,
			"allocated": alloc.total_leaves_allocated,
			"used": float(used),
			"remaining": float(alloc.total_leaves_allocated - used),
		})

	return {
		"year": year,
		"balances": balances,
		"applications": applications,
	}


@frappe.whitelist()
def get_my_attendance(month: str | None = None, year: str | None = None):
	"""Return attendance records for the logged-in employee."""
	emp_name = _get_employee_for_user()
	now = frappe.utils.nowdate()
	year = year or now[:4]
	month = month or now[5:7]

	start = f"{year}-{month}-01"
	from frappe.utils import get_last_day
	end = str(get_last_day(start))

	records = frappe.get_all(
		"Attendance",
		filters={
			"employee": emp_name,
			"attendance_date": ("between", [start, end]),
			"docstatus": 1,
		},
		fields=[
			"name", "attendance_date", "status",
			"working_hours", "late_entry", "early_exit",
		],
		order_by="attendance_date asc",
		limit_page_length=0,
	)

	summary = {"Present": 0, "Absent": 0, "Half Day": 0, "On Leave": 0, "Work From Home": 0}
	for r in records:
		status = r.get("status", "")
		if status in summary:
			summary[status] += 1

	return {
		"year": year,
		"month": month,
		"records": records,
		"summary": summary,
	}


@frappe.whitelist()
def get_my_payslips(year: str | None = None):
	"""Return salary slips for the logged-in employee."""
	emp_name = _get_employee_for_user()
	year = year or str(frappe.utils.nowdate()[:4])

	slips = frappe.get_all(
		"Salary Slip",
		filters={
			"employee": emp_name,
			"docstatus": 1,
			"posting_date": (">=", f"{year}-01-01"),
		},
		fields=[
			"name", "posting_date", "start_date", "end_date",
			"gross_pay", "total_deduction", "net_pay",
			"currency", "salary_structure",
		],
		order_by="posting_date desc",
		limit_page_length=0,
	)

	return {
		"year": year,
		"slips": slips,
	}


@frappe.whitelist()
def get_payslip_detail(slip_name: str):
	"""Return detailed salary slip breakdown."""
	emp_name = _get_employee_for_user()

	slip = frappe.get_doc("Salary Slip", slip_name)
	if slip.employee != emp_name:
		frappe.throw(_("Access denied"), frappe.PermissionError)

	earnings = [
		{"component": e.salary_component, "amount": e.amount}
		for e in (slip.earnings or [])
	]
	deductions = [
		{"component": d.salary_component, "amount": d.amount}
		for d in (slip.deductions or [])
	]

	return {
		"name": slip.name,
		"employee_name": slip.employee_name,
		"posting_date": str(slip.posting_date),
		"start_date": str(slip.start_date),
		"end_date": str(slip.end_date),
		"gross_pay": slip.gross_pay,
		"total_deduction": slip.total_deduction,
		"net_pay": slip.net_pay,
		"currency": slip.currency,
		"earnings": earnings,
		"deductions": deductions,
		"total_working_days": slip.total_working_days,
		"payment_days": slip.payment_days,
	}


@frappe.whitelist()
def get_my_expenses(year: str | None = None):
	"""Return expense claims for the logged-in employee."""
	emp_name = _get_employee_for_user()
	year = year or str(frappe.utils.nowdate()[:4])

	claims = frappe.get_all(
		"Expense Claim",
		filters={
			"employee": emp_name,
			"posting_date": (">=", f"{year}-01-01"),
		},
		fields=[
			"name", "posting_date", "total_claimed_amount",
			"total_sanctioned_amount", "status", "approval_status",
			"expense_approver", "expense_approver_name",
		],
		order_by="posting_date desc",
		limit_page_length=50,
	)

	return {
		"year": year,
		"claims": claims,
	}


@frappe.whitelist()
def submit_leave_application(
	leave_type: str,
	from_date: str,
	to_date: str,
	reason: str | None = None,
	half_day: int = 0,
	half_day_date: str | None = None,
):
	"""Submit a new leave application for the logged-in employee."""
	emp_name = _get_employee_for_user()
	emp = frappe.get_doc("Employee", emp_name)

	leave = frappe.get_doc({
		"doctype": "Leave Application",
		"employee": emp_name,
		"leave_type": leave_type,
		"from_date": from_date,
		"to_date": to_date,
		"description": reason or "",
		"half_day": half_day,
		"half_day_date": half_day_date if half_day else None,
		"leave_approver": emp.leave_approver,
		"status": "Open",
	})
	leave.flags.ignore_permissions = True
	leave.insert()
	leave.submit()

	return {
		"name": leave.name,
		"status": leave.status,
		"total_leave_days": leave.total_leave_days,
	}


@frappe.whitelist()
def get_leave_types():
	"""Return available leave types for the logged-in employee."""
	emp_name = _get_employee_for_user()
	year = str(frappe.utils.nowdate()[:4])

	allocations = frappe.get_all(
		"Leave Allocation",
		filters={
			"employee": emp_name,
			"docstatus": 1,
			"from_date": (">=", f"{year}-01-01"),
			"to_date": ("<=", f"{year}-12-31"),
		},
		fields=["leave_type"],
		order_by="leave_type asc",
	)

	return [a.leave_type for a in allocations]
