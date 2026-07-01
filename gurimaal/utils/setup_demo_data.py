"""End-to-end Gurimaal demo data setup.

Run from the bench root:

    bench --site gurimaal.local execute gurimaal.utils.setup_demo_data.run

Optional cleanup before setup:

    bench --site gurimaal.local execute gurimaal.utils.setup_demo_data.run --kwargs "{'reset': 1}"
"""

import json

import frappe
from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry
from frappe.utils import add_days, add_months, today

from gurimaal.utils.tenancy import ensure_customer_for_tenant


COMPANY = "Gurimaal Demo Properties"
ABBR = "GDP"
CURRENCY = "USD"
COUNTRY = "Somalia"
CUSTOMER_GROUP = "Gurimaal Tenants"
ITEM_GROUP = "Gurimaal Services"
SUPPLIER_GROUP = "Gurimaal Vendors"

DEMO_ITEMS = [
	"Rent Item",
	"Security Deposit",
	"Utility Connection Charge",
	"Utility Consumption",
	"Utility Meter",
]


def run(reset=0, submit_transactions=1):
	"""Create realistic demo data from property setup through payment and maintenance.

	The function is safe to re-run. Existing records are reused by natural keys
	where possible. Pass reset=1 to delete the demo/business records first.
	"""
	reset = int(reset or 0)
	submit_transactions = int(submit_transactions or 0)
	results = {"created": [], "reused": [], "skipped": []}

	if reset:
		clear_demo_data(results)

	company = ensure_company(results)
	income_account = get_income_account(company)
	cost_center = get_cost_center(company)
	warehouse = ensure_warehouse(company, results)

	configure_settings(company, income_account, cost_center, results)
	customer_group = ensure_customer_group(results)
	item_group = ensure_item_group(results)
	supplier_group = ensure_supplier_group(results)
	items = ensure_items(company, item_group, warehouse, results)

	property_data = setup_property_structure(company, results)
	tenancy_data = setup_tenancy(property_data, customer_group, results)
	utility_data = setup_utilities(property_data, tenancy_data, company, cost_center, items, results)
	finance_data = setup_finance_flow(tenancy_data, utility_data, submit_transactions, results)
	setup_maintenance_flow(property_data, tenancy_data, supplier_group, results)

	frappe.db.commit()
	frappe.clear_cache()

	results["summary"] = {
		"company": company,
		"project": property_data["project"].name,
		"tenant": tenancy_data["tenant"].name,
		"customer": tenancy_data["tenant"].customer,
		"contract": tenancy_data["contract"].name,
		"utility_service_request": utility_data["service_request"].name,
		"meter_reading": utility_data["meter_reading"].name,
		"sales_order": finance_data.get("sales_order"),
		"sales_invoice": finance_data.get("sales_invoice"),
		"payment_entry": finance_data.get("payment_entry"),
	}
	print(json.dumps(results, indent=2, sort_keys=True))
	return results


def setup_property_structure(company, results):
	project = ensure_doc(
		"Real Estate Project",
		{"project_name": "Gurimaal Demo Estate", "company": company},
		{
			"project_name": "Gurimaal Demo Estate",
			"company": company,
			"address": "KM4 Road",
			"city": "Mogadishu",
			"status": "Active",
			"description": "Demo mixed-use rental estate for Gurimaal.",
		},
		results,
	)
	building = ensure_doc(
		"Rental Building",
		{"project": project.name, "building_name": "Block A"},
		{"project": project.name, "building_name": "Block A", "total_floors": 2, "status": "Active"},
		results,
	)
	floor = ensure_doc(
		"Rental Floor",
		{"building": building.name, "floor_number": 1},
		{"building": building.name, "floor_name": "First Floor", "floor_number": 1},
		results,
	)
	unit = ensure_doc(
		"Rental Unit",
		{"floor": floor.name, "unit_no": "A-101"},
		{
			"floor": floor.name,
			"unit_no": "A-101",
			"unit_type": "2BR",
			"area_sqft": 850,
			"bedrooms": 2,
			"monthly_rent": 950,
			"status": "Vacant",
		},
		results,
	)
	return {"project": project, "building": building, "floor": floor, "unit": unit}


def setup_tenancy(property_data, customer_group, results):
	tenant = ensure_tenant(
		tenant_name="Amina Hassan",
		customer_group=customer_group,
		email="amina.demo@example.com",
		mobile_no="+252610000101",
		results=results,
	)
	contract = ensure_doc(
		"Contracts",
		{"rental_unit": property_data["unit"].name, "tenant": tenant.name},
		{
			"rental_property": property_data["project"].name,
			"rental_unit": property_data["unit"].name,
			"tenant": tenant.name,
			"contract_start_date": today(),
			"contract_end_date": add_months(today(), 12),
			"monthly_rent": 950,
			"security_deposit_amount": 950,
			"escalation_percentage": 5,
			"escalation_interval": "Yearly",
			"notice_period_days": 30,
			"status": "Active",
		},
		results,
	)
	return {"tenant": tenant, "contract": contract}


def setup_utilities(property_data, tenancy_data, company, cost_center, items, results):
	electricity = ensure_doc(
		"Utility property",
		{"property_name": "Demo Electricity", "property_type": "Electricity"},
		{
			"property_name": "Demo Electricity",
			"property_type": "Electricity",
			"company": company,
			"cost_center": cost_center,
			"status": "Active",
		},
		results,
	)
	bill_structure = ensure_bill_structure(results)
	ensure_adjustment_rule(results)
	serial_no = ensure_serial_no(items["meter"], company, results)

	service_request = ensure_doc(
		"Utility Service Request",
		{
			"tenant": tenancy_data["tenant"].name,
			"unit": property_data["unit"].name,
			"service_type": "Electricity",
		},
		{
			"tenant": tenancy_data["tenant"].name,
			"property": electricity.name,
			"unit": property_data["unit"].name,
			"service_type": "Electricity",
			"request_date": today(),
			"monthly_amount": 35,
			"status": "Draft",
		},
		results,
	)

	meter_reading = ensure_doc(
		"Meter Reading",
		{"meter_serial_no": serial_no.name, "reading_date": today()},
		{
			"tenant": tenancy_data["tenant"].name,
			"unit": property_data["unit"].name,
			"property": electricity.name,
			"meter_serial_no": serial_no.name,
			"reading_date": today(),
			"previous_reading": 120,
			"current_reading": 185,
			"bill_structure": bill_structure.name,
		},
		results,
	)

	return {
		"utility_property": electricity,
		"bill_structure": bill_structure,
		"serial_no": serial_no,
		"service_request": service_request,
		"meter_reading": meter_reading,
	}


def setup_finance_flow(tenancy_data, utility_data, submit_transactions, results):
	finance = {}

	service_request = utility_data["service_request"]
	if submit_transactions and service_request.status == "Draft":
		service_request.status = "Approved"
		service_request.save(ignore_permissions=True)
		service_request.reload()

	finance["sales_order"] = service_request.sales_order

	meter_reading = utility_data["meter_reading"]
	if submit_transactions and meter_reading.docstatus == 0:
		meter_reading.submit()
		meter_reading.reload()

	finance["sales_invoice"] = meter_reading.sales_invoice
	if submit_transactions and finance["sales_invoice"]:
		finance["payment_entry"] = ensure_payment_entry(finance["sales_invoice"], tenancy_data["tenant"].name, results)

	return finance


def setup_maintenance_flow(property_data, tenancy_data, supplier_group, results):
	supplier = ensure_supplier(supplier_group, results)
	vendor = ensure_doc(
		"Vendor",
		{"vendor_name": "Gurimaal Demo Maintenance Vendor"},
		{
			"vendor_name": "Gurimaal Demo Maintenance Vendor",
			"trade": "General",
			"phone": "+252610009999",
			"suplier": supplier.name,
		},
		results,
	)
	request = ensure_doc(
		"Maintenance Request",
		{
			"unit": property_data["unit"].name,
			"tenant": tenancy_data["tenant"].name,
			"description": "Demo water pressure issue in kitchen.",
		},
		{
			"unit": property_data["unit"].name,
			"tenant": tenancy_data["tenant"].name,
			"category": "Plumbing",
			"priority": "Medium",
			"description": "Demo water pressure issue in kitchen.",
			"reported_date": today(),
			"status": "Open",
		},
		results,
	)
	ensure_doc(
		"Maintenance Job",
		{"request": request.name, "vendor": vendor.name},
		{
			"request": request.name,
			"vendor": vendor.name,
			"estimated_cost": 75,
			"schedule_date": today(),
			"status": "Scheduled",
		},
		results,
	)

	if frappe.db.exists("DocType", "Maintenance Checklist"):
		checklist_meta = frappe.get_meta("Maintenance Checklist")
		if checklist_meta.has_field("status") and checklist_meta.has_field("inspection_date"):
			ensure_doc(
				"Maintenance Checklist",
				{"status": "Pending", "inspection_date": today()},
				{"status": "Pending", "inspection_date": today()},
				results,
			)
		else:
			results["skipped"].append(
				"Maintenance Checklist: skipped because status/inspection_date fields are not defined"
			)


def ensure_company(results):
	if frappe.db.exists("Company", COMPANY):
		results["reused"].append(f"Company {COMPANY}")
		return COMPANY

	country = COUNTRY if frappe.db.exists("Country", COUNTRY) else frappe.db.get_value("Country", {}) or "United States"
	currency = CURRENCY if frappe.db.exists("Currency", CURRENCY) else frappe.db.get_single_value("Global Defaults", "default_currency")
	doc = frappe.get_doc(
		{
			"doctype": "Company",
			"company_name": COMPANY,
			"abbr": ABBR,
			"default_currency": currency,
			"country": country,
			"valuation_method": "FIFO",
			"create_chart_of_accounts_based_on": "Standard Template",
			"chart_of_accounts": "Standard",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Company {doc.name}")
	return doc.name


def configure_settings(company, income_account, cost_center, results):
	settings = frappe.get_single("Utility Billing Settings")
	settings.company = company
	set_if_field(settings, "default_income_account", income_account)
	set_if_field(settings, "income_account", income_account)
	set_if_field(settings, "default_cost_center", cost_center)
	set_if_field(settings, "cost_center", cost_center)
	settings.auto_create_customer = 1
	settings.require_contract = 1
	settings.invoice_status = "Draft"
	settings.save(ignore_permissions=True)
	results["created"].append("Updated Utility Billing Settings")


def ensure_tenant(tenant_name, customer_group, email, mobile_no, results):
	existing = frappe.db.get_value("Tenant", {"tenant_name": tenant_name})
	if existing:
		tenant = frappe.get_doc("Tenant", existing)
		results["reused"].append(f"Tenant {tenant_name}")
	else:
		tenant = frappe.get_doc(
			{
				"doctype": "Tenant",
				"tenant_name": tenant_name,
				"customer_group": customer_group,
				"email": email,
				"mobile_no": mobile_no,
				"status": "Active",
			}
		)
		tenant.insert(ignore_permissions=True)
		results["created"].append(f"Tenant {tenant_name}")

	if not tenant.customer:
		ensure_customer_for_tenant(tenant)
		tenant.reload()
	return tenant


def ensure_bill_structure(results):
	existing = frappe.db.get_value("Utility Bill Structure", {"structure_name": "Demo Electricity Slabs"})
	if existing:
		results["reused"].append("Utility Bill Structure Demo Electricity Slabs")
		return frappe.get_doc("Utility Bill Structure", existing)

	doc = frappe.get_doc(
		{
			"doctype": "Utility Bill Structure",
			"structure_name": "Demo Electricity Slabs",
			"utility_type": "Electricity",
			"items": [
				{"from_units": 0, "to_units": 100, "rate_per_unit": 0.15, "fixed_charge": 5},
				{"from_units": 100, "to_units": 300, "rate_per_unit": 0.22, "fixed_charge": 0},
			],
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append("Utility Bill Structure Demo Electricity Slabs")
	return doc


def ensure_adjustment_rule(results):
	existing = frappe.db.get_value("Billing Adjustment Rule", {"rule_type": "Surcharge", "applies_to": "All", "priority": 10})
	if existing:
		frappe.db.set_value("Billing Adjustment Rule", existing, "amount_or_percent", 0)
		results["reused"].append(f"Billing Adjustment Rule {existing}")
		return

	doc = frappe.get_doc(
		{
			"doctype": "Billing Adjustment Rule",
			"rule_type": "Surcharge",
			"applies_to": "All",
			"amount_or_percent": 0,
			"valid_from": today(),
			"priority": 10,
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Billing Adjustment Rule {doc.name}")


def ensure_items(company, item_group, warehouse, results):
	return {
		"rent": ensure_item("Rent Item", item_group, results),
		"deposit": ensure_item("Security Deposit", item_group, results),
		"utility_connection": ensure_item("Utility Connection Charge", item_group, results),
		"utility_consumption": ensure_item("Utility Consumption", item_group, results),
		"meter": ensure_item("Utility Meter", item_group, results, is_stock_item=1, has_serial_no=1, warehouse=warehouse),
	}


def ensure_item(item_code, item_group, results, is_stock_item=0, has_serial_no=0, warehouse=None):
	if frappe.db.exists("Item", item_code):
		results["reused"].append(f"Item {item_code}")
		return item_code

	doc = frappe.get_doc(
		{
			"doctype": "Item",
			"item_code": item_code,
			"item_name": item_code,
			"item_group": item_group,
			"stock_uom": get_uom(),
			"is_stock_item": is_stock_item,
			"has_serial_no": has_serial_no,
		}
	)
	if is_stock_item and warehouse and doc.meta.has_field("default_warehouse"):
		doc.default_warehouse = warehouse
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Item {item_code}")
	return doc.name


def ensure_serial_no(item_code, company, results):
	serial_no = "GUR-DEMO-MTR-0001"
	if frappe.db.exists("Serial No", serial_no):
		results["reused"].append(f"Serial No {serial_no}")
		return frappe.get_doc("Serial No", serial_no)

	doc = frappe.get_doc({"doctype": "Serial No", "serial_no": serial_no, "item_code": item_code, "company": company})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Serial No {serial_no}")
	return doc


def ensure_payment_entry(sales_invoice, tenant, results):
	existing = frappe.db.get_value(
		"Payment Entry Reference",
		{"reference_doctype": "Sales Invoice", "reference_name": sales_invoice, "parenttype": "Payment Entry"},
		"parent",
	)
	if existing:
		results["reused"].append(f"Payment Entry {existing}")
		return existing

	payment = get_payment_entry("Sales Invoice", sales_invoice)
	if payment.meta.has_field("tenant_reference"):
		payment.tenant_reference = tenant
	payment.insert(ignore_permissions=True)
	payment.submit()
	results["created"].append(f"Payment Entry {payment.name}")
	return payment.name


def ensure_supplier(supplier_group, results):
	if frappe.db.exists("Supplier", "Gurimaal Demo Maintenance Vendor"):
		results["reused"].append("Supplier Gurimaal Demo Maintenance Vendor")
		return frappe.get_doc("Supplier", "Gurimaal Demo Maintenance Vendor")

	doc = frappe.get_doc(
		{
			"doctype": "Supplier",
			"supplier_name": "Gurimaal Demo Maintenance Vendor",
			"supplier_group": supplier_group,
			"supplier_type": "Company",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Supplier {doc.name}")
	return doc


def ensure_doc(doctype, filters, values, results):
	existing = frappe.db.get_value(doctype, filters) if filters else frappe.db.get_value(doctype, {})
	if existing:
		results["reused"].append(f"{doctype} {existing}")
		return frappe.get_doc(doctype, existing)

	doc = frappe.get_doc({"doctype": doctype, **values})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"{doctype} {doc.name}")
	return doc


def clear_demo_data(results):
	for doctype in ["Payment Entry", "Sales Invoice", "Sales Order"]:
		for name in frappe.get_all(doctype, pluck="name"):
			delete_doc(doctype, name, results)

	for doctype in [
		"Auto Repeat",
		"Maintenance Job",
		"Maintenance Checklist",
		"Maintenance Request",
		"Meter Reading",
		"Utility Service Request",
		"Contracts",
		"Vendor",
		"Serial No",
		"Utility Bill Structure",
		"Billing Adjustment Rule",
		"Utility property",
		"Rental Unit",
		"Rental Floor",
		"Rental Building",
		"Real Estate Project",
		"Tenant",
	]:
		if frappe.db.exists("DocType", doctype):
			for name in frappe.get_all(doctype, pluck="name"):
				delete_doc(doctype, name, results)

	for doctype, names in {
		"Supplier": ["Gurimaal Demo Maintenance Vendor"],
		"Customer": ["Amina Hassan", "Omar Ali"],
		"Item": DEMO_ITEMS,
		"Company": [COMPANY],
	}.items():
		for name in names:
			delete_doc(doctype, name, results)


def delete_doc(doctype, name, results):
	if not frappe.db.exists(doctype, name):
		return
	try:
		doc = frappe.get_doc(doctype, name)
		if getattr(doc, "docstatus", 0) == 1:
			doc.cancel()
		frappe.delete_doc(doctype, name, force=True, ignore_permissions=True, ignore_missing=True)
		results["created"].append(f"Deleted {doctype} {name}")
	except Exception as exc:
		results["skipped"].append(f"Could not delete {doctype} {name}: {exc}")


def ensure_customer_group(results):
	return ensure_tree_group("Customer Group", "customer_group_name", "parent_customer_group", CUSTOMER_GROUP, "All Customer Groups", results)


def ensure_supplier_group(results):
	return ensure_tree_group("Supplier Group", "supplier_group_name", "parent_supplier_group", SUPPLIER_GROUP, "All Supplier Groups", results)


def ensure_item_group(results):
	return ensure_tree_group("Item Group", "item_group_name", "parent_item_group", ITEM_GROUP, "All Item Groups", results)


def ensure_tree_group(doctype, name_field, parent_field, name, parent, results):
	if frappe.db.exists(doctype, name):
		results["reused"].append(f"{doctype} {name}")
		return name
	values = {"doctype": doctype, name_field: name}
	if frappe.db.exists(doctype, parent):
		values[parent_field] = parent
	if frappe.get_meta(doctype).has_field("is_group"):
		values["is_group"] = 0
	doc = frappe.get_doc(values)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"{doctype} {name}")
	return doc.name


def ensure_warehouse(company, results):
	existing = frappe.db.get_value("Warehouse", {"warehouse_name": "Gurimaal Demo Stores", "company": company})
	if existing:
		results["reused"].append(f"Warehouse {existing}")
		return existing
	doc = frappe.get_doc({"doctype": "Warehouse", "warehouse_name": "Gurimaal Demo Stores", "company": company})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Warehouse {doc.name}")
	return doc.name


def set_if_field(doc, fieldname, value):
	if doc.meta.has_field(fieldname):
		doc.set(fieldname, value)


def get_income_account(company):
	return (
		frappe.db.get_value("Company", company, "default_income_account")
		or frappe.db.get_value("Account", {"company": company, "account_type": "Income Account", "is_group": 0})
		or frappe.db.get_value("Account", {"company": company, "root_type": "Income", "is_group": 0})
	)


def get_cost_center(company):
	return frappe.db.get_value("Company", company, "cost_center") or frappe.db.get_value("Cost Center", {"company": company, "is_group": 0})


def get_uom():
	return frappe.db.get_value("UOM", "Nos") or frappe.db.get_value("UOM", {})
