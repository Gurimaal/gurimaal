import json

import frappe
from frappe.utils import add_months, today
from frappe.utils.password import update_password

from gurimaal.utils.setup_demo_data import ensure_company, ensure_customer_group, ensure_doc
from gurimaal.utils.tenancy import ensure_customer_for_tenant, get_default_customer_group


DEFAULT_EMAIL = "engruweyda@gmail.com"
DEFAULT_PASSWORD = "Ruweyda@123"
TENANT_NAME = "Ruweyda"
SOMALI_PHONE = "+252 61 000 0201"
PROJECT_NAME = "Gurimaal Holwadaag Residence"
BUILDING_NAME = "Holwadaag Gurimaal Apartments"
PROJECT_ADDRESS = "Wadada Maka Al-Mukarama, Holwadaag District"
PROJECT_CITY = "Mogadishu, Somalia"


def run(email=DEFAULT_EMAIL, password=DEFAULT_PASSWORD):
	"""Create or repair the tenancy chain for Ruweyda.

	This only creates the tenancy/property/contract records needed by the tenant
	portal. It does not create invoices, payments, meter readings, or demo
	transactions.
	"""
	results = {"created": [], "reused": [], "updated": [], "skipped": []}

	company = ensure_company(results)
	customer_group = ensure_customer_group(results)
	user = ensure_user(email=email, password=password, results=results)
	property_data = ensure_property_chain(company=company, results=results)
	tenant = ensure_tenant(
		email=email,
		user=user.name,
		customer_group=customer_group or get_default_customer_group(),
		results=results,
	)
	contract = ensure_contract(property_data=property_data, tenant=tenant, results=results)

	frappe.db.commit()
	frappe.clear_cache()

	results["summary"] = {
		"email": email,
		"password": password,
		"user": user.name,
		"tenant": tenant.name,
		"tenant_name": tenant.tenant_name,
		"customer": tenant.customer,
		"project": property_data["project"].name,
		"building": property_data["building"].name,
		"floor": property_data["floor"].name,
		"unit": property_data["unit"].name,
		"contract": contract.name,
	}
	print(json.dumps(results, indent=2, sort_keys=True))
	return results


def verify(email=DEFAULT_EMAIL):
	"""Verify that the tenant portal can resolve Ruweyda's property and contract."""
	frappe.set_user(email)
	from gurimaal.api.contract import active_contract
	from gurimaal.api.property import get_my_property
	from gurimaal.api.tenant import get_profile

	result = {
		"user": frappe.session.user,
		"profile": get_profile(),
		"property": get_my_property(),
		"contract": active_contract(),
	}
	print(json.dumps(result, indent=2, sort_keys=True, default=str))
	return result


def ensure_user(email, password, results):
	if frappe.db.exists("User", email):
		user = frappe.get_doc("User", email)
		results["reused"].append(f"User {email}")
	else:
		user = frappe.get_doc(
			{
				"doctype": "User",
				"email": email,
				"first_name": TENANT_NAME,
				"full_name": TENANT_NAME,
				"enabled": 1,
				"user_type": "Website User",
				"send_welcome_email": 0,
				"new_password": password,
			}
		)
		user.insert(ignore_permissions=True)
		results["created"].append(f"User {email}")

	user.enabled = 1
	user.first_name = TENANT_NAME
	user.full_name = TENANT_NAME
	user.user_type = "Website User"
	if user.meta.has_field("mobile_no"):
		user.mobile_no = SOMALI_PHONE
	user.save(ignore_permissions=True)
	update_password(email, password)

	if frappe.db.exists("Role", "Website User") and not any(row.role == "Website User" for row in user.roles):
		user.append("roles", {"role": "Website User"})
		user.save(ignore_permissions=True)
		results["updated"].append(f"Added Website User role to {email}")

	return user


def ensure_property_chain(company, results):
	project = ensure_doc(
		"Real Estate Project",
		{"project_name": PROJECT_NAME, "company": company},
		{
			"project_name": PROJECT_NAME,
			"company": company,
			"address": PROJECT_ADDRESS,
			"city": PROJECT_CITY,
			"status": "Active",
			"description": "Residential tenancy property for Ruweyda in Holwadaag, Mogadishu.",
		},
		results,
	)
	project.update(
		{
			"project_name": PROJECT_NAME,
			"address": PROJECT_ADDRESS,
			"city": PROJECT_CITY,
			"status": "Active",
			"description": "Residential tenancy property for Ruweyda in Holwadaag, Mogadishu.",
		}
	)
	project.save(ignore_permissions=True)
	results["updated"].append(f"Real Estate Project {project.name} set to Holwadaag address")

	building = ensure_doc(
		"Rental Building",
		{"project": project.name, "building_name": BUILDING_NAME},
		{
			"project": project.name,
			"building_name": BUILDING_NAME,
			"total_floors": 2,
			"status": "Active",
		},
		results,
	)
	building.update({"building_name": BUILDING_NAME, "total_floors": 2, "status": "Active"})
	building.save(ignore_permissions=True)
	results["updated"].append(f"Rental Building {building.name} set to {BUILDING_NAME}")

	floor = ensure_doc(
		"Rental Floor",
		{"building": building.name, "floor_number": 2},
		{
			"building": building.name,
			"floor_name": "Second Floor",
			"floor_number": 2,
		},
		results,
	)
	floor.update({"floor_name": "Second Floor", "floor_number": 2})
	floor.save(ignore_permissions=True)

	unit = ensure_doc(
		"Rental Unit",
		{"floor": floor.name, "unit_no": "R-201"},
		{
			"floor": floor.name,
			"unit_no": "R-201",
			"unit_type": "2BR",
			"area_sqft": 920,
			"bedrooms": 2,
			"monthly_rent": 1200,
			"status": "Vacant",
		},
		results,
	)
	unit.update(
		{
			"unit_no": "R-201",
			"unit_type": "2BR",
			"area_sqft": 920,
			"bedrooms": 2,
			"monthly_rent": 1200,
		}
	)
	unit.save(ignore_permissions=True)
	return {"project": project, "building": building, "floor": floor, "unit": unit}


def ensure_tenant(email, user, customer_group, results):
	tenant_name = (
		frappe.db.get_value("Tenant", {"user": user}, "name")
		or frappe.db.get_value("Tenant", {"email": email}, "name")
		or frappe.db.get_value("Tenant", {"tenant_name": TENANT_NAME}, "name")
	)

	if tenant_name:
		tenant = frappe.get_doc("Tenant", tenant_name)
		results["reused"].append(f"Tenant {tenant.name}")
	else:
		tenant = frappe.get_doc(
			{
				"doctype": "Tenant",
				"tenant_name": TENANT_NAME,
				"user": user,
				"email": email,
				"mobile_no": SOMALI_PHONE,
				"national_id": "RUW-000201",
				"customer_group": customer_group,
				"status": "Active",
			}
		)
		tenant.insert(ignore_permissions=True)
		results["created"].append(f"Tenant {tenant.name}")

	tenant.tenant_name = TENANT_NAME
	tenant.user = user
	tenant.email = email
	tenant.mobile_no = SOMALI_PHONE
	tenant.customer_group = tenant.customer_group or customer_group
	tenant.status = "Active"
	if not tenant.national_id:
		tenant.national_id = "RUW-000201"
	tenant.save(ignore_permissions=True)
	results["updated"].append(f"Tenant {tenant.name} linked to {email}")

	customer = ensure_customer_for_tenant(tenant)
	if not customer:
		customer = ensure_customer(tenant=tenant, customer_group=tenant.customer_group or customer_group, results=results)
	tenant.reload()
	return tenant


def ensure_customer(tenant, customer_group, results):
	customer_name = frappe.db.get_value("Customer", {"customer_name": tenant.tenant_name}, "name")
	if customer_name:
		results["reused"].append(f"Customer {customer_name}")
	else:
		customer = frappe.get_doc(
			{
				"doctype": "Customer",
				"customer_name": tenant.tenant_name,
				"customer_type": "Individual",
				"customer_group": customer_group or get_default_customer_group(),
			}
		)
		if tenant.user and frappe.get_meta("Customer").has_field("portal_users"):
			customer.append("portal_users", {"user": tenant.user})
		customer.insert(ignore_permissions=True)
		customer_name = customer.name
		results["created"].append(f"Customer {customer_name}")

	tenant.db_set("customer", customer_name, update_modified=False)
	results["updated"].append(f"Linked Tenant {tenant.name} to Customer {customer_name}")
	return customer_name


def ensure_contract(property_data, tenant, results):
	existing = frappe.db.get_value(
		"Contracts",
		{"tenant": tenant.name, "rental_unit": property_data["unit"].name},
		"name",
	)

	values = {
		"rental_property": property_data["project"].name,
		"rental_unit": property_data["unit"].name,
		"tenant": tenant.name,
		"contract_start_date": today(),
		"contract_end_date": add_months(today(), 12),
		"monthly_rent": 1200,
		"security_deposit_amount": 2400,
		"escalation_percentage": 5,
		"escalation_interval": "Yearly",
		"notice_period_days": 30,
		"status": "Active",
	}

	if existing:
		contract = frappe.get_doc("Contracts", existing)
		contract.update(values)
		contract.save(ignore_permissions=True)
		results["updated"].append(f"Contracts {contract.name}")
	else:
		contract = frappe.get_doc({"doctype": "Contracts", **values})
		contract.insert(ignore_permissions=True)
		results["created"].append(f"Contracts {contract.name}")

	frappe.db.set_value("Rental Unit", property_data["unit"].name, "status", "Occupied")
	results["updated"].append(f"Rental Unit {property_data['unit'].name} marked Occupied")
	return contract
