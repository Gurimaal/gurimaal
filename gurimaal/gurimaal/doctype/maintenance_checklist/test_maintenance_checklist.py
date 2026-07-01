import frappe
from frappe.tests import IntegrationTestCase

EXTRA_TEST_RECORD_DEPENDENCIES = []
IGNORE_TEST_RECORD_DEPENDENCIES = ["Payment Gateway", "Payment Gateway Account", "Payment Option"]


class TestMaintenanceChecklist(IntegrationTestCase):
    def test_checklist_validation_and_lifecycle(self):
        """
        Validates the Maintenance Checklist constraints:
        1. Clean insertion with standard parameters
        2. Blocked validation when trying to save a future-dated completed checklist
        """
        # Create dependencies for Unit link
        rep_name = frappe.db.exists("Real Estate Project", {"project_name": "Test Project"})
        if not rep_name:
            rep_name = frappe.get_doc({
                "doctype": "Real Estate Project",
                "project_name": "Test Project"
            }).insert().name

        bld_name = frappe.db.exists("Rental Building", {"building_name": "Building 1"})
        if not bld_name:
            bld_name = frappe.get_doc({
                "doctype": "Rental Building",
                "building_name": "Building 1",
                "project": rep_name
            }).insert().name

        floor_name = frappe.db.exists("Rental Floor", {"floor_name": "Floor 4"})
        if not floor_name:
            floor_name = frappe.get_doc({
                "doctype": "Rental Floor",
                "floor_name": "Floor 4",
                "floor_number": 4,
                "building": bld_name
            }).insert().name

        unit_name = frappe.db.exists("Rental Unit", {"unit_no": "Suite 502"})
        if not unit_name:
            unit_name = frappe.get_doc({
                "doctype": "Rental Unit",
                "unit_no": "Suite 502",
                "floor": floor_name
            }).insert().name

        # 1. Test clean creation and saving
        checklist = frappe.get_doc({
            "doctype": "Maintenance Checklist",
            "unit": unit_name,
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