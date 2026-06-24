# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class UtilityBillStructure(Document):

    def validate(self):
        self.validate_slabs()

    def validate_slabs(self):
        if not self.items:
            frappe.throw("At least one slab is required.")

        # Sort slabs by from_units
        self.items.sort(key=lambda x: x.from_units)

        for i, row in enumerate(self.items):

            # 1. Basic rule
            if row.from_units >= row.to_units:
                frappe.throw(
                    f"Row {i+1}: 'from_units' must be less than 'to_units'"
                )

            # 2. Continuity rule (NO gaps, NO overlaps)
            if i > 0:
                prev = self.items[i - 1]

                if row.from_units != prev.to_units:
                    frappe.throw(
                        f"Slab gap/overlap between rows {i} and {i+1}: "
                        f"{prev.to_units} != {row.from_units}"
                    )

        # 3. Optional: ensure first slab starts at 0
        if self.items[0].from_units != 0:
            frappe.throw("First slab must start at 0 units")