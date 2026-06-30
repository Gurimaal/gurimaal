# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]



class IntegrationTestUtilityBillingSettings(IntegrationTestCase):
	"""
	Integration tests for UtilityBillingSettings.
	Use this class for testing interactions between multiple components.
	"""

	def test_defaults(self):
		settings = frappe.get_single("Utility Billing Settings")
		self.assertEqual(settings.auto_create_customer, 1)

