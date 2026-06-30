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
def validate_tenant_payment_party(doc, method=None):
    """
    Hook triggered before saving a Payment Entry.
    Ensures that if a Tenant is referenced, the Payment Entry party matches 
    the Customer linked to that Tenant.
    """
    if doc.get("tenant_reference"):
        # Fetch the customer directly from the custom Tenant document
        linked_customer = frappe.db.get_value("Tenant", doc.tenant_reference, "customer")
        
        if linked_customer:
            doc.party_type = "Customer"
            doc.party = linked_customer