import frappe


def execute():
    if not frappe.db.exists("Desktop Icon", "Gurimaal"):
        return

    frappe.db.set_value(
        "Desktop Icon",
        "Gurimaal",
        {
            "icon": "organization",
            "icon_type": "App",
            "link_type": "External",
            "link": "/app/gurimaal-property",
            "link_to": "",
            "parent_icon": "",
            "logo_url": "/assets/gurimaal/icons/gurimaal.svg",
            "app": "gurimaal",
            "standard": 1,
            "hidden": 0,
        },
        update_modified=False,
    )
