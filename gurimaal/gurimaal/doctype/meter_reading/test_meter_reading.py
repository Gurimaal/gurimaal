import frappe
from frappe.tests.utils import FrappeTestCase

class TestMeterReading(FrappeTestCase):
    def setUp(self):
        # Ensure a mock global Utility Billing Settings exists for defaults
        settings = frappe.get_doc("Utility Billing Settings")
        settings.income_account = "Sales - G"  # Replace with a valid test account if needed
        settings.cost_center = "Main - G"      # Replace with a valid test cost center if needed
        settings.save()

    def test_sales_invoice_creation_on_submit(self):
        # 1. Initialize a dummy Meter Reading document
        mr = frappe.get_doc({
            "doctype": "Meter Reading",
            "customer": "Test Customer",
            "consumption_amount": 250.00,
            "fixed_charge": 50.00,
            "utility_item": "Electricity",
            "docstatus": 0  # Draft mode
        })
        mr.insert()
        
        # 2. Submit the document to trigger our backend event handler
        mr.submit()

        # 3. Assert that a Sales Invoice backlink was established
        si_name = frappe.db.get_value("Meter Reading", mr.name, "sales_invoice")
        self.assertTrue(si_name)

        # 4. Pull the auto-generated invoice and verify item components
        si = frappe.get_doc("Sales Invoice", si_name)
        self.assertEqual(len(si.items), 2)
        
        # Check Consumption Item line details
        self.assertEqual(si.items[0].item_code, "Electricity")
        self.assertEqual(si.items[0].rate, 250.00)
        
        # Check Fixed Charge Item line details
        self.assertEqual(si.items[1].item_code, "Utility Fixed Charge")
        self.assertEqual(si.items[1].rate, 50.00)