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
            "bg_color": "blue",
            "logo_url": "/assets/gurimaal/icons/gurimaal.svg",
            "app": "gurimaal",
            "standard": 1,
            "hidden": 0,
        },
        update_modified=False,
    )

    icons = {
        "Property": ("Gurimaal Property", "/assets/gurimaal/icons/property.svg"),
        "Tenancy": ("Gurimaal Tenancy", "/assets/gurimaal/icons/tenancy.svg"),
        "Utilities": ("Gurimaal Utilities", "/assets/gurimaal/icons/utilities.svg"),
        "Accounts": ("Gurimaal Accounting", "/assets/gurimaal/icons/accounting.svg"),
        "Maintenance": ("Gurimaal Maintenance", "/assets/gurimaal/icons/maintenance.svg"),
        "Settings": ("Gurimaal Settings", "/assets/gurimaal/icons/settings.svg"),
    }

    for old_name in (workspace for workspace, _logo in icons.values()):
        if frappe.db.exists("Desktop Icon", old_name):
            frappe.delete_doc("Desktop Icon", old_name, force=True)

    for idx, (desktop_icon, (_workspace, logo_url)) in enumerate(icons.items(), start=1):
        if frappe.db.exists("Desktop Icon", desktop_icon):
            frappe.db.set_value(
                "Desktop Icon",
                desktop_icon,
                {
                    "icon_type": "Link",
                    "link_type": "Workspace Sidebar",
                    "link_to": desktop_icon,
                    "parent_icon": "Gurimaal",
                    "idx": idx,
                    "logo_url": logo_url,
                    "app": "gurimaal",
                    "standard": 1,
                    "hidden": 0,
                },
                update_modified=False,
            )
