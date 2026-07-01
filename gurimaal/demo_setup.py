"""Create a small, repeatable Gurimaal demo dataset.

Run from the bench root:

    bench --site gurimaal.local execute gurimaal.demo_setup.setup_demo_company
"""

import json

import frappe
from frappe.utils import add_months, today

from gurimaal.utils.tenancy import ensure_customer_for_tenant


DEFAULT_COMPANY = "Gurimaal Demo Properties"
DEFAULT_ABBR = "GDP"
DEFAULT_CURRENCY = "USD"
DEFAULT_COUNTRY = "Somalia"
DEMO_ITEMS = [
	"Rent Item",
	"Utility Connection Charge",
	"Utility Consumption",
	"Utility Meter",
]
DEMO_CUSTOMERS = [
	"Amina Hassan",
	"Omar Ali",
]
DEMO_SUPPLIERS = [
	"Gurimaal Demo Maintenance Vendor",
]


def reset_demo_site(submit_demo_transactions=1):
	"""Clear Gurimaal business data and recreate a full demo dataset."""
	results = {"cleared": [], "skipped": []}
	clear_business_data(results)
	setup_results = setup_demo_company(submit_demo_transactions=submit_demo_transactions)
	results["setup"] = setup_results
	print(json.dumps(results, indent=2, sort_keys=True))
	return results


def clear_business_data(results=None):
	"""Delete Gurimaal demo/business records in dependency order.

	This is intentionally an in-site cleanup, not a database reinstall. It does
	not require MariaDB root credentials and leaves installed apps, schema, roles,
	and system records in place.
	"""
	results = results or {"cleared": [], "skipped": []}

	for doctype in ["Payment Entry", "Sales Invoice", "Sales Order"]:
		delete_all_docs(doctype, results)

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
		delete_all_docs(doctype, results)

	for supplier in DEMO_SUPPLIERS:
		delete_if_exists("Supplier", supplier, results)

	for customer in DEMO_CUSTOMERS:
		delete_if_exists("Customer", customer, results)

	for item in DEMO_ITEMS:
		delete_if_exists("Item", item, results)

	delete_all_docs("Warehouse", results, {"company": DEFAULT_COMPANY})
	delete_if_exists("Company", DEFAULT_COMPANY, results)

	frappe.db.commit()
	frappe.clear_cache()
	return results


def setup_demo_company(
	company_name=DEFAULT_COMPANY,
	abbr=DEFAULT_ABBR,
	currency=DEFAULT_CURRENCY,
	country=DEFAULT_COUNTRY,
	submit_demo_transactions=0,
):
	"""Create a demo company and Gurimaal sample records.

	The script is idempotent enough for local/demo use: masters are reused by
	name or natural keys, while transactional records are only created when a
	matching demo record is not already present.
	"""
	submit_demo_transactions = int(submit_demo_transactions or 0)
	results = {"company": company_name, "created": [], "reused": []}

	company = ensure_company(company_name, abbr, currency, country, results)
	income_account = get_income_account(company.name)
	cost_center = get_cost_center(company.name)

	configure_utility_billing_settings(company.name, income_account, cost_center, results)
	customer_group = ensure_customer_group("Gurimaal Tenants", results)
	item_group = ensure_item_group("Gurimaal Services", results)
	supplier_group = ensure_supplier_group("Gurimaal Vendors", results)
	warehouse = ensure_warehouse("Gurimaal Demo Stores", company.name, results)

	items = ensure_items(company.name, item_group, warehouse, income_account, cost_center, results)

	project = ensure_doc(
		"Real Estate Project",
		{"project_name": "Gurimaal Demo Estate", "company": company.name},
		{
			"project_name": "Gurimaal Demo Estate",
			"company": company.name,
			"address": "KM4 Road",
			"city": "Mogadishu",
			"status": "Active",
			"description": "Demo property structure for Gurimaal.",
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

	unit_101 = ensure_unit(floor.name, "A-101", "2BR", 850, 2, 950, results)
	unit_102 = ensure_unit(floor.name, "A-102", "1BR", 620, 1, 700, results)

	tenant_amina = ensure_tenant(
		"Amina Hassan",
		customer_group,
		"amina.demo@example.com",
		"+252610000101",
		results,
	)
	tenant_omar = ensure_tenant(
		"Omar Ali",
		customer_group,
		"omar.demo@example.com",
		"+252610000102",
		results,
	)

	contract_amina = ensure_contract(project.name, unit_101.name, tenant_amina.name, 950, 950, results)
	contract_omar = ensure_contract(project.name, unit_102.name, tenant_omar.name, 700, 700, results)

	electricity = ensure_utility_property("Demo Electricity", "Electricity", company.name, cost_center, results)
	water = ensure_utility_property("Demo Water", "Water", company.name, cost_center, results)
	bill_structure = ensure_bill_structure(results)
	ensure_adjustment_rule(results)

	service_request = ensure_utility_service_request(
		tenant_amina.name,
		electricity.name,
		unit_101.name,
		"Electricity",
		35,
		results,
	)

	if submit_demo_transactions and service_request.status == "Draft":
		service_request.status = "Approved"
		service_request.save(ignore_permissions=True)
		results["created"].append(f"Sales Order for {service_request.name}")

	serial = ensure_meter_serial(items["meter"], company.name, warehouse, results)
	meter_reading = ensure_meter_reading(
		tenant_amina.name,
		unit_101.name,
		electricity.name,
		serial.name,
		bill_structure.name,
		results,
	)

	if submit_demo_transactions and meter_reading.docstatus == 0:
		meter_reading.submit()
		results["created"].append(f"Sales Invoice for {meter_reading.name}")

	supplier = ensure_supplier("Gurimaal Demo Maintenance Vendor", supplier_group, results)
	vendor = ensure_vendor("Gurimaal Demo Maintenance Vendor", supplier.name, results)
	maintenance_request = ensure_maintenance_request(
		unit_101.name,
		tenant_amina.name,
		water.name,
		results,
	)
	ensure_maintenance_job(maintenance_request.name, vendor.name, results)

	frappe.db.commit()
	frappe.clear_cache()

	print(json.dumps(results, indent=2, sort_keys=True))
	return results


def ensure_company(company_name, abbr, currency, country, results):
	if frappe.db.exists("Company", company_name):
		results["reused"].append(f"Company {company_name}")
		return frappe.get_doc("Company", company_name)

	if not frappe.db.exists("Currency", currency):
		currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

	if not frappe.db.exists("Country", country):
		country = "United States" if frappe.db.exists("Country", "United States") else frappe.db.get_value("Country", {})

	doc = frappe.get_doc(
		{
			"doctype": "Company",
			"company_name": company_name,
			"abbr": abbr,
			"default_currency": currency,
			"country": country,
			"valuation_method": "FIFO",
			"create_chart_of_accounts_based_on": "Standard Template",
			"chart_of_accounts": "Standard",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Company {doc.name}")
	return doc


def configure_utility_billing_settings(company, income_account, cost_center, results):
	settings = frappe.get_single("Utility Billing Settings")
	settings.company = company
	if hasattr(settings, "default_income_account"):
		settings.default_income_account = income_account
	if hasattr(settings, "income_account"):
		settings.income_account = income_account
	if hasattr(settings, "default_cost_center"):
		settings.default_cost_center = cost_center
	if hasattr(settings, "cost_center"):
		settings.cost_center = cost_center
	settings.auto_create_customer = 1
	settings.require_contract = 1
	settings.invoice_status = "Draft"
	settings.save(ignore_permissions=True)
	results["created"].append("Updated Utility Billing Settings")


def ensure_items(company, item_group, warehouse, income_account, cost_center, results):
	return {
		"rent": ensure_item("Rent Item", item_group, company, income_account, cost_center, results),
		"utility_connection": ensure_item(
			"Utility Connection Charge", item_group, company, income_account, cost_center, results
		),
		"utility_consumption": ensure_item(
			"Utility Consumption", item_group, company, income_account, cost_center, results
		),
		"meter": ensure_item(
			"Utility Meter",
			item_group,
			company,
			income_account,
			cost_center,
			results,
			is_stock_item=1,
			has_serial_no=1,
			warehouse=warehouse,
		),
	}


def ensure_item(
	item_code,
	item_group,
	company,
	income_account,
	cost_center,
	results,
	is_stock_item=0,
	has_serial_no=0,
	warehouse=None,
):
	if frappe.db.exists("Item", item_code):
		results["reused"].append(f"Item {item_code}")
		return item_code
	else:
		item = frappe.get_doc(
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
		if is_stock_item and warehouse:
			item.default_warehouse = warehouse
		elif item.meta.has_field("default_warehouse"):
			item.default_warehouse = None
		item.insert(ignore_permissions=True)
		results["created"].append(f"Item {item_code}")

	return item.name


def ensure_unit(floor, unit_no, unit_type, area_sqft, bedrooms, monthly_rent, results):
	return ensure_doc(
		"Rental Unit",
		{"floor": floor, "unit_no": unit_no},
		{
			"floor": floor,
			"unit_no": unit_no,
			"unit_type": unit_type,
			"area_sqft": area_sqft,
			"bedrooms": bedrooms,
			"monthly_rent": monthly_rent,
			"status": "Vacant",
		},
		results,
	)


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


def ensure_contract(project, unit, tenant, monthly_rent, deposit, results):
	existing = frappe.db.get_value("Contracts", {"rental_unit": unit, "tenant": tenant})
	if existing:
		results["reused"].append(f"Contracts {existing}")
		return frappe.get_doc("Contracts", existing)

	doc = frappe.get_doc(
		{
			"doctype": "Contracts",
			"rental_property": project,
			"rental_unit": unit,
			"tenant": tenant,
			"contract_start_date": today(),
			"contract_end_date": add_months(today(), 12),
			"monthly_rent": monthly_rent,
			"security_deposit_amount": deposit,
			"escalation_percentage": 5,
			"escalation_interval": "Yearly",
			"notice_period_days": 30,
			"status": "Active",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Contracts {doc.name}")
	return doc


def ensure_utility_property(property_name, property_type, company, cost_center, results):
	return ensure_doc(
		"Utility property",
		{"property_name": property_name, "property_type": property_type},
		{
			"property_name": property_name,
			"property_type": property_type,
			"company": company,
			"cost_center": cost_center,
			"status": "Active",
		},
		results,
	)


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
				{"from_units": 300, "to_units": 1000, "rate_per_unit": 0.30, "fixed_charge": 0},
			],
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append("Utility Bill Structure Demo Electricity Slabs")
	return doc


def ensure_adjustment_rule(results):
	filters = {"rule_type": "Surcharge", "applies_to": "All", "priority": 10}
	existing = frappe.db.get_value("Billing Adjustment Rule", filters)
	if existing:
		frappe.db.set_value("Billing Adjustment Rule", existing, "amount_or_percent", 0)
		results["reused"].append(f"Billing Adjustment Rule {existing}")
		return frappe.get_doc("Billing Adjustment Rule", existing)

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
	return doc


def ensure_utility_service_request(tenant, utility_property, unit, service_type, monthly_amount, results):
	existing = frappe.db.get_value(
		"Utility Service Request",
		{"tenant": tenant, "unit": unit, "service_type": service_type},
	)
	if existing:
		results["reused"].append(f"Utility Service Request {existing}")
		return frappe.get_doc("Utility Service Request", existing)

	doc = frappe.get_doc(
		{
			"doctype": "Utility Service Request",
			"tenant": tenant,
			"property": utility_property,
			"unit": unit,
			"service_type": service_type,
			"monthly_amount": monthly_amount,
			"status": "Draft",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Utility Service Request {doc.name}")
	return doc


def ensure_meter_serial(item_code, company, warehouse, results):
	serial_no = "GUR-DEMO-MTR-0001"
	if frappe.db.exists("Serial No", serial_no):
		results["reused"].append(f"Serial No {serial_no}")
		return frappe.get_doc("Serial No", serial_no)

	doc = frappe.get_doc(
		{
			"doctype": "Serial No",
			"serial_no": serial_no,
			"item_code": item_code,
			"company": company,
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Serial No {serial_no}")
	return doc


def ensure_meter_reading(tenant, unit, utility_property, serial_no, bill_structure, results):
	existing = frappe.db.get_value("Meter Reading", {"meter_serial_no": serial_no, "reading_date": today()})
	if existing:
		results["reused"].append(f"Meter Reading {existing}")
		return frappe.get_doc("Meter Reading", existing)

	doc = frappe.get_doc(
		{
			"doctype": "Meter Reading",
			"tenant": tenant,
			"unit": unit,
			"property": utility_property,
			"meter_serial_no": serial_no,
			"reading_date": today(),
			"previous_reading": 120,
			"current_reading": 185,
			"bill_structure": bill_structure,
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Meter Reading {doc.name}")
	return doc


def ensure_supplier(supplier_name, supplier_group, results):
	if frappe.db.exists("Supplier", supplier_name):
		results["reused"].append(f"Supplier {supplier_name}")
		return frappe.get_doc("Supplier", supplier_name)

	doc = frappe.get_doc(
		{
			"doctype": "Supplier",
			"supplier_name": supplier_name,
			"supplier_group": supplier_group,
			"supplier_type": "Company",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Supplier {supplier_name}")
	return doc


def ensure_vendor(vendor_name, supplier, results):
	return ensure_doc(
		"Vendor",
		{"vendor_name": vendor_name},
		{
			"vendor_name": vendor_name,
			"trade": "General",
			"phone": "+252610009999",
			"suplier": supplier,
		},
		results,
	)


def ensure_maintenance_request(unit, tenant, utility_property, results):
	description = "Demo water pressure issue in kitchen."
	existing = frappe.db.get_value(
		"Maintenance Request",
		{"unit": unit, "tenant": tenant, "description": description},
	)
	if existing:
		results["reused"].append(f"Maintenance Request {existing}")
		return frappe.get_doc("Maintenance Request", existing)

	doc = frappe.get_doc(
		{
			"doctype": "Maintenance Request",
			"unit": unit,
			"tenant": tenant,
			"property": utility_property,
			"category": "Plumbing",
			"priority": "Medium",
			"description": description,
			"reported_date": today(),
			"status": "Open",
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Maintenance Request {doc.name}")
	return doc


def ensure_maintenance_job(request, vendor, results):
	return ensure_doc(
		"Maintenance Job",
		{"request": request, "vendor": vendor},
		{
			"request": request,
			"vendor": vendor,
			"estimated_cost": 75,
			"schedule_date": today(),
			"status": "Scheduled",
		},
		results,
	)


def ensure_doc(doctype, filters, values, results):
	existing = frappe.db.get_value(doctype, filters)
	if existing:
		results["reused"].append(f"{doctype} {existing}")
		return frappe.get_doc(doctype, existing)

	doc = frappe.get_doc({"doctype": doctype, **values})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"{doctype} {doc.name}")
	return doc


def delete_all_docs(doctype, results, filters=None):
	if not frappe.db.exists("DocType", doctype):
		results["skipped"].append(f"Missing DocType {doctype}")
		return

	for name in frappe.get_all(doctype, filters=filters or {}, pluck="name"):
		delete_if_exists(doctype, name, results)


def delete_if_exists(doctype, name, results):
	if not frappe.db.exists(doctype, name):
		return

	try:
		doc = frappe.get_doc(doctype, name)
		if getattr(doc, "docstatus", 0) == 1:
			doc.cancel()
		frappe.delete_doc(
			doctype,
			name,
			force=True,
			ignore_permissions=True,
			ignore_missing=True,
		)
		results["cleared"].append(f"{doctype} {name}")
	except Exception as exc:
		results["skipped"].append(f"{doctype} {name}: {exc}")


def ensure_customer_group(name, results):
	if frappe.db.exists("Customer Group", name):
		if frappe.db.get_value("Customer Group", name, "is_group"):
			frappe.db.set_value("Customer Group", name, "is_group", 0)
		results["reused"].append(f"Customer Group {name}")
		return name

	parent = "All Customer Groups" if frappe.db.exists("Customer Group", "All Customer Groups") else None
	doc = frappe.get_doc(
		{
			"doctype": "Customer Group",
			"customer_group_name": name,
			"parent_customer_group": parent,
			"is_group": 0,
		}
	)
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Customer Group {name}")
	return doc.name


def ensure_supplier_group(name, results):
	if frappe.db.exists("Supplier Group", name):
		results["reused"].append(f"Supplier Group {name}")
		return name

	parent = "All Supplier Groups" if frappe.db.exists("Supplier Group", "All Supplier Groups") else None
	doc = frappe.get_doc({"doctype": "Supplier Group", "supplier_group_name": name, "parent_supplier_group": parent})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Supplier Group {name}")
	return doc.name


def ensure_item_group(name, results):
	if frappe.db.exists("Item Group", name):
		results["reused"].append(f"Item Group {name}")
		return name

	parent = "All Item Groups" if frappe.db.exists("Item Group", "All Item Groups") else None
	doc = frappe.get_doc({"doctype": "Item Group", "item_group_name": name, "parent_item_group": parent})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Item Group {name}")
	return doc.name


def ensure_warehouse(warehouse_name, company, results):
	existing = frappe.db.get_value("Warehouse", {"warehouse_name": warehouse_name, "company": company})
	if existing:
		results["reused"].append(f"Warehouse {existing}")
		return existing

	doc = frappe.get_doc({"doctype": "Warehouse", "warehouse_name": warehouse_name, "company": company})
	doc.insert(ignore_permissions=True)
	results["created"].append(f"Warehouse {doc.name}")
	return doc.name


def get_income_account(company):
	return (
		frappe.db.get_value("Company", company, "default_income_account")
		or frappe.db.get_value("Account", {"company": company, "account_type": "Income Account", "is_group": 0})
		or frappe.db.get_value("Account", {"company": company, "root_type": "Income", "is_group": 0})
	)


def get_expense_account(company):
	return (
		frappe.db.get_value("Company", company, "default_expense_account")
		or frappe.db.get_value("Account", {"company": company, "account_type": "Expense Account", "is_group": 0})
		or frappe.db.get_value("Account", {"company": company, "root_type": "Expense", "is_group": 0})
	)


def get_cost_center(company):
	return (
		frappe.db.get_value("Company", company, "cost_center")
		or frappe.db.get_value("Cost Center", {"company": company, "is_group": 0})
	)


def get_uom():
	return frappe.db.get_value("UOM", "Nos") or frappe.db.get_value("UOM", {})
