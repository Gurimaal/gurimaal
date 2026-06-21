# AGENTS.md — Gurimaal

This file instructs **human developers and AI coding agents** (Codex, Claude Code, Copilot, etc.) on how to work in this repository. Read this before writing or modifying any code.

## 1. What this app is

Gurimaal is a **Frappe Framework** custom app for real estate and utility management: property hierarchy, tenant onboarding, lease contracts, utility metering & billing, and maintenance operations for rental properties.

Full architecture and ERD reference: see `docs/HAGE_RealEstate_Architecture_ERD_Workflow.pdf` (copy it into the repo if not already present). Agents should read that document before designing new DocTypes or relationships — it is the source of truth for domain structure, not assumptions from this file alone.

## 2. Tech stack & environment

- Framework: **Frappe** (bench-managed), Python 3.11+, MariaDB 10.6+, Node.js 18+
- App is developed inside a `bench` instance — never assume a standalone Python project. All commands run via `bench` from the bench root, not from inside the app folder.
- Multi-company isolation is handled the **Frappe-native way** via the `company` field already present on root DocTypes (`Real Estate Project`, `Utility Property`, `Utility Billing Settings`) — do not invent a custom tenant-isolation field unless explicitly asked. This is a different multi-tenancy model from the CodeIgniter HAGE CLOUD project; do not mix the two patterns.

Common commands:
```bash
bench start                              # dev server
bench --site <site> migrate              # apply DocType/schema changes
bench --site <site> console              # python shell with frappe context
bench new-doctype "Doctype Name" --module gurimaal
bench --site <site> run-tests --app gurimaal
bench build                              # rebuild JS/CSS assets
```

## 3. Domain model — DocType map

Five domains, top-down dependency order. Always build/modify in this order so foreign keys resolve cleanly.

1. **Property Structure**: Real Estate Project → Rental Building → Rental Floor → Rental Unit
2. **Tenancy & CRM**: User (Frappe core) → Tenant → Customer (auto-created) → Contract → Auto Repeat
3. **Utility Infrastructure**: Utility Property, Serial No (meter), Meter Reading, Utility Bill Structure, Bill Structure Item, Billing Adjustment Rule, Utility Billing Settings (single doctype)
4. **Service & Finance**: Utility Service Request, Sales Order, Sales Invoice, Payment Entry (ERPNext core doctypes — do not duplicate, extend via custom fields if needed)
5. **Maintenance**: Maintenance Request, Maintenance Job, Maintenance Checklist, Vendor

DocType names use Frappe's standard **Title Case with spaces** (e.g. `Rental Unit`, `Utility Service Request`) — never snake_case or SCREAMING_CASE for the actual DocType `name`/label. Field names are `snake_case` per Frappe convention.

## 4. Critical business rules agents must preserve

These are load-bearing and must not be silently changed or removed:

- **Tenant → Customer auto-creation** runs on `after_insert` of `Tenant`, gated by `Utility Billing Settings.auto_create_customer`. It must be **idempotent**: never create a second Customer for a Tenant that already has one linked, including on re-save, data import, or bulk migration.
- **Contract.tenant** links to `Tenant`, not directly to `Customer`. Do not reintroduce a direct Contract → Customer link; Customer is reached through Tenant.
- **`require_contract`** on Utility Billing Settings, when checked, must block Utility Service Request processing on units without an active Contract.
- **Escalation**: `Contract.escalation_percentage` applies to `monthly_rent` at each `escalation_interval`, advancing `next_escalation_date`. This must run as a scheduled job, never as a manual-only action.
- **Tariff billing**: Meter Reading consumption is priced through `Bill Structure Item` slabs (`from_units`/`to_units`, `rate_per_unit`, `fixed_charge`), then `Billing Adjustment Rule`s applied by `priority` before invoice generation.
- **Recurring rent** is driven by `Auto Repeat` on Contract, not by custom cron logic — use Frappe's built-in Auto Repeat doctype/scheduler.

If a task seems to require violating one of these rules, stop and flag it rather than working around it silently.

## 5. Coding conventions

- Python: follow PEP 8, use Frappe's `frappe.get_doc`, `frappe.db.get_value`, etc. — never raw SQL unless there's a clear performance reason, and prefer `frappe.qb` over string-concatenated SQL.
- Controller logic (validate, before_insert, after_insert, on_submit) goes in the DocType's `.py` file, not in client scripts, unless it is purely UI behavior.
- Client-side: use Frappe's form scripting API (`frappe.ui.form.on`), keep business logic out of JS where possible — JS should call server methods (`frappe.call`) rather than duplicate validation logic.
- Currency and date fields must use Frappe's native `Currency`/`Date`/`Datetime` field types, not plain strings.
- New child tables follow the `parent`/`parenttype`/`parentfield` convention automatically provided by Frappe — don't hand-roll parent-child relationships.
- Use Frappe naming series for primary keys where a human-readable sequential ID is useful (e.g. `TEN-.YYYY.-.#####` for Tenant), matching the pattern already used in the ERD.

## 6. Workflow for adding or changing a DocType

1. Check the ERD doc (Section 6 in the architecture PDF) to confirm where the new/changed entity sits and what it relates to.
2. Create/modify the DocType via the Frappe UI or `bench new-doctype`, then let Frappe generate the JSON — don't hand-write DocType JSON from scratch.
3. Add controller logic in the `.py` file; add any hooks to `hooks.py` only if the logic is cross-doctype (e.g. document_events).
4. Run `bench --site <site> migrate` to apply schema changes.
5. Write or update a test in `gurimaal/<module>/doctype/<doctype>/test_<doctype>.py`.
6. Update the architecture doc if the change affects the domain model (new entity, new relationship, changed cardinality).

## 7. Testing

- Every new controller method with business logic (especially anything touching the rules in Section 4) needs a unit test using `FrappeTestCase`.
- Run the full suite before opening a PR: `bench --site <site> run-tests --app gurimaal`.
- Idempotency rules (e.g. Tenant → Customer creation) must have a test that explicitly re-saves/re-imports and asserts no duplicate is created.

## 8. Guardrails for AI agents specifically

- Do not invent new DocTypes outside the five domains in Section 3 without flagging it — propose the addition and where it fits before generating code.
- Do not modify `Utility Billing Settings` defaults, account/cost-center fields, or financial calculation logic (tariff slabs, escalation math) without explicit instruction — these affect real billing output.
- Prefer extending ERPNext core doctypes (Sales Order, Sales Invoice, Payment Entry, Customer) via custom fields/hooks rather than forking or duplicating them.
- When unsure whether a change is additive or breaking, generate the change as a proposal/diff first rather than applying it directly, and call out anything that touches Section 4 rules.
- Keep commit messages and PR descriptions in English; in-app user-facing labels may need both English and Somali depending on the target module (check existing labels for the pattern before adding new ones).

## 9. Where to look first

- Architecture & ERD: `docs/Gurimaal_Architecture_ERD_Workflow.pdf`
- DocType source: `gurimaal/<module>/doctype/<doctype_name>/`
- Scheduled jobs (escalation, recurring billing): `hooks.py` → `scheduler_events`
- Module structure: `gurimaal/modules.txt`