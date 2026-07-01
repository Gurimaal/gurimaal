# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

from frappe.model.document import Document

from gurimaal.utils.tenancy import sync_customer_from_tenant


class MaintenanceRequest(Document):
	def validate(self):
		sync_customer_from_tenant(self, required=not self.customer)
