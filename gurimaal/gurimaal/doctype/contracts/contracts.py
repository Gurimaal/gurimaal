# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import add_months, getdate


class Contracts(Document):
	def validate(self):
		self.validate_contract_dates()
		self.set_next_escalation_date()

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
