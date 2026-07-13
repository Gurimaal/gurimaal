# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from gurimaal.utils.tenancy import ensure_customer_for_tenant


class Tenant(Document):
	def validate(self):
		self.sync_contact_from_user()

	def after_insert(self):
		ensure_customer_for_tenant(self)

	def on_update(self):
		self.sync_user_contact()

	def sync_contact_from_user(self):
		if not self.user:
			return

		user_email = frappe.db.get_value("User", self.user, "email")
		if user_email and not self.email:
			self.email = user_email

	def sync_user_contact(self):
		if not self.user:
			return

		updates = {}
		if self.mobile_no:
			updates["mobile_no"] = self.mobile_no

		if updates:
			frappe.db.set_value("User", self.user, updates, update_modified=False)
