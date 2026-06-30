# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase


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