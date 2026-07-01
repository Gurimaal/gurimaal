import frappe
from frappe import _


def get_default_customer_group():
	customer_group = frappe.db.get_single_value("Selling Settings", "customer_group")
	if customer_group and not frappe.db.get_value("Customer Group", customer_group, "is_group"):
		return customer_group

	customer_group = frappe.db.get_value("Customer Group", {"is_group": 0}, "name")
	if customer_group:
		return customer_group

	return frappe.db.get_value("Customer Group", {}, "name")


def is_auto_create_customer_enabled():
	value = frappe.db.get_single_value("Utility Billing Settings", "auto_create_customer")
	return bool(value)


def ensure_customer_for_tenant(tenant):
	if isinstance(tenant, str):
		tenant = frappe.get_doc("Tenant", tenant)

	if tenant.customer:
		return tenant.customer

	if not is_auto_create_customer_enabled():
		return None

	customer_group = tenant.customer_group or get_default_customer_group()
	if not customer_group:
		frappe.throw(_("A Customer Group is required before creating a Customer for Tenant {0}.").format(tenant.name))

	customer = frappe.get_doc(
		{
			"doctype": "Customer",
			"customer_name": tenant.tenant_name,
			"customer_type": "Individual",
			"customer_group": customer_group,
		}
	)

	if tenant.user and frappe.get_meta("Customer").has_field("portal_users"):
		customer.append("portal_users", {"user": tenant.user})

	customer.insert(ignore_permissions=True)
	tenant.db_set("customer", customer.name, update_modified=False)
	return customer.name


def sync_customer_from_tenant(doc, required=False):
	if not doc.get("tenant"):
		if required:
			frappe.throw(_("Tenant is required."))
		return doc.get("customer")

	customer = ensure_customer_for_tenant(doc.tenant)
	if customer:
		doc.customer = customer
	elif required:
		frappe.throw(
			_("Tenant {0} does not have a linked Customer. Enable auto-create or link a Customer first.")
			.format(doc.tenant)
		)

	return doc.get("customer")
