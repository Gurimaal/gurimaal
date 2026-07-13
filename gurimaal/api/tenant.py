import frappe
from frappe import _
from frappe.utils import validate_email_address

from gurimaal.api.utils import get_current_tenant, get_tenant_profile, success


PROFILE_UPDATE_FIELDS = {"mobile_no", "email"}


@frappe.whitelist()
def get_profile():
	return success(get_tenant_profile())


@frappe.whitelist()
def update_profile(**kwargs):
	tenant = get_current_tenant()

	if "email" in kwargs:
		email = (kwargs.get("email") or "").strip()
		if not email:
			frappe.throw(_("Email address is required."), frappe.ValidationError)
		validate_email_address(email, throw=True)
		kwargs["email"] = email

	if "mobile_no" in kwargs:
		mobile_no = (kwargs.get("mobile_no") or "").strip()
		if not mobile_no:
			frappe.throw(_("Phone number is required."), frappe.ValidationError)
		kwargs["mobile_no"] = mobile_no

	for field in PROFILE_UPDATE_FIELDS:
		if field in kwargs:
			tenant.set(field, kwargs.get(field))

	tenant.save(ignore_permissions=True)
	return success(get_tenant_profile(), _("Profile updated successfully."))
