# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

# import frappe
from frappe.tests import IntegrationTestCase


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]



class IntegrationTestUtilityproperty(IntegrationTestCase):
	"""
	Integration tests for Utilityproperty.
	Use this class for testing interactions between multiple components.
	"""

	def test_create_utility_property_records_for_each_type(self):
        utility_types = [
            "Electricity",
            "Water",
            "Gas",
            "Internet",
        ]

        for utility_type in utility_types:
            doc = frappe.get_doc({
                "doctype": "Utility property",
                "property_name": f"Test {utility_type}",
                "property_type": utility_type,
                "status": "Active",
            }).insert()

            self.assertEqual(doc.property_type, utility_type)
            self.assertTrue(doc.name)

    def test_property_type_is_required(self):
        with self.assertRaises(frappe.MandatoryError):
            frappe.get_doc({
                "doctype": "Utility property",
                "property_name": "Test Property"
            }).insert()
