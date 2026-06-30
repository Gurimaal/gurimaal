import frappe
from frappe.tests import IntegrationTestCase
from frappe.tests.utils import FrappeTestCase


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]


class IntegrationTestMeterReading(IntegrationTestCase):
    """
    Integration tests for Meter Reading.
    Use this class for testing interactions between multiple components.
    """

    def test_meter_serial_link(self):
        from unittest.mock import patch
        with patch("frappe.model.document.update_global_search") as mock_doc_update, \
             patch("frappe.utils.global_search.update_global_search") as mock_search_update:
            if not frappe.db.exists("Item Group", "All Item Groups"):
                frappe.get_doc({
                    "doctype": "Item Group",
                    "item_group_name": "All Item Groups",
                    "is_group": 1
                }).insert()

            if not frappe.db.exists("Item", "Utility Meter"):
                frappe.get_doc({
                    "doctype": "Item",
                    "item_code": "Utility Meter",
                    "item_name": "Utility Meter",
                    "item_group": "All Item Groups",
                    "is_stock_item": 0
                }).insert()

            bill_struct = frappe.get_doc({
                "doctype": "Utility Bill Structure",
                "structure_name": "_Test Bill Structure",
                "utility_type": "Electricity",
                "items": [
                    {
                        "from_units": 0.0,
                        "to_units": 1000.0,
                        "rate_per_unit": 0.15,
                        "fixed_charge": 5.0
                    }
                ]
            }).insert()

            serial = frappe.get_doc({
                "doctype": "Serial No",
                "serial_no": "MTR-0001",
                "item_code": "Utility Meter",
                "company": "Gurimaal Property Management"
            }).insert()

            meter = frappe.get_doc({
                "doctype": "Meter Reading",
                "customer": "_Test Customer",
                "meter_serial_no": serial.name,
                "reading_date": "2026-06-27",
                "previous_reading": 100,
                "current_reading": 150,
                "bill_structure": bill_struct.name
            }).insert()

            self.assertEqual(meter.meter_serial_no, serial.name)


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
