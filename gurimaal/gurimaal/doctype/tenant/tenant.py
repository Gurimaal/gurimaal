# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

from frappe.model.document import Document

from gurimaal.utils.tenancy import ensure_customer_for_tenant


class Tenant(Document):
	def after_insert(self):
		ensure_customer_for_tenant(self)
