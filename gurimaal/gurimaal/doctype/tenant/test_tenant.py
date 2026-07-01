import frappe
from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry
from frappe.tests import IntegrationTestCase

EXTRA_TEST_RECORD_DEPENDENCIES = []
IGNORE_TEST_RECORD_DEPENDENCIES = ["Payment Gateway", "Payment Gateway Account", "Payment Option"]


class TestPaymentReconciliation(IntegrationTestCase):
    def test_full_billing_and_reconciliation_lifecycle(self):
        """
        Validates full workflow:
        1. Tenant linked to Customer
        2. Sales Invoice raised against Tenant/Customer
        3. Payment Entry applied and outstanding drops to 0
        """
        company = frappe.get_all("Company")[0].name
        ensure_item("Rent Item")

        # Create a mock customer for ERPNext ledger rules
        customer = frappe.get_doc({
            "doctype": "Customer",
            "customer_name": "Lifecycle Tenant Customer",
            "customer_group": get_customer_group(),
            "territory": get_territory()
        }).insert(ignore_if_duplicate=True)

        # Create our Custom Tenant record linked to that customer
        tenant = frappe.get_doc({
            "doctype": "Tenant",
            "tenant_name": "Hodan Ibrahim",
            "customer": customer.name
        }).insert(ignore_if_duplicate=True)

        # Step 2: Create and submit a Sales Invoice
        si = frappe.get_doc({
            "doctype": "Sales Invoice",
            "customer": customer.name,
            "posting_date": frappe.utils.today(),
            "company": company,
            "items": [{
                "item_code": "Rent Item",
                "qty": 1,
                "rate": 1200.00,
                "income_account": get_income_account(company)
            }]
        })
        si.insert(ignore_permissions=True)
        si.submit()

        # Verify outstanding amount is currently full invoice rate
        self.assertEqual(frappe.db.get_value("Sales Invoice", si.name, "outstanding_amount"), 1200.00)

        # Step 3: Initialize Payment Entry using our validation hook
        pe = get_payment_entry("Sales Invoice", si.name)
        pe.tenant_reference = tenant.name
        pe.insert(ignore_permissions=True)
        pe.submit()

        # Assertions: Confirm Party Type was updated and Outstanding Balance dropped cleanly to 0
        self.assertEqual(pe.party_type, "Customer")
        self.assertEqual(pe.party, customer.name)
        self.assertEqual(frappe.db.get_value("Sales Invoice", si.name, "outstanding_amount"), 0)


def ensure_item(item_code):
    if frappe.db.exists("Item", item_code):
        return

    frappe.get_doc(
        {
            "doctype": "Item",
            "item_code": item_code,
            "item_name": item_code,
            "item_group": get_item_group(),
            "stock_uom": get_uom(),
            "is_stock_item": 0,
        }
    ).insert(ignore_permissions=True)


def get_customer_group():
    return frappe.db.get_value("Customer Group", {"is_group": 0}) or frappe.db.get_value("Customer Group", {})


def get_item_group():
    return frappe.db.get_value("Item Group", {"is_group": 0}) or frappe.db.get_value("Item Group", {})


def get_territory():
    return frappe.db.get_value("Territory", {"is_group": 0}) or frappe.db.get_value("Territory", {})


def get_uom():
    return frappe.db.get_value("UOM", "Nos") or frappe.db.get_value("UOM", {})


def get_income_account(company):
    return frappe.db.get_value("Company", company, "default_income_account") or frappe.db.get_value(
        "Account",
        {"company": company, "account_type": "Income Account", "is_group": 0},
    )
