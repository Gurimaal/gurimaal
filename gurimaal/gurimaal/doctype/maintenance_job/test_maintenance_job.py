import frappe
from frappe.tests import IntegrationTestCase

EXTRA_TEST_RECORD_DEPENDENCIES = []
IGNORE_TEST_RECORD_DEPENDENCIES = ["Payment Gateway", "Payment Gateway Account", "Payment Option"]


class TestMaintenanceJob(IntegrationTestCase):
    def test_job_completion_syncs_parent_request(self):
        """
        Validates the integration workflow:
        1. Create parent Maintenance Request
        2. Assign a Maintenance Job to a Vendor
        3. Complete the Job and verify parent request transitions to 'Resolved'
        """
        # Create dependencies for Unit and Customer links
        if not frappe.db.exists("Customer", "Test Tenant"):
            frappe.get_doc({
                "doctype": "Customer",
                "customer_name": "Test Tenant",
                "customer_group": "Commercial",
                "territory": "Rest Of The World"
            }).insert()

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

        unit_name = frappe.db.exists("Rental Unit", {"unit_no": "Suite 404"})
        if not unit_name:
            unit_name = frappe.get_doc({
                "doctype": "Rental Unit",
                "unit_no": "Suite 404",
                "floor": floor_name
            }).insert().name

        # 1. Setup a baseline custom Vendor
        vendor = frappe.get_doc({
            "doctype": "Vendor",
            "vendor_name": "Fast Fix Plumbing",
            "trade": "Plumbing"
        }).insert(ignore_if_duplicate=True)

        # 2. Setup a parent Maintenance Request
        request = frappe.get_doc({
            "doctype": "Maintenance Request",
            "unit": unit_name,
            "customer": "Test Tenant",
            "description": "Leaky pipe under restroom sink.",
            "status": "Open"
        }).insert()

        # 3. Spawn a Maintenance Job linked to the request and vendor
        job = frappe.get_doc({
            "doctype": "Maintenance Job",
            "request": request.name,
            "vendor": vendor.name,
            "estimated_cost": 150.00,
            "status": "Scheduled"
        }).insert()

        # 4. Simulate the worker completing the job
        job.status = "Completed"
        job.actual_cost = 145.00
        job.completion_date = frappe.utils.today()
        job.save()

        # 5. Assertions: Verify our hook updated the parent document's state automatically
        parent_status, resolved_date = frappe.db.get_value(
            "Maintenance Request", 
            request.name, 
            ["status", "resolved_date"]
        )
        
        self.assertEqual(parent_status, "Resolved")
        self.assertEqual(str(resolved_date), str(frappe.utils.today()))