import frappe
from frappe.tests.utils import FrappeTestCase

class TestMaintenanceJob(FrappeTestCase):
    def test_job_completion_syncs_parent_request(self):
        """
        Validates the integration workflow:
        1. Create parent Maintenance Request
        2. Assign a Maintenance Job to a Vendor
        3. Complete the Job and verify parent request transitions to 'Resolved'
        """
        # 1. Setup a baseline custom Vendor
        vendor = frappe.get_doc({
            "doctype": "Vendor",
            "vendor_name": "Fast Fix Plumbing",
            "trade": "Plumbing"
        }).insert(ignore_if_duplicate=True)

        # 2. Setup a parent Maintenance Request
        request = frappe.get_doc({
            "doctype": "Maintenance Request",
            "unit": "Suite 404",
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
        job.actual_cost = 145.00,
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