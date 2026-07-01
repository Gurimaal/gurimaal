import frappe
from frappe.tests import IntegrationTestCase

EXTRA_TEST_RECORD_DEPENDENCIES = []
IGNORE_TEST_RECORD_DEPENDENCIES = ["Payment Gateway", "Payment Gateway Account", "Payment Option"]


class IntegrationTestMeterReading(IntegrationTestCase):
    """
    Integration tests for Meter Reading.
    Use this class for testing interactions between multiple components.
    """

    def test_meter_serial_link(self):
        ensure_item("Utility Meter", is_stock_item=1)
        tenant = create_tenant_with_customer()

        bill_struct = frappe.get_doc({
            "doctype": "Utility Bill Structure",
            "structure_name": f"_Test Bill Structure {frappe.generate_hash(length=8)}",
            "utility_type": "Electricity",
            "items": [
                {
                    "from_units": 0.0,
                    "to_units": 1000.0,
                    "rate_per_unit": 0.15,
                    "fixed_charge": 5.0
                }
            ]
        }).insert(ignore_permissions=True)

        serial = frappe.get_doc({
            "doctype": "Serial No",
            "serial_no": f"MTR-{frappe.generate_hash(length=8)}",
            "item_code": "Utility Meter",
            "company": get_company(),
        }).insert(ignore_permissions=True)

        meter = frappe.get_doc({
            "doctype": "Meter Reading",
            "tenant": tenant.name,
            "meter_serial_no": serial.name,
            "reading_date": "2026-06-27",
            "previous_reading": 100,
            "current_reading": 150,
            "bill_structure": bill_struct.name
        }).insert(ignore_permissions=True)

        self.assertEqual(meter.meter_serial_no, serial.name)
        self.assertEqual(meter.customer, tenant.customer)


class TestMeterReading(IntegrationTestCase):
    def setUp(self):
        super().setUp()
        ensure_item("Utility Meter", is_stock_item=1)
        ensure_item("Utility Consumption")

    def test_sales_invoice_creation_on_submit(self):
        tenant = create_tenant_with_customer()
        bill_struct = create_bill_structure()
        serial = create_meter_serial()

        mr = frappe.get_doc({
            "doctype": "Meter Reading",
            "tenant": tenant.name,
            "meter_serial_no": serial.name,
            "reading_date": frappe.utils.today(),
            "previous_reading": 100,
            "current_reading": 150,
            "bill_structure": bill_struct.name,
        })
        mr.insert(ignore_permissions=True)
        
        mr.submit()

        si_name = frappe.db.get_value("Meter Reading", mr.name, "sales_invoice")
        self.assertTrue(si_name)

        si = frappe.get_doc("Sales Invoice", si_name)
        self.assertEqual(si.customer, tenant.customer)
        self.assertEqual(len(si.items), 1)
        self.assertEqual(si.items[0].item_code, "Utility Consumption")
        self.assertEqual(si.items[0].qty, 50)
        self.assertEqual(si.items[0].amount, 12.5)


def create_tenant_with_customer():
    customer = frappe.get_doc(
        {
            "doctype": "Customer",
            "customer_name": f"Meter Test Customer {frappe.generate_hash(length=8)}",
            "customer_group": get_customer_group(),
            "territory": get_territory(),
        }
    ).insert(ignore_permissions=True)

    return frappe.get_doc(
        {
            "doctype": "Tenant",
            "tenant_name": f"Meter Test Tenant {frappe.generate_hash(length=8)}",
            "customer": customer.name,
        }
    ).insert(ignore_permissions=True)


def create_bill_structure():
    return frappe.get_doc(
        {
            "doctype": "Utility Bill Structure",
            "structure_name": f"_Test Bill Structure {frappe.generate_hash(length=8)}",
            "utility_type": "Electricity",
            "items": [
                {
                    "from_units": 0,
                    "to_units": 1000,
                    "rate_per_unit": 0.15,
                    "fixed_charge": 5,
                }
            ],
        }
    ).insert(ignore_permissions=True)


def create_meter_serial():
    return frappe.get_doc(
        {
            "doctype": "Serial No",
            "serial_no": f"MTR-{frappe.generate_hash(length=8)}",
            "item_code": "Utility Meter",
            "company": get_company(),
        }
    ).insert(ignore_permissions=True)


def ensure_item(item_code, is_stock_item=0):
    if frappe.db.exists("Item", item_code):
        return

    item = frappe.get_doc(
        {
            "doctype": "Item",
            "item_code": item_code,
            "item_name": item_code,
            "item_group": get_item_group(),
            "stock_uom": get_uom(),
            "is_stock_item": is_stock_item,
        }
    )
    if is_stock_item:
        item.has_serial_no = 1
    item.insert(ignore_permissions=True)


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
