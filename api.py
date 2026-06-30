import frappe
from frappe import _

# ==========================================
# TASK 15: SALES ORDER AUTOMATION
# ==========================================

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
                "item_code": "Security Deposit",
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
                "item_code": "Utility Connection Charge",
                "qty": 1,
                "rate": doc.monthly_amount
            }]
        })
        so.insert(ignore_permissions=True)
        so.submit()
        
        frappe.db.set_value("Utility Service Request", doc.name, "sales_order", so.name)
        frappe.msgprint(_("Sales Order {0} created for Utility Connection Charge.").format(so.name))
def create_invoice_from_meter_reading(doc, method=None):
    """
    Hook triggered when a Meter Reading is submitted.
    Creates a Sales Invoice using Utility Billing Settings defaults.
    """
    # 1. Fetch system configurations from Utility Billing Settings
    billing_settings = frappe.get_single("Utility Billing Settings")
    default_income_account = billing_settings.get("income_account")
    default_cost_center = billing_settings.get("cost_center")
    
    # 2. Prevent duplicate processing
    if frappe.db.exists("Sales Invoice", {"meter_reading": doc.name}):
        return

    # Calculate consumption charge items based on the document's recorded consumption
    consumption_amount = doc.get("consumption_amount", 0)
    fixed_charge = doc.get("fixed_charge", 0)
    
    invoice_items = []
    
    # Add consumption line item if active
    if consumption_amount > 0:
        invoice_items.append({
            "item_code": doc.get("utility_item") or "Utility Consumption",
            "qty": 1,
            "rate": consumption_amount,
            "income_account": default_income_account,
            "cost_center": default_cost_center
        })
        
    # Add fixed charge line item if active
    if fixed_charge > 0:
        invoice_items.append({
            "item_code": "Utility Fixed Charge",
            "qty": 1,
            "rate": fixed_charge,
            "income_account": default_income_account,
            "cost_center": default_cost_center
        })

    if not invoice_items:
        return

    # 3. Compile and build the Sales Invoice record
    si = frappe.get_doc({
        "doctype": "Sales Invoice",
        "customer": doc.customer,
        "posting_date": frappe.utils.today(),
        "due_date": frappe.utils.add_days(frappe.utils.today(), 14),
        "meter_reading": doc.name,
        "unit_ref": doc.get("unit_ref"),
        "items": invoice_items
    })
    
    si.insert(ignore_permissions=True)
    si.submit()
    
    # Update backlink to the newly completed invoice
    frappe.db.set_value("Meter Reading", doc.name, "sales_invoice", si.name)
    frappe.msgprint(_("Sales Invoice {0} automatically generated for utility metrics.").format(si.name))


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
