# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import add_months, getdate, today


class Contracts(Document):
	def validate(self):
		self.validate_contract_dates()
		self.set_next_escalation_date()

	def after_insert(self):
		self.sync_auto_repeat()

	def on_update(self):
		self.sync_auto_repeat()

	def validate_contract_dates(self):
		if (
			self.contract_start_date
			and self.contract_end_date
			and getdate(self.contract_end_date) < getdate(self.contract_start_date)
		):
			frappe.throw("Contract End Date cannot be before Contract Start Date.")

	def set_next_escalation_date(self):
		self.next_escalation_date = get_next_escalation_date(
			self.contract_start_date,
			self.escalation_interval,
			self.escalation_percentage,
		)

	def sync_auto_repeat(self):
		if self.status == "Active":
			self.create_or_update_auto_repeat()
		elif self.status == "Terminated":
			self.disable_auto_repeat()

	def create_or_update_auto_repeat(self):
		auto_repeat = self.get_or_create_auto_repeat()
		auto_repeat.update(
			{
				"reference_doctype": self.doctype,
				"reference_document": self.name,
				"frequency": get_auto_repeat_frequency(self.escalation_interval),
				"start_date": self.contract_start_date,
				"end_date": self.contract_end_date,
				"disabled": 0,
				"submit_on_creation": 0,
			}
		)

		if auto_repeat.is_new():
			auto_repeat.insert(ignore_permissions=True)
		else:
			auto_repeat.save(ignore_permissions=True)

		if self.auto_repeat != auto_repeat.name:
			self.db_set("auto_repeat", auto_repeat.name, update_modified=False)

	def get_or_create_auto_repeat(self):
		auto_repeat_name = self.get_linked_auto_repeat_name()
		if auto_repeat_name:
			return frappe.get_doc("Auto Repeat", auto_repeat_name)

		return frappe.new_doc("Auto Repeat")

	def get_linked_auto_repeat_name(self):
		if self.auto_repeat and frappe.db.exists("Auto Repeat", self.auto_repeat):
			return self.auto_repeat

		return frappe.db.get_value(
			"Auto Repeat",
			{
				"reference_doctype": self.doctype,
				"reference_document": self.name,
			},
		)

	def disable_auto_repeat(self):
		auto_repeat_name = self.get_linked_auto_repeat_name()
		if not auto_repeat_name:
			return

		frappe.db.set_value(
			"Auto Repeat",
			auto_repeat_name,
			{
				"disabled": 1,
				"end_date": today(),
				"status": "Disabled",
			},
		)


def get_next_escalation_date(contract_start_date, escalation_interval, escalation_percentage=None):
	if not contract_start_date or not escalation_interval:
		return None

	if escalation_percentage is not None and float(escalation_percentage or 0) <= 0:
		return None

	months = {
		"Monthly": 1,
		"Quarterly": 3,
		"Yearly": 12,
	}.get(escalation_interval)

	if not months:
		return None

	return add_months(getdate(contract_start_date), months)


def get_auto_repeat_frequency(escalation_interval):
	if escalation_interval in {"Monthly", "Quarterly", "Yearly"}:
		return escalation_interval

	return "Monthly"
