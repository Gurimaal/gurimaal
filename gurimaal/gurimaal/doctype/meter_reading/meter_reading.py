# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from gurimaal.utils.billing import calculate_bill
from gurimaal.utils.adjustments import apply_adjustments
from gurimaal.utils.tenancy import sync_customer_from_tenant


class MeterReading(Document):

    def validate(self):
        sync_customer_from_tenant(self, required=not self.customer)

        # 1. Calculate consumption
        self.consumption = (self.current_reading or 0) - (self.previous_reading or 0)

        if self.consumption < 0:
            frappe.throw("Current reading cannot be less than previous reading.")

        # 2. Calculate bill if structure exists
        if self.bill_structure and self.consumption > 0:

            structure = frappe.get_doc(
                "Utility Bill Structure",
                self.bill_structure
            )

            # STEP 1: Slab pricing
            base_amount = calculate_bill(structure, self.consumption)

            # STEP 2: Load active adjustment rules (with priority)
            rules = frappe.get_all(
                "Billing Adjustment Rule",
                fields=["rule_type", "amount_or_percent", "priority"],
                order_by="priority asc"
            )

            # STEP 3: Apply adjustments
            self.total_amount = apply_adjustments(base_amount, rules)

        else:
            self.total_amount = 0

    def on_submit(self):

        # Prevent submission without billing
        if not self.total_amount:
            frappe.throw("Cannot submit without calculated bill.")

        # Create Sales Invoice
        invoice = frappe.new_doc("Sales Invoice")

        invoice.customer = self.customer
        invoice.posting_date = self.reading_date

        invoice.append("items", {
            "item_code": "Utility Consumption",
            "item_name": "Utility Consumption",
            "qty": self.consumption,
            "rate": self.total_amount / (self.consumption or 1),
            "amount": self.total_amount
        })

        invoice.insert(ignore_permissions=True)
        invoice.submit()

        frappe.db.set_value(
            "Meter Reading",
            self.name,
            {
                "status": "Invoiced",
                "sales_invoice": invoice.name,
            },
            update_modified=False,
        )
