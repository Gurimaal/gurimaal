import frappe
from frappe import _
from frappe.utils import flt
from frappe.utils import today

from gurimaal.api.utils import (
	get_active_contract,
	get_current_customer,
	get_current_tenant,
	get_list,
	parse_limit,
	require_tenant_unit,
	success,
)


SERVICE_REQUEST_FIELDS = [
	"name",
	"tenant",
	"customer",
	"property",
	"unit",
	"service_type",
	"request_date",
	"contract_start_date",
	"contract_end_date",
	"monthly_amount",
	"status",
	"sales_order",
	"contract",
]
METER_READING_FIELDS = [
	"name",
	"tenant",
	"customer",
	"unit",
	"meter_serial_no",
	"property",
	"reading_date",
	"previous_reading",
	"current_reading",
	"consumption",
	"total_amount",
	"status",
	"sales_invoice",
]


@frappe.whitelist()
def list_service_requests(status=None, limit=20):
	tenant = get_current_tenant()
	filters = {"tenant": tenant.name}
	if status:
		filters["status"] = status

	return success(
		get_list(
			"Utility Service Request",
			filters=filters,
			fields=SERVICE_REQUEST_FIELDS,
			order_by="request_date desc, creation desc",
			limit_page_length=parse_limit(limit),
		)
	)


@frappe.whitelist()
def create_service_request(property, unit, service_type, monthly_amount=None):
	tenant = get_current_tenant()
	customer = get_current_customer()
	contract = get_active_contract(tenant.name)
	require_tenant_unit(unit)

	doc = frappe.get_doc(
		{
			"doctype": "Utility Service Request",
			"tenant": tenant.name,
			"customer": customer,
			"property": property,
			"unit": unit,
			"service_type": service_type,
			"request_date": today(),
			"monthly_amount": monthly_amount,
			"status": "Pending",
			"contract": contract.name if contract else None,
			"contract_start_date": contract.contract_start_date if contract else None,
			"contract_end_date": contract.contract_end_date if contract else None,
		}
	)
	doc.insert(ignore_permissions=True)
	return success({"name": doc.name}, _("Utility service request created successfully."))


@frappe.whitelist()
def list_meter_readings(limit=20):
	return meter_readings(limit=limit)


@frappe.whitelist()
def meter_readings(limit=20):
	tenant = get_current_tenant()
	return success(
		get_list(
			"Meter Reading",
			filters={"tenant": tenant.name},
			fields=METER_READING_FIELDS,
			order_by="reading_date desc, creation desc",
			limit_page_length=parse_limit(limit),
		)
	)


@frappe.whitelist()
def current_usage():
	tenant = get_current_tenant()
	latest_readings = frappe.get_all(
		"Meter Reading",
		filters={"tenant": tenant.name},
		fields=METER_READING_FIELDS,
		order_by="reading_date desc, creation desc",
		limit_page_length=50,
		ignore_permissions=True,
	)

	grouped = {}
	for reading in latest_readings:
		key = reading.property or reading.meter_serial_no or reading.name
		if key not in grouped:
			grouped[key] = reading

	readings = list(grouped.values())
	return success(
		{
			"total_amount": sum(flt(reading.total_amount) for reading in readings),
			"total_consumption": sum(flt(reading.consumption) for reading in readings),
			"readings": readings,
		}
	)


@frappe.whitelist()
def utility_history(limit=100):
	tenant = get_current_tenant()
	return success(
		get_list(
			"Meter Reading",
			filters={"tenant": tenant.name},
			fields=METER_READING_FIELDS,
			order_by="reading_date asc, creation asc",
			limit_page_length=parse_limit(limit, maximum=200),
		)
	)


@frappe.whitelist()
def latest_bill():
	tenant = get_current_tenant()
	reading = frappe.db.get_value(
		"Meter Reading",
		{"tenant": tenant.name},
		METER_READING_FIELDS,
		order_by="reading_date desc, creation desc",
		as_dict=True,
	)
	if not reading:
		return success(None)

	invoice = None
	if reading.sales_invoice and frappe.db.exists("Sales Invoice", reading.sales_invoice):
		invoice = frappe.db.get_value(
			"Sales Invoice",
			reading.sales_invoice,
			[
				"name",
				"posting_date",
				"due_date",
				"grand_total",
				"outstanding_amount",
				"status",
			],
			as_dict=True,
		)

	return success({"reading": reading, "invoice": invoice})


@frappe.whitelist()
def list_bill_structures(utility_type=None, limit=50):
	filters = {}
	if utility_type:
		filters["utility_type"] = utility_type

	return success(
		get_list(
			"Utility Bill Structure",
			filters=filters,
			fields=["name", "structure_name", "utility_type", "customer_group"],
			order_by="structure_name asc",
			limit_page_length=parse_limit(limit),
		)
	)
