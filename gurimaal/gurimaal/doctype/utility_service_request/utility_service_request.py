import frappe
from frappe.tests.utils import FrappeTestCase

class TestUtilityServiceRequest(FrappeTestCase):
    def test_sales_order_creation_on_approval(self):
        # 1. Create a dummy Utility Service Request
        doc = frappe.get_doc({
            "doctype": "Utility Service Request",
            "customer": "Test Customer",  # Ensure this customer exists or change to a valid test customer
            "monthly_amount": 150.00,
            "status": "Draft"
        })
        doc.insert()

        # 2. Change status to Approved to trigger our backend hook
        doc.status = "Approved"
        doc.save()

        # 3. Verify that a Sales Order was created automatically with correct links & amounts
        so_name = frappe.db.get_value("Utility Service Request", doc.name, "sales_order")
        self.assertTrue(so_name)

        so = frappe.get_doc("Sales Order", so_name)
        self.assertEqual(so.billing_type, "Utility")
        self.assertEqual(so.items[0].rate, 150.00)