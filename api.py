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
def notify_emergency_maintenance(doc, method=None):
    """
    Hook triggered after a Maintenance Request is inserted.
    Sends an immediate email notification if priority is set to 'Emergency'.
    """
    if doc.priority == "Emergency" and doc.assigned_to:
        subject = _("URGENT: Emergency Maintenance Request {0}").format(doc.name)
        message = f"""
        <h3>Emergency Maintenance Ticket Raised</h3>
        <p><strong>Unit:</strong> {doc.unit}</p>
        <p><strong>Customer:</strong> {doc.customer}</p>
        <p><strong>Description:</strong> {doc.description}</p>
        <p>Please tend to this ticket immediately.</p>
        """
        
        frappe.send_mail(
            recipients=[doc.assigned_to],
            subject=subject,
            message=message,
            now=True
        )        