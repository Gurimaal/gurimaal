import frappe
from frappe.utils import flt, today

from gurimaal.api.utils import (
	get_active_contract,
	get_current_customer,
	get_current_tenant,
	get_list,
	parse_limit,
	serialize_doc,
	success,
)
from gurimaal.api.property import get_unit_hierarchy


@frappe.whitelist()
def get_summary():
	return summary()


@frappe.whitelist()
def summary():
	tenant = get_current_tenant()
	customer = get_current_customer()
	active_contract = get_active_contract(tenant.name)

	open_maintenance = frappe.db.count(
		"Maintenance Request",
		{"tenant": tenant.name, "status": ["in", ["Open", "In Progress"]]},
	)
	active_services = frappe.db.count(
		"Utility Service Request",
		{"tenant": tenant.name, "status": ["in", ["Approved", "Active"]]},
	)
	outstanding = 0
	next_due_invoice = None
	payment_history = []
	if customer:
		outstanding_invoices = frappe.get_all(
			"Sales Invoice",
			filters={"customer": customer, "docstatus": 1, "outstanding_amount": [">", 0]},
			fields=["outstanding_amount"],
			ignore_permissions=True,
		)
		outstanding = sum(flt(invoice.outstanding_amount) for invoice in outstanding_invoices)
		next_due_invoice = frappe.db.get_value(
			"Sales Invoice",
			{"customer": customer, "docstatus": 1, "outstanding_amount": [">", 0]},
			["name", "due_date", "grand_total", "outstanding_amount", "status"],
			order_by="due_date asc",
			as_dict=True,
		)
		payment_history = frappe.get_all(
			"Payment Entry",
			filters={"party_type": "Customer", "party": customer, "docstatus": 1},
			fields=["name", "posting_date", "paid_amount", "received_amount"],
			order_by="posting_date desc",
			limit_page_length=6,
			ignore_permissions=True,
		)

	meter_readings = get_list(
		"Meter Reading",
		filters={"tenant": tenant.name},
		fields=[
			"name",
			"property",
			"reading_date",
			"consumption",
			"total_amount",
			"status",
		],
		order_by="reading_date desc, creation desc",
		limit_page_length=12,
	)
	utility_total = sum(flt(reading.total_amount) for reading in meter_readings[:3])

	recent_activity = get_recent_activity_data(tenant.name, limit=8)
	property_data = get_unit_hierarchy(active_contract.rental_unit) if active_contract else None
	data = {
		"tenant_name": tenant.tenant_name,
		"unit": active_contract.rental_unit if active_contract else None,
		"monthly_rent": active_contract.monthly_rent if active_contract else 0,
		"outstanding_balance": outstanding,
		"next_due_date": next_due_invoice.due_date if next_due_invoice else None,
		"lease_expiry": active_contract.contract_end_date if active_contract else None,
		"utility_balance": utility_total,
		"pending_maintenance_count": open_maintenance,
		"recent_activity": recent_activity,
		"tenant": serialize_doc(tenant, ["name", "tenant_name", "email", "mobile_no", "status"]),
		"contract": serialize_doc(
			active_contract,
			[
				"name",
				"rental_unit",
				"contract_start_date",
				"contract_end_date",
				"monthly_rent",
				"status",
			],
		)
		if active_contract
		else None,
		"property": property_data,
		"counts": {
			"open_maintenance_requests": open_maintenance,
			"active_utility_services": active_services,
		},
		"billing": {
			"outstanding_amount": outstanding,
			"next_due_invoice": next_due_invoice,
			"payment_history": payment_history,
			"as_of": today(),
		},
		"utilities": {
			"current_amount": utility_total,
			"recent_readings": meter_readings,
		},
	}
	return success(data)


@frappe.whitelist()
def get_recent_activity(limit=10):
	tenant = get_current_tenant()
	limit = parse_limit(limit, maximum=50)
	return success(get_recent_activity_data(tenant.name, limit=limit))


def get_recent_activity_data(tenant_name, limit=10):
	activities = []

	for row in get_list(
		"Maintenance Request",
		filters={"tenant": tenant_name},
		fields=["name", "status", "priority", "description", "modified"],
		order_by="modified desc",
		limit_page_length=limit,
	):
		activities.append({"type": "maintenance", **row})

	for row in get_list(
		"Utility Service Request",
		filters={"tenant": tenant_name},
		fields=["name", "service_type", "status", "modified"],
		order_by="modified desc",
		limit_page_length=limit,
	):
		activities.append({"type": "utility_service", **row})

	return sorted(activities, key=lambda item: item.get("modified"), reverse=True)[:limit]
