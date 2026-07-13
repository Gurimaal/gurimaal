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
	resolved_user = _resolve_login_user(usr)
	if not resolved_user:
		frappe.throw(_("Username-ka ama email-ka waa khaldan yahay."), frappe.AuthenticationError)

	login_manager = LoginManager()
	try:
		login_manager.authenticate(user=resolved_user, pwd=pwd)
	except frappe.AuthenticationError:
		frappe.throw(_("Password-ka waa khaldan yahay."), frappe.AuthenticationError)

	login_manager.post_login()

	return success(
		_get_session_payload(),
		_("Signed in successfully."),
	)


def _resolve_login_user(identifier):
	identifier = " ".join((identifier or "").strip().split())
	if not identifier:
		return None

	for value in {identifier, identifier.lower()}:
		for filters in (
			{"name": value, "enabled": 1},
			{"email": value, "enabled": 1},
			{"username": value, "enabled": 1},
		):
			user = frappe.db.get_value("User", filters, "name")
			if user:
				return user

	for field in ("name", "tenant_name", "email", "mobile_no"):
		tenant_user = frappe.db.get_value("Tenant", {field: identifier}, "user")
		if tenant_user:
			return tenant_user

	tenant_user = frappe.db.get_value(
		"Tenant",
		{"tenant_name": ["like", f"%{identifier}%"]},
		"user",
	)
	if tenant_user:
		return tenant_user

	return None


@frappe.whitelist()
def logout():
	require_portal_user()
	frappe.local.login_manager.logout()
	return success(message=_("Signed out successfully."))


@frappe.whitelist()
def me():
	return success(_get_session_payload())
