import frappe
from frappe.tests.utils import FrappeTestCase

class TestPaymentReconciliation(FrappeTestCase):
    def test_full_billing_and_reconciliation_lifecycle(self):
        """
        Validates full workflow:
        1. Tenant linked to Customer
        2. Sales Invoice raised against Tenant/Customer
        3. Payment Entry applied and outstanding drops to 0
        """
        # Create a mock customer for ERPNext ledger rules
        customer = frappe.get_doc({
            "doctype": "Customer",
            "customer_name": "Lifecycle Tenant Customer",
            "customer_group": "All Customer Groups",
            "territory": "All Territories"
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
            "company": frappe.get_all("Company")[0].name, # Dynamic safe company pull
            "items": [{
                "item_code": "Rent Item", # Ensure this item code exists in test database
                "qty": 1,
                "rate": 1200.00,
                "income_account": frappe.db.get_value("Company", {"name": frappe.get_all("Company")[0].name}, "default_income_account")
            }]
        })
        si.insert(ignore_permissions=True)
        si.submit()

        # Verify outstanding amount is currently full invoice rate
        self.assertEqual(frappe.db.get_value("Sales Invoice", si.name, "outstanding_amount"), 1200.00)

        # Step 3: Initialize Payment Entry using our validation hook
        pe = frappe.get_doc({
            "doctype": "Payment Entry",
            "payment_type": "Receive",
            "posting_date": frappe.utils.today(),
            "company": si.company,
            "tenant_reference": tenant.name, # Custom link field
            "paid_amount": 1200.00,
            "received_amount": 1200.00,
            "references": [{
                "reference_doctype": "Sales Invoice",
                "reference_name": si.name,
                "allocated_amount": 1200.00
            }]
        })
        
        # This executes our api.py 'before_save' validation to force customer parameters
        pe.insert(ignore_permissions=True)
        pe.submit()

        # Assertions: Confirm Party Type was updated and Outstanding Balance dropped cleanly to 0
        self.assertEqual(pe.party_type, "Customer")
        self.assertEqual(pe.party, customer.name)
        self.assertEqual(frappe.db.get_value("Sales Invoice", si.name, "outstanding_amount"), 0)