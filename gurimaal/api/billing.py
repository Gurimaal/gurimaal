import frappe
from frappe import _
from frappe.utils import flt, today

from gurimaal.api.utils import get_current_customer, parse_limit, success


INVOICE_FIELDS = [
	"name",
	"posting_date",
	"due_date",
	"grand_total",
	"outstanding_amount",
	"status",
	"docstatus",
]
PAYMENT_FIELDS = ["name", "posting_date", "paid_amount", "received_amount", "reference_no", "status", "docstatus"]
INVOICE_ITEM_FIELDS = ["item_code", "item_name", "description", "qty", "rate", "amount"]


@frappe.whitelist()
def list_invoices(status=None, limit=20):
	return invoice_list(status=status, limit=limit)


@frappe.whitelist()
def invoice_list(status=None, limit=20):
	customer = get_current_customer(required=True)
	filters = {"customer": customer}
	if status:
		filters["status"] = status

	return success(
		frappe.get_all(
			"Sales Invoice",
			filters=filters,
			fields=INVOICE_FIELDS,
			order_by="posting_date desc, creation desc",
			limit_page_length=parse_limit(limit),
			ignore_permissions=True,
		)
	)


@frappe.whitelist()
def get_invoice(invoice):
	return invoice_detail(invoice)


@frappe.whitelist()
def invoice_detail(invoice):
	customer = get_current_customer(required=True)
	doc = frappe.get_doc("Sales Invoice", invoice)
	if doc.customer != customer:
		frappe.throw(_("You are not allowed to access this invoice."), frappe.PermissionError)

	return success(
		{
			"name": doc.name,
			"posting_date": doc.posting_date,
			"due_date": doc.due_date,
			"customer": doc.customer,
			"grand_total": doc.grand_total,
			"outstanding_amount": doc.outstanding_amount,
			"status": doc.status,
			"docstatus": doc.docstatus,
			"items": [
				{field: item.get(field) for field in INVOICE_ITEM_FIELDS}
				for item in doc.items
			],
		}
	)


@frappe.whitelist()
def get_outstanding_summary():
	return outstanding_summary()


@frappe.whitelist()
def outstanding_summary():
	customer = get_current_customer(required=True)
	invoices = frappe.get_all(
		"Sales Invoice",
		filters={"customer": customer, "docstatus": 1, "outstanding_amount": [">", 0]},
		fields=["name", "due_date", "outstanding_amount"],
		order_by="due_date asc",
		ignore_permissions=True,
	)
	return success(
		{
			"total_outstanding": sum(flt(invoice.outstanding_amount) for invoice in invoices),
			"invoice_count": len(invoices),
			"invoices": invoices,
		}
	)


@frappe.whitelist()
def list_payments(limit=20):
	return payment_history(limit=limit)


@frappe.whitelist()
def payment_history(limit=20):
	customer = get_current_customer(required=True)
	return success(
		frappe.get_all(
			"Payment Entry",
			filters={"party_type": "Customer", "party": customer},
			fields=PAYMENT_FIELDS,
			order_by="posting_date desc, creation desc",
			limit_page_length=parse_limit(limit),
			ignore_permissions=True,
		)
	)


@frappe.whitelist()
def pay_invoice(invoice, amount=None, mode_of_payment=None, paid_to=None, reference_no=None, reference_date=None):
	customer = get_current_customer(required=True)
	invoice_doc = frappe.get_doc("Sales Invoice", invoice)
	if invoice_doc.customer != customer:
		frappe.throw(_("You are not allowed to pay this invoice."), frappe.PermissionError)

	if invoice_doc.docstatus != 1:
		frappe.throw(_("Only submitted invoices can be paid."), frappe.ValidationError)

	outstanding_amount = flt(invoice_doc.outstanding_amount)
	if outstanding_amount <= 0:
		frappe.throw(_("This invoice has no outstanding balance."), frappe.ValidationError)

	paid_amount = flt(amount) if amount is not None else outstanding_amount
	if paid_amount <= 0:
		frappe.throw(_("Payment amount must be greater than zero."), frappe.ValidationError)
	if paid_amount > outstanding_amount:
		frappe.throw(_("Payment amount cannot exceed outstanding balance."), frappe.ValidationError)

	paid_to = paid_to or get_default_payment_account(mode_of_payment, invoice_doc.company)
	if not paid_to:
		frappe.throw(_("Payment account is required to pay this invoice."), frappe.ValidationError)

	payment = frappe.get_doc(
		{
			"doctype": "Payment Entry",
			"payment_type": "Receive",
			"company": invoice_doc.company,
			"posting_date": today(),
			"mode_of_payment": mode_of_payment,
			"party_type": "Customer",
			"party": customer,
			"paid_from": invoice_doc.debit_to,
			"paid_to": paid_to,
			"paid_amount": paid_amount,
			"received_amount": paid_amount,
			"reference_no": reference_no or invoice_doc.name,
			"reference_date": reference_date or today(),
			"references": [
				{
					"reference_doctype": "Sales Invoice",
					"reference_name": invoice_doc.name,
					"total_amount": invoice_doc.grand_total,
					"outstanding_amount": outstanding_amount,
					"allocated_amount": paid_amount,
				}
			],
		}
	)
	payment.insert(ignore_permissions=True)
	payment.submit()

	return success(
		{
			"name": payment.name,
			"paid_amount": payment.paid_amount,
			"invoice": invoice_doc.name,
		},
		_("Payment recorded successfully."),
	)


def get_default_payment_account(mode_of_payment, company):
	if not mode_of_payment:
		return None

	return frappe.db.get_value(
		"Mode of Payment Account",
		{
			"parent": mode_of_payment,
			"company": company,
		},
		"default_account",
	)
