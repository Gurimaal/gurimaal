import frappe
from frappe import _
from frappe.auth import LoginManager

from gurimaal.api.utils import get_tenant_profile, require_portal_user, success


def _get_safe_user(user):
	user_doc = frappe.get_doc("User", user)
	return {
		"name": user_doc.name,
		"full_name": user_doc.full_name,
		"email": user_doc.email,
		"mobile_no": user_doc.mobile_no,
	}


def _get_session_payload():
	user = require_portal_user()
	return {
		"user": _get_safe_user(user),
		"tenant": get_tenant_profile(),
	}


@frappe.whitelist(allow_guest=True)
def login(usr, pwd):
	login_manager = LoginManager()
	login_manager.authenticate(user=usr, pwd=pwd)
	login_manager.post_login()

	return success(
		_get_session_payload(),
		_("Signed in successfully."),
	)


@frappe.whitelist()
def logout():
	require_portal_user()
	frappe.local.login_manager.logout()
	return success(message=_("Signed out successfully."))


@frappe.whitelist()
def me():
	return success(_get_session_payload())
