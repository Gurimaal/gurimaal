import frappe
from frappe import _

def create_deposit_sales_order(doc, method=None):
    """
    Hook triggered when a Contract is updated.
    Checks if status changed to active and creates a Sales Order for security deposit.
    """
    if doc.status == "Active" and not frappe.db.exists("Sales Order", {"contract": doc.name, "billing_type": "Deposit"}):
        if not doc.security_deposit_amount:
            return

        so = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": doc.customer,
            "transaction_date": frappe.utils.today(),
            "delivery_date": frappe.utils.today(),
            "contract": doc.name,
            "billing_type": "Deposit",
            "items": [{
                "item_code": "Security Deposit",  # Make sure this Item exists in your desk!
                "qty": 1,
                "rate": doc.security_deposit_amount
            }]
        })
        so.insert(ignore_permissions=True)
        so.submit()
        frappe.msgprint(_("Sales Order {0} created for Security Deposit.").format(so.name))

def create_service_charge_sales_order(doc, method=None):
    """
    Hook triggered when a Utility Service Request is updated.
    Checks if status changed to Approved/Active and creates a Sales Order for connection charges.
    """
    if doc.status in ["Active", "Approved"] and not doc.sales_order:
        if not doc.monthly_amount:
            return

        so = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": doc.customer,
            "transaction_date": frappe.utils.today(),
            "delivery_date": frappe.utils.today(),
            "service_request": doc.name,
            "billing_type": "Utility",
            "items": [{
                "item_code": "Utility Connection Charge",  # Make sure this Item exists in your desk!
                "qty": 1,
                "rate": doc.monthly_amount
            }]
        })
        so.insert(ignore_permissions=True)
        so.submit()
        
        frappe.db.set_value("Utility Service Request", doc.name, "sales_order", so.name)
        frappe.msgprint(_("Sales Order {0} created for Utility Connection Charge.").format(so.name))
def validate_checklist_date(doc, method=None):
    """
    Hook triggered when a Maintenance Checklist is validated/saved.
    Enforces that inspection_date cannot be in the future if status is Completed.
    """
    if doc.status == "Completed" and doc.inspection_date:
        if frappe.utils.getdate(doc.inspection_date) > frappe.utils.getdate(frappe.utils.today()):
            frappe.throw(_("Inspection Date cannot be set in the future for a completed checklist."))        