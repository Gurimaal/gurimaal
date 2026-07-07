import frappe
from frappe import _

from gurimaal.api.utils import get_current_tenant, get_tenant_profile, success


PROFILE_UPDATE_FIELDS = {"mobile_no", "email"}


@frappe.whitelist()
def get_profile():
	return success(get_tenant_profile())


@frappe.whitelist()
def update_profile(**kwargs):
	tenant = get_current_tenant()

	for field in PROFILE_UPDATE_FIELDS:
		if field in kwargs:
			tenant.set(field, kwargs.get(field))

	tenant.save(ignore_permissions=True)
	return success(get_tenant_profile(), _("Profile updated successfully."))
