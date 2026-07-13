import frappe
from frappe import _
from frappe.utils import today

from gurimaal.api.utils import get_current_customer, get_current_tenant, get_list, parse_limit, require_tenant_unit, success


MAINTENANCE_FIELDS = [
	"name",
	"unit",
	"tenant",
	"customer",
	"property",
	"category",
	"priority",
	"description",
	"reported_date",
	"resolved_date",
	"assigned_to",
	"status",
	"issue",
]


@frappe.whitelist()
def list_requests(status=None, limit=20):
	return request_list(status=status, limit=limit)


@frappe.whitelist()
def request_list(status=None, limit=20):
	tenant = get_current_tenant()
	filters = {"tenant": tenant.name}
	if status:
		filters["status"] = status

	return success(
		get_list(
			"Maintenance Request",
			filters=filters,
			fields=MAINTENANCE_FIELDS,
			order_by="reported_date desc, creation desc",
			limit_page_length=parse_limit(limit),
		)
	)


@frappe.whitelist()
def create_request(unit, description, category=None, priority="Medium", property=None):
	tenant = get_current_tenant()
	customer = get_current_customer()
	require_tenant_unit(unit)

	doc = frappe.get_doc(
		{
			"doctype": "Maintenance Request",
			"unit": unit,
			"tenant": tenant.name,
			"customer": customer,
			"property": property,
			"category": category,
			"priority": priority,
			"description": description,
			"reported_date": today(),
			"status": "Open",
		}
	)
	doc.insert(ignore_permissions=True)
	return success({"name": doc.name}, _("Maintenance request created successfully."))


@frappe.whitelist()
def request_detail(request):
	doc = get_maintenance_request_for_tenant(request)
	data = {field: doc.get(field) for field in MAINTENANCE_FIELDS}
	data["comments"] = get_comments(doc.name)
	return success(data)


@frappe.whitelist()
def add_comment(request, comment):
	if not comment:
		frappe.throw(_("Comment is required."), frappe.ValidationError)

	doc = get_maintenance_request_for_tenant(request)
	comment_doc = frappe.get_doc(
		{
			"doctype": "Comment",
			"comment_type": "Comment",
			"reference_doctype": "Maintenance Request",
			"reference_name": doc.name,
			"content": comment,
		}
	)
	comment_doc.insert(ignore_permissions=True)

	return success(
		{
			"name": comment_doc.name,
			"comment": {
				"name": comment_doc.name,
				"owner": comment_doc.owner,
				"content": comment_doc.content,
				"creation": comment_doc.creation,
			},
		},
		_("Comment added successfully."),
	)


def get_maintenance_request_for_tenant(request):
	tenant = get_current_tenant()
	doc = frappe.get_doc("Maintenance Request", request)
	if doc.tenant != tenant.name:
		frappe.throw(_("You are not allowed to access this request."), frappe.PermissionError)

	return doc


def get_comments(request):
	return frappe.get_all(
		"Comment",
		filters={
			"reference_doctype": "Maintenance Request",
			"reference_name": request,
			"comment_type": "Comment",
		},
		fields=["name", "owner", "content", "creation"],
		order_by="creation asc",
		ignore_permissions=True,
	)
