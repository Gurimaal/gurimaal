# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class MaintenanceChecklist(Document):
	def validate(self):
		"""
		Controller class method executed automatically before the document is saved.
		Ensures data integrity constraints are met at the DocType class level.
		"""
		self.validate_inspection_date()

	def validate_inspection_date(self):
		"""
		Prevents saving a completed inspection with a future date.
		"""
		if self.status == "Completed" and self.inspection_date:
			if frappe.utils.getdate(self.inspection_date) > frappe.utils.getdate(frappe.utils.today()):
				frappe.throw(
					_("Inspection Date cannot be set in the future for a completed checklist.")
				)