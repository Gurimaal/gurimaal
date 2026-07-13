import frappe
from frappe.utils.password import update_password


def ensure_demo_login(email="ruweyda@example.com", password="Ruweyda@123"):
	tenant_name = frappe.db.get_value("Tenant", {"tenant_name": "Amina Hassan"}, "name")
	if not tenant_name:
		frappe.throw("Demo tenant Amina Hassan was not found")

	if frappe.db.exists("User", email):
		user = frappe.get_doc("User", email)
		user.enabled = 1
		user.first_name = "Ruweyda"
		user.full_name = "Ruweyda Tenant"
		user.user_type = "Website User"
		user.save(ignore_permissions=True)
		update_password(email, password)
	else:
		user = frappe.get_doc(
			{
				"doctype": "User",
				"email": email,
				"first_name": "Ruweyda",
				"full_name": "Ruweyda Tenant",
				"enabled": 1,
				"user_type": "Website User",
				"send_welcome_email": 0,
				"new_password": password,
			}
		)
		user.insert(ignore_permissions=True)

	if frappe.db.exists("Role", "Website User") and not any(
		row.role == "Website User" for row in user.roles
	):
		user.append("roles", {"role": "Website User"})
		user.save(ignore_permissions=True)

	frappe.db.set_value(
		"Tenant",
		tenant_name,
		{"user": email, "email": email, "status": "Active"},
	)
	frappe.db.commit()

	result = {"email": email, "password": password, "tenant": tenant_name}
	print(result)
	return result
