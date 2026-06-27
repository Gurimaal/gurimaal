# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class MeterReading(Document):

    def validate(self):
        # 1. Calculate consumption
        self.consumption = (self.current_reading or 0) - (self.previous_reading or 0)

        # 2. Calculate bill
        if self.bill_structure and self.consumption > 0:
            structure = frappe.get_doc(
                "Utility Bill Structure",
                self.bill_structure
            )

            self.total_amount = calculate_bill(structure, self.consumption)

    def on_submit(self):

        # 3. Create Sales Invoice
        invoice = frappe.new_doc("Sales Invoice")

        invoice.customer = self.customer
        invoice.posting_date = self.reading_date

        invoice.append("items", {
            "item_name": "Utility Consumption",
            "qty": self.consumption,
            "rate": self.total_amount / (self.consumption or 1),
            "amount": self.total_amount
        })

        invoice.insert()
        invoice.submit()

        self.status = "Invoiced"