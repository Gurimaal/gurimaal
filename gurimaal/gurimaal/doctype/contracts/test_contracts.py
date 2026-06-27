# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import getdate, today

from gurimaal.gurimaal.doctype.contracts.contracts import (
	get_auto_repeat_frequency,
	get_next_escalation_date,
)


# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = [
	"Auto Repeat",
	"Company",
	"Real Estate Project",
	"Rental Unit",
	"Tenant",
]



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

	def test_auto_repeat_is_created_when_contract_is_activated(self):
		contract = create_contract(status="Active", escalation_interval="Monthly")
		contract.reload()

		self.assertTrue(contract.auto_repeat)

		auto_repeat = frappe.get_doc("Auto Repeat", contract.auto_repeat)
		self.assertEqual(auto_repeat.reference_doctype, "Contracts")
		self.assertEqual(auto_repeat.reference_document, contract.name)
		self.assertEqual(auto_repeat.frequency, "Monthly")
		self.assertEqual(auto_repeat.start_date, getdate(contract.contract_start_date))
		self.assertEqual(auto_repeat.end_date, getdate(contract.contract_end_date))
		self.assertFalse(auto_repeat.disabled)

	def test_auto_repeat_is_disabled_when_contract_is_terminated(self):
		contract = create_contract(status="Active")
		contract.reload()
		auto_repeat_name = contract.auto_repeat

		contract.status = "Terminated"
		contract.save(ignore_permissions=True)

		auto_repeat = frappe.get_doc("Auto Repeat", auto_repeat_name)
		self.assertTrue(auto_repeat.disabled)
		self.assertEqual(auto_repeat.end_date, getdate(today()))

	def test_auto_repeat_frequency_defaults_to_monthly(self):
		self.assertEqual(get_auto_repeat_frequency(None), "Monthly")
		self.assertEqual(get_auto_repeat_frequency("Quarterly"), "Quarterly")


def create_contract(status="Draft", escalation_interval="Monthly"):
	unit = create_rental_unit()
	tenant = create_tenant()

	contract = frappe.get_doc(
		{
			"doctype": "Contracts",
			"rental_unit": unit.name,
			"tenant": tenant.name,
			"contract_start_date": "2026-07-01",
			"contract_end_date": "2027-06-30",
			"monthly_rent": 1000,
			"escalation_interval": escalation_interval,
			"status": status,
		}
	)
	contract.insert(ignore_permissions=True)

	return contract


def create_rental_unit():
	floor = create_rental_floor()
	unit = frappe.get_doc(
		{
			"doctype": "Rental Unit",
			"unit_no": frappe.generate_hash(length=8),
			"floor": floor.name,
			"status": "Vacant",
		}
	)
	unit.insert(ignore_permissions=True)

	return unit


def create_rental_floor():
	building = create_rental_building()
	floor = frappe.get_doc(
		{
			"doctype": "Rental Floor",
			"building": building.name,
			"floor_name": frappe.generate_hash(length=8),
			"floor_number": 1,
		}
	)
	floor.insert(ignore_permissions=True)

	return floor


def create_rental_building():
	project = create_real_estate_project()
	building = frappe.get_doc(
		{
			"doctype": "Rental Building",
			"project": project.name,
			"building_name": frappe.generate_hash(length=8),
			"status": "Active",
		}
	)
	building.insert(ignore_permissions=True)

	return building


def create_real_estate_project():
	project = frappe.get_doc(
		{
			"doctype": "Real Estate Project",
			"project_name": frappe.generate_hash(length=8),
			"company": get_test_company(),
			"status": "Active",
		}
	)
	project.insert(ignore_permissions=True)

	return project


def create_tenant():
	tenant = frappe.get_doc(
		{
			"doctype": "Tenant",
			"tenant_name": frappe.generate_hash(length=8),
			"status": "Active",
		}
	)
	tenant.insert(ignore_permissions=True)

	return tenant


def get_test_company():
	company = frappe.db.get_value("Company", {})
	if company:
		return company

	frappe.throw("A Company is required to create Real Estate Project test records.")
