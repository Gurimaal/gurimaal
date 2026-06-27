// Copyright (c) 2026, Gurimaal and contributors
// For license information, please see license.txt

frappe.ui.form.on("Contracts", {
	contract_start_date(frm) {
		set_next_escalation_date(frm);
	},

	escalation_interval(frm) {
		set_next_escalation_date(frm);
	},

	escalation_percentage(frm) {
		set_next_escalation_date(frm);
	},
});

function set_next_escalation_date(frm) {
	const interval_months = {
		Monthly: 1,
		Quarterly: 3,
		Yearly: 12,
	};

	const months = interval_months[frm.doc.escalation_interval];
	const percentage = flt(frm.doc.escalation_percentage);

	if (!frm.doc.contract_start_date || !months || percentage <= 0) {
		frm.set_value("next_escalation_date", null);
		return;
	}

	frm.set_value(
		"next_escalation_date",
		frappe.datetime.add_months(frm.doc.contract_start_date, months)
	);
}
