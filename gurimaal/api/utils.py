import frappe
from frappe import _


GUEST_USER = "Guest"
TENANT_FIELDS = [
	"name",
	"tenant_name",
	"user",
	"customer",
	"mobile_no",
	"email",
	"national_id",
	"status",
]


def require_portal_user():
	user = frappe.session.user
	if not user or user == GUEST_USER:
		frappe.throw(_("Please sign in to continue."), frappe.PermissionError)

	return user


def get_current_tenant(required=True):
	user = require_portal_user()
	tenant_name = frappe.db.get_value("Tenant", {"user": user}, "name")

	if not tenant_name:
		email = frappe.db.get_value("User", user, "email")
		if email:
			tenant_name = frappe.db.get_value("Tenant", {"email": email}, "name")

	if not tenant_name and required:
		frappe.throw(_("No Tenant profile is linked to this user."), frappe.PermissionError)

	if not tenant_name:
		return None

	return frappe.get_doc("Tenant", tenant_name)


def get_current_tenant_name(required=True):
	tenant = get_current_tenant(required=required)
	return tenant.name if tenant else None


def get_current_customer(required=False):
	tenant = get_current_tenant(required=required)
	if not tenant:
		return None

	if tenant.customer:
		return tenant.customer

	if required:
		frappe.throw(_("No Customer is linked to this Tenant."), frappe.PermissionError)

	return None


def serialize_doc(doc, fields):
	return {field: doc.get(field) for field in fields if field in doc.as_dict()}


def get_tenant_profile():
	tenant = get_current_tenant()
	return serialize_doc(tenant, TENANT_FIELDS)


def get_active_contract(tenant_name=None):
	tenant_name = tenant_name or get_current_tenant_name()
	contract_name = frappe.db.get_value(
		"Contracts",
		{"tenant": tenant_name, "status": "Active"},
		"name",
		order_by="contract_start_date desc, creation desc",
	)
	if not contract_name:
		return None

	return frappe.get_doc("Contracts", contract_name)


def get_contract_filters(tenant_name=None):
	return {"tenant": tenant_name or get_current_tenant_name()}


def get_contract_unit_names(tenant_name=None):
	tenant_name = tenant_name or get_current_tenant_name()
	return [
		row.rental_unit
		for row in frappe.get_all(
			"Contracts",
			filters={"tenant": tenant_name},
			fields=["rental_unit"],
			ignore_permissions=True,
		)
		if row.rental_unit
	]


def require_tenant_unit(unit):
	if not unit:
		frappe.throw(_("Unit is required."), frappe.ValidationError)

	if unit not in get_contract_unit_names():
		frappe.throw(_("You are not allowed to access this unit."), frappe.PermissionError)

	return unit


def get_list(doctype, filters=None, fields=None, order_by=None, limit_page_length=20):
	return frappe.get_all(
		doctype,
		filters=filters or {},
		fields=fields or ["name"],
		order_by=order_by,
		limit_page_length=limit_page_length,
		ignore_permissions=True,
	)


def get_doc_for_tenant(doctype, name, tenant_field="tenant"):
	doc = frappe.get_doc(doctype, name)
	tenant_name = get_current_tenant_name()
	if doc.get(tenant_field) != tenant_name:
		frappe.throw(_("You are not allowed to access this record."), frappe.PermissionError)

	return doc


def parse_limit(limit=20, maximum=100):
	try:
		limit = int(limit)
	except (TypeError, ValueError):
		limit = 20

	return max(1, min(limit, maximum))


def success(data=None, message=None):
	response = {"ok": True, "data": data}
	if message:
		response["message"] = message
	return response
