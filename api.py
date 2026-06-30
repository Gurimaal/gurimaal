import frappe
from frappe.tests.utils import FrappeTestCase

class TestMaintenanceChecklist(FrappeTestCase):
    def test_checklist_validation_and_lifecycle(self):
        """
        Validates the Maintenance Checklist constraints:
        1. Clean insertion with standard parameters
        2. Blocked validation when trying to save a future-dated completed checklist
        """
        # 1. Test clean creation and saving
        checklist = frappe.get_doc({
            "doctype": "Maintenance Checklist",
            "unit": "Suite 502",
            "inspection_type": "Periodic",
            "inspection_date": frappe.utils.today(),
            "status": "Pending"
        })
        checklist.insert()
        self.assertEqual(checklist.status, "Pending")

        # 2. Update to Completed with an illegal future date
        checklist.status = "Completed"
        checklist.inspection_date = frappe.utils.add_days(frappe.utils.today(), 5)
        
        # Verify that saving throws a validation error
        self.assertRaises(frappe.ValidationError, checklist.save)