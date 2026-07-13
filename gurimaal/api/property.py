import frappe

from gurimaal.api.utils import (
	get_active_contract,
	get_contract_unit_names,
	get_list,
	parse_limit,
	require_tenant_unit,
	serialize_doc,
	success,
)


UNIT_FIELDS = [
	"name",
	"unit_no",
	"floor",
	"unit_type",
	"area_sqft",
	"bedrooms",
	"monthly_rent",
	"status",
]
FLOOR_FIELDS = ["name", "building", "floor_name", "floor_number"]
BUILDING_FIELDS = ["name", "project", "building_name", "total_floors", "status"]
PROJECT_FIELDS = ["name", "project_name", "company", "address", "city", "status", "description"]


def get_unit_hierarchy(unit_name):
	unit = frappe.get_doc("Rental Unit", unit_name)
	data = {"unit": serialize_doc(unit, UNIT_FIELDS)}

	if unit.floor:
		floor = frappe.get_doc("Rental Floor", unit.floor)
		data["floor"] = serialize_doc(floor, FLOOR_FIELDS)

		if floor.building:
			building = frappe.get_doc("Rental Building", floor.building)
			data["building"] = serialize_doc(building, BUILDING_FIELDS)

			if building.project:
				project = frappe.get_doc("Real Estate Project", building.project)
				data["project"] = serialize_doc(project, PROJECT_FIELDS)

	return data


@frappe.whitelist()
def get_my_property():
	return property_detail()


@frappe.whitelist()
def property_detail():
	contract = get_active_contract()
	if not contract or not contract.rental_unit:
		return success(None)

	return success(get_unit_hierarchy(contract.rental_unit))


@frappe.whitelist()
def list_my_units(limit=20):
	return my_unit(limit=limit)


@frappe.whitelist()
def my_unit(limit=20):
	units = get_contract_unit_names()
	if not units:
		return success([])

	return success(
		get_list(
			"Rental Unit",
			filters={"name": ["in", units]},
			fields=UNIT_FIELDS,
			order_by="modified desc",
			limit_page_length=parse_limit(limit),
		)
	)


@frappe.whitelist()
def unit_detail(unit):
	require_tenant_unit(unit)
	return success(get_unit_hierarchy(unit))
