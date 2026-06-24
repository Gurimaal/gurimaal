# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import getdate

from gurimaal.gurimaal.doctype.contracts.contracts import get_next_escalation_date


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]



class IntegrationTestContracts(IntegrationTestCase):
	"""
	Integration tests for Contracts.
	Use this class for testing interactions between multiple components.
	"""

	def test_next_escalation_date_is_calculated_from_interval(self):
		self.assertEqual(
			get_next_escalation_date("2026-01-15", "Monthly", 5),
			getdate("2026-02-15"),
		)
		self.assertEqual(
			get_next_escalation_date("2026-01-15", "Quarterly", 5),
			getdate("2026-04-15"),
		)
		self.assertEqual(
			get_next_escalation_date("2026-01-15", "Yearly", 5),
			getdate("2027-01-15"),
		)

	def test_next_escalation_date_is_blank_without_escalation(self):
		self.assertIsNone(get_next_escalation_date("2026-01-15", "Monthly", 0))
		self.assertIsNone(get_next_escalation_date("2026-01-15", None, 5))
		self.assertIsNone(get_next_escalation_date(None, "Monthly", 5))

	def test_contract_end_date_cannot_be_before_start_date(self):
		contract = frappe.new_doc("Contracts")
		contract.contract_start_date = "2026-02-01"
		contract.contract_end_date = "2026-01-31"

		with self.assertRaises(frappe.ValidationError):
			contract.validate_contract_dates()
