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
        serial = frappe.get_doc({
            "doctype": "Serial No",
            "serial_no": "MTR-0001",
            "item_code": "Utility Meter",
            "company": "Gurimal"
        }).insert()

        meter = frappe.get_doc({
            "doctype": "Meter Reading",
            "customer": "_Test Customer",
            "meter_serial_no": serial.name,
            "reading_date": "2026-06-27",
            "previous_reading": 100,
            "current_reading": 150,
            "bill_structure": "_Test Bill Structure"
        }).insert()

        self.assertEqual(meter.meter_serial_no, serial.name)