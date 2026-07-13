import frappe
from frappe import _
from frappe.utils import today

from gurimaal.api.utils import get_active_contract, get_contract_filters, get_list, parse_limit, serialize_doc, success


CONTRACT_FIELDS = [
	"name",
	"rental_property",
	"rental_unit",
	"tenant",
	"contract_start_date",
	"contract_end_date",
	"monthly_rent",
	"security_deposit_amount",
	"escalation_percentage",
	"escalation_interval",
	"next_escalation_date",
	"notice_period_days",
	"status",
]


@frappe.whitelist()
def list_contracts(limit=20):
	return contract_history(limit=limit)


@frappe.whitelist()
def contract_history(limit=20):
	return success(
		get_list(
			"Contracts",
			filters=get_contract_filters(),
			fields=CONTRACT_FIELDS,
			order_by="contract_start_date desc, creation desc",
			limit_page_length=parse_limit(limit),
		)
	)


@frappe.whitelist()
def get_current_contract():
	return active_contract()


@frappe.whitelist()
def active_contract():
	contract = get_active_contract()
	if not contract:
		return success(None)

	return success(serialize_doc(contract, CONTRACT_FIELDS))


@frappe.whitelist()
def request_renewal(message=None):
	contract = get_active_contract()
	if not contract:
		frappe.throw(_("No active contract found for renewal request."), frappe.ValidationError)

	comment = frappe.get_doc(
		{
			"doctype": "Comment",
			"comment_type": "Comment",
			"reference_doctype": "Contracts",
			"reference_name": contract.name,
			"content": message or _("Tenant requested contract renewal on {0}.").format(today()),
		}
	)
	comment.insert(ignore_permissions=True)

	return success(
		{
			"contract": contract.name,
			"comment": comment.name,
		},
		_("Renewal request submitted successfully."),
	)
