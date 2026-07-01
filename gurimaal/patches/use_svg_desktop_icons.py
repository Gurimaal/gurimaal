import frappe


def execute():
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

    icons = {
        "Property": "/assets/gurimaal/icons/property.svg",
        "Tenancy": "/assets/gurimaal/icons/tenancy.svg",
        "Utilities": "/assets/gurimaal/icons/utilities.svg",
        "Accounts": "/assets/gurimaal/icons/accounting.svg",
        "Maintenance": "/assets/gurimaal/icons/maintenance.svg",
        "Settings": "/assets/gurimaal/icons/settings.svg",
    }

    for old_name in (
        "Gurimaal Property",
        "Gurimaal Tenancy",
        "Gurimaal Utilities",
        "Gurimaal Accounting",
        "Gurimaal Maintenance",
        "Gurimaal Settings",
    ):
        if frappe.db.exists("Desktop Icon", old_name):
            frappe.delete_doc("Desktop Icon", old_name, force=True)

    for idx, (label, logo_url) in enumerate(icons.items(), start=1):
        if not frappe.db.exists("Desktop Icon", label):
            doc = frappe.new_doc("Desktop Icon")
            doc.label = label
            doc.name = label
            doc.icon_type = "Link"
            doc.link_type = "Workspace Sidebar"
            doc.link_to = label
            doc.parent_icon = "Gurimaal"
            doc.idx = idx
            doc.logo_url = logo_url
            doc.app = "gurimaal"
            doc.standard = 1
            doc.hidden = 0
            doc.insert(ignore_permissions=True)

        frappe.db.set_value(
            "Desktop Icon",
            label,
            {
                "icon_type": "Link",
                "link_type": "Workspace Sidebar",
                "link_to": label,
                "parent_icon": "Gurimaal",
                "idx": idx,
                "logo_url": logo_url,
                "app": "gurimaal",
                "standard": 1,
                "hidden": 0,
            },
            update_modified=False,
        )
