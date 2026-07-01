# Copyright (c) 2026, Gurimaal and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

from gurimaal.utils.tenancy import sync_customer_from_tenant

class UtilityServiceRequest(Document):
    def validate(self):
        sync_customer_from_tenant(self, required=not self.customer)
        self.set_active_contract()
        self.validate_contract_requirement()

    def on_update(self):
        self.create_sales_order_on_approval()

    def validate_contract_requirement(self):
        # Fetch setting value safely
        require_contract = frappe.db.get_single_value('Utility Billing Settings', 'require_contract')
        
        if require_contract:
            active_contract_exists = self.contract or self.get_active_contract()
            
            if not active_contract_exists:
                frappe.throw(
                    _("An active contract is required for Unit {0} before saving a Utility Service Request.")
                    .format(self.unit)
                )

    def set_active_contract(self):
        if not self.contract:
            self.contract = self.get_active_contract()

    def get_active_contract(self):
        if not self.unit:
            return None

        filters = {
            "rental_unit": self.unit,
            "status": "Active",
        }
        if self.tenant:
            filters["tenant"] = self.tenant

        return frappe.db.get_value("Contracts", filters, "name")

    def create_sales_order_on_approval(self):
        # Trigger on 'Active' or 'Approved' status if Sales Order isn't linked yet
        if self.status in ["Active", "Approved"] and not self.sales_order:
            
            # Create the Sales Order document structure
            sales_order = frappe.get_doc({
                "doctype": "Sales Order",
                "customer": sync_customer_from_tenant(self, required=True),
                "transaction_date": frappe.utils.today(),
                "delivery_date": frappe.utils.add_days(frappe.utils.today(), 3), # Closer window for setups
                "custom_service_request": self.name,
                "items": [
                    {
                        "item_code": "Utility Connection Charge",
                        "qty": 1,
                        "rate": self.monthly_amount if self.monthly_amount else frappe.db.get_value("Item Price", {"item_code": "Utility Connection Charge"}, "price_list_rate") or 0
                    }
                ]
            })
            
            # Save it to the database bypassing direct user restrictions
            sales_order.insert(ignore_permissions=True)
            
            # Set the generated order ID back onto our current document field cleanly
            self.db_set('sales_order', sales_order.name)
            
            # Display a confirmation toast to the user
            frappe.msgprint(_("Sales Order {0} generated successfully for connection charge.").format(sales_order.name))
