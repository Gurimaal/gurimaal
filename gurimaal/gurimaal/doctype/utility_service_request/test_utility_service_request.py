# Copyright (c) 2026, Gurimaal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase

EXTRA_TEST_RECORD_DEPENDENCIES = []
IGNORE_TEST_RECORD_DEPENDENCIES = ["Payment Gateway", "Payment Gateway Account", "Payment Option"]


class IntegrationTestUtilityServiceRequest(IntegrationTestCase):
    """
    Integration tests for UtilityServiceRequest.
    Use this class for testing interactions between multiple components.
    """

    def test_sales_order_creation_on_approval(self):
        ensure_item("Utility Connection Charge")
        tenant = create_tenant_with_customer()
        unit = create_rental_unit()
        utility_property = create_utility_property()
        create_contract(tenant.name, unit.name)

        doc = frappe.get_doc({
            "doctype": "Utility Service Request",
            "tenant": tenant.name,
            "property": utility_property.name,
            "unit": unit.name,
            "service_type": "Electricity",
            "monthly_amount": 150.00,
            "status": "Draft"
        })
        doc.insert(ignore_permissions=True)

        doc.status = "Approved"
        doc.save(ignore_permissions=True)

        so_name = frappe.db.get_value("Utility Service Request", doc.name, "sales_order")
        self.assertTrue(so_name)

        so = frappe.get_doc("Sales Order", so_name)
        self.assertEqual(so.customer, tenant.customer)
        self.assertEqual(so.custom_service_request, doc.name)
        self.assertEqual(so.items[0].item_code, "Utility Connection Charge")
        self.assertEqual(so.items[0].rate, 150.00)


def create_tenant_with_customer():
    customer = frappe.get_doc(
        {
            "doctype": "Customer",
            "customer_name": f"Utility Test Customer {frappe.generate_hash(length=8)}",
            "customer_group": get_customer_group(),
            "territory": get_territory(),
        }
    ).insert(ignore_permissions=True)

    return frappe.get_doc(
        {
            "doctype": "Tenant",
            "tenant_name": f"Utility Test Tenant {frappe.generate_hash(length=8)}",
            "customer": customer.name,
        }
    ).insert(ignore_permissions=True)


def create_contract(tenant, unit):
    return frappe.get_doc(
        {
            "doctype": "Contracts",
            "tenant": tenant,
            "rental_unit": unit,
            "contract_start_date": "2026-07-01",
            "contract_end_date": "2027-06-30",
            "monthly_rent": 1000,
            "status": "Active",
        }
    ).insert(ignore_permissions=True)


def create_utility_property():
    return frappe.get_doc(
        {
            "doctype": "Utility property",
            "property_name": f"Utility Property {frappe.generate_hash(length=8)}",
            "property_type": "Electricity",
            "status": "Active",
        }
    ).insert(ignore_permissions=True)


def create_rental_unit():
    floor = create_rental_floor()
    return frappe.get_doc(
        {
            "doctype": "Rental Unit",
            "unit_no": frappe.generate_hash(length=8),
            "floor": floor.name,
            "status": "Vacant",
        }
    ).insert(ignore_permissions=True)


def create_rental_floor():
    building = create_rental_building()
    return frappe.get_doc(
        {
            "doctype": "Rental Floor",
            "building": building.name,
            "floor_name": frappe.generate_hash(length=8),
            "floor_number": 1,
        }
    ).insert(ignore_permissions=True)


def create_rental_building():
    project = create_real_estate_project()
    return frappe.get_doc(
        {
            "doctype": "Rental Building",
            "project": project.name,
            "building_name": frappe.generate_hash(length=8),
            "status": "Active",
        }
    ).insert(ignore_permissions=True)


def create_real_estate_project():
    return frappe.get_doc(
        {
            "doctype": "Real Estate Project",
            "project_name": frappe.generate_hash(length=8),
            "company": get_company(),
            "status": "Active",
        }
    ).insert(ignore_permissions=True)


def ensure_item(item_code):
    if frappe.db.exists("Item", item_code):
        return

    frappe.get_doc(
        {
            "doctype": "Item",
            "item_code": item_code,
            "item_name": item_code,
            "item_group": get_item_group(),
            "stock_uom": get_uom(),
            "is_stock_item": 0,
        }
    ).insert(ignore_permissions=True)


def get_company():
    return frappe.db.get_value("Company", {})


def get_customer_group():
    return frappe.db.get_value("Customer Group", {"is_group": 0}) or frappe.db.get_value("Customer Group", {})


def get_item_group():
    return frappe.db.get_value("Item Group", {"is_group": 0}) or frappe.db.get_value("Item Group", {})


def get_territory():
    return frappe.db.get_value("Territory", {"is_group": 0}) or frappe.db.get_value("Territory", {})


def get_uom():
    return frappe.db.get_value("UOM", "Nos") or frappe.db.get_value("UOM", {})
