import frappe

from gurimaal.api.utils import parse_limit, require_portal_user, success


@frappe.whitelist()
def list_notifications(limit=20):
	user = require_portal_user()
	return success(
		frappe.get_all(
			"Notification Log",
			filters={"for_user": user},
			fields=["name", "subject", "type", "document_type", "document_name", "read", "creation"],
			order_by="creation desc",
			limit_page_length=parse_limit(limit),
			ignore_permissions=True,
		)
	)


@frappe.whitelist()
def mark_as_read(notification):
	return mark_read(notification)


@frappe.whitelist()
def mark_read(notification):
	user = require_portal_user()
	doc = frappe.get_doc("Notification Log", notification)
	if doc.for_user != user:
		frappe.throw("You are not allowed to update this notification.", frappe.PermissionError)

	doc.db_set("read", 1, update_modified=False)
	return success({"name": doc.name, "read": 1})


@frappe.whitelist()
def unread_count():
	user = require_portal_user()
	return success(
		{
			"count": frappe.db.count(
				"Notification Log",
				{
					"for_user": user,
					"read": 0,
				},
			)
		}
	)
