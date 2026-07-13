import frappe
from frappe import _
from frappe.utils import today
from frappe.utils.file_manager import save_file

from gurimaal.api.utils import get_current_customer, get_current_tenant, get_list, parse_limit, require_tenant_unit, success


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024

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
		filters["status"] = normalize_status(status)

	requests = get_list(
		"Maintenance Request",
		filters=filters,
		fields=MAINTENANCE_FIELDS,
		order_by="reported_date desc, creation desc",
		limit_page_length=parse_limit(limit),
	)
	add_attachments(requests)

	return success(requests)


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
	data["attachments"] = get_attachments(doc.name)
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


@frappe.whitelist()
def upload_attachment(request):
	doc = get_maintenance_request_for_tenant(request)
	uploaded_file = frappe.request.files.get("file")
	if not uploaded_file or not uploaded_file.filename:
		frappe.throw(_("Image file is required."), frappe.ValidationError)

	content = uploaded_file.stream.read()
	if not content:
		frappe.throw(_("Image file is empty."), frappe.ValidationError)

	if len(content) > MAX_ATTACHMENT_SIZE:
		frappe.throw(_("Images must be 10MB or smaller."), frappe.ValidationError)

	content_type = uploaded_file.content_type
	if content_type not in ALLOWED_IMAGE_TYPES:
		frappe.throw(_("Only JPG, PNG, or WEBP images can be uploaded."), frappe.ValidationError)

	file_doc = save_file(
		uploaded_file.filename,
		content,
		"Maintenance Request",
		doc.name,
		is_private=1,
	)

	return success(serialize_attachment(file_doc), _("Image uploaded successfully."))


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


def normalize_status(status):
	status_map = {
		"open": "Open",
		"in-progress": "In Progress",
		"in progress": "In Progress",
		"assigned": "In Progress",
		"resolved": "Resolved",
		"completed": "Resolved",
		"closed": "Closed",
	}
	return status_map.get(str(status).strip().lower(), status)


def add_attachments(requests):
	for request in requests:
		request["attachments"] = get_attachments(request.name)


def get_attachments(request):
	return [
		serialize_attachment(file_doc)
		for file_doc in frappe.get_all(
			"File",
			filters={
				"attached_to_doctype": "Maintenance Request",
				"attached_to_name": request,
			},
			fields=["name", "file_name", "file_url", "is_private", "creation"],
			order_by="creation asc",
			ignore_permissions=True,
		)
	]


def serialize_attachment(file_doc):
	return {
		"name": file_doc.name,
		"file_name": file_doc.file_name,
		"file_url": file_doc.file_url,
		"is_private": file_doc.is_private,
		"creation": file_doc.creation,
	}
