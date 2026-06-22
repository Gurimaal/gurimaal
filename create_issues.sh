#!/usr/bin/env bash
# Gurimaal — Create all DocType Issues and assign to developers
#
# Requirements:
#   gh CLI installed and authenticated (gh auth login)
#
# Usage:
#   chmod +x create_issues.sh
#   ./create_issues.sh
#
# Run from inside: ~/bench-v16/apps/gurimaal

set -e

REPO="Gurimaal/gurimaal"

RUWEYDA="Hodan-dev"
MANDEQ="MandeqAli"
HODAN="RuweydaAbdulKhadirAdam"

echo ""
echo "=========================================="
echo "  Gurimaal — Creating GitHub Issues"
echo "=========================================="
echo ""

# -------------------------------------------------------------------
# Helper
# -------------------------------------------------------------------
create_issue() {
  local title="$1"
  local assignee="$2"
  local label="$3"
  local body="$4"

  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --assignee "$assignee" \
    --label "$label" \
    --body "$body"
  echo "  ✓ Created: $title → @$assignee"
}

# ===================================================================
# HODAN — Property Structure + Tenancy & CRM
# ===================================================================
echo "── RUWEYDA (Property Structure + Tenancy) ──"

create_issue \
  "feat(property): create Real Estate Project DocType" \
  "$HODAN" \
  "property-structure,type: feature,priority: high" \
'## Description
Create the `Real Estate Project` DocType — the top-level entity in the property hierarchy.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `PROJ-.YYYY.-.#####` |
| project_name | Data | Required |
| company | Link → Company | Required |
| address | Data | |
| city | Data | |
| status | Select | Active / Inactive |

## Acceptance criteria
- [ ] DocType created with all fields above
- [ ] `status` defaults to Active
- [ ] List view shows: project_name, company, city, status
- [ ] `bench migrate` runs without errors
- [ ] Unit test: create and save a Project record

## Notes
See AGENTS.md Section 3 — Property Structure domain. This is the root entity; all other property DocTypes depend on it.'

create_issue \
  "feat(property): create Rental Building DocType" \
  "$HODAN" \
  "property-structure,type: feature,priority: high" \
'## Description
Create the `Rental Building` DocType linked to Real Estate Project.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `BLD-.YYYY.-.#####` |
| building_name | Data | Required |
| project | Link → Real Estate Project | Required |
| total_floors | Int | |
| status | Select | Active / Inactive |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] `project` field is required and validated
- [ ] List view filtered by project
- [ ] Unit test: create Building linked to Project

## Notes
Depends on: Real Estate Project (Issue #1)'

create_issue \
  "feat(property): create Rental Floor DocType" \
  "$HODAN" \
  "property-structure,type: feature,priority: high" \
'## Description
Create the `Rental Floor` DocType linked to Rental Building.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| floor_name | Data | Required |
| building | Link → Rental Building | Required |
| floor_number | Int | Required |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] floor_number must be unique per building (validate in controller)
- [ ] Unit test: create Floor linked to Building

## Notes
Depends on: Rental Building (Issue #2)'

create_issue \
  "feat(property): create Rental Unit DocType" \
  "$HODAN" \
  "property-structure,type: feature,priority: high" \
'## Description
Create the `Rental Unit` DocType — the leaf node referenced by Contract, Meter Reading, Service Request, and Maintenance.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `UNIT-.YYYY.-.#####` |
| unit_no | Data | Required |
| floor | Link → Rental Floor | Required |
| unit_type | Select | Studio / 1BR / 2BR / 3BR / Commercial |
| area_sqft | Float | |
| bedrooms | Int | |
| monthly_rent | Currency | |
| status | Select | Vacant / Occupied / Under Maintenance |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] status defaults to Vacant
- [ ] status changes to Occupied when Contract is activated (hook added in Contract controller later)
- [ ] Unit test: create Unit linked to Floor

## Notes
Depends on: Rental Floor (Issue #3). This is the most-referenced DocType in the system.'

create_issue \
  "feat(tenancy): create Tenant DocType with User link and auto-create Customer hook" \
  "$HODAN" \
  "tenancy-crm,type: feature,priority: high" \
'## Description
Create the `Tenant` DocType. This is the identity record every lease is signed against.
On insert, automatically create a linked ERPNext Customer (gated by Utility Billing Settings).

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `TEN-.YYYY.-.#####` |
| tenant_name | Data | Required |
| user | Link → User | Unique — portal login account |
| customer | Link → Customer | Read-only, auto-populated |
| mobile_no | Data | |
| email | Data | fetch_from: user.email |
| national_id | Data | KYC |
| customer_group | Link → Customer Group | |
| status | Select | Active / Inactive / Blacklisted |

## Auto-create Customer logic (after_insert)
1. Check if `customer` is already set — if yes, skip (idempotent)
2. Read `Utility Billing Settings.auto_create_customer` — if unchecked, skip
3. Create Customer: customer_name = tenant_name, customer_type = Individual
4. Add User to Customer portal_users child table
5. Set tenant.customer = new customer name, db_set (no re-trigger)

## Acceptance criteria
- [ ] All fields created
- [ ] after_insert hook creates Customer when setting is enabled
- [ ] Re-saving Tenant does NOT create a duplicate Customer
- [ ] User is added to Customer portal_users
- [ ] Unit test covers both the happy path and the idempotency case
- [ ] Unit test covers auto_create_customer = disabled case

## Notes
See AGENTS.md Section 4 — Critical business rules. This hook must be idempotent.'

create_issue \
  "feat(tenancy): create Contract DocType with escalation scheduler" \
  "$HODAN" \
  "tenancy-crm,type: feature,priority: high" \
'## Description
Create the `Contract` DocType linking Tenant to a Rental Unit with rent terms and escalation.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `CONT-.YYYY.-.#####` |
| rental_property | Link → Real Estate Project | |
| rental_unit | Link → Rental Unit | Required |
| tenant | Link → Tenant | Required (NOT Customer directly) |
| contract_start_date | Date | Required |
| contract_end_date | Date | |
| monthly_rent | Currency | Required |
| security_deposit_amount | Currency | |
| escalation_percentage | Float | |
| escalation_interval | Select | Monthly / Quarterly / Yearly |
| next_escalation_date | Date | Auto-calculated |
| auto_repeat | Link → Auto Repeat | |
| notice_period_days | Int | |
| status | Select | Draft / Active / Expired / Terminated |

## Acceptance criteria
- [ ] Contract.tenant links to Tenant (not Customer)
- [ ] On activation: set Rental Unit.status = Occupied
- [ ] On termination/expiry: set Rental Unit.status = Vacant
- [ ] Escalation scheduler: scheduled job updates monthly_rent by escalation_percentage, advances next_escalation_date
- [ ] Security deposit generates a Sales Order on activation
- [ ] Unit test: activation sets unit status; escalation math is correct

## Notes
Depends on: Tenant (Issue #5), Rental Unit (Issue #4). See AGENTS.md Section 4 for escalation rules.'

create_issue \
  "feat(tenancy): configure Auto Repeat integration for recurring rent invoices" \
  "$HODAN" \
  "tenancy-crm,type: feature,priority: medium" \
'## Description
Wire up Frappe'\''s built-in Auto Repeat DocType to Contract so that monthly rent Sales Invoices are generated automatically.

## Tasks
- When a Contract is activated, create (or link) an Auto Repeat record:
  - reference_doctype = Contract
  - reference_document = contract.name
  - frequency = Monthly (or per escalation_interval)
  - start_date = contract_start_date
  - end_date = contract_end_date
- Auto Repeat spawns Sales Invoice on each cycle (handled by Frappe core)
- Contract.auto_repeat field stores the link

## Acceptance criteria
- [ ] Auto Repeat record created on Contract activation
- [ ] Auto Repeat end_date matches contract_end_date
- [ ] Terminating a Contract disables the Auto Repeat (end_date = today)
- [ ] Unit test: verify Auto Repeat is created and disabled correctly

## Notes
Use Frappe'\''s native Auto Repeat scheduler — do not write custom cron logic.'

echo ""

# ===================================================================
# MANDEQ — Utility Infrastructure + Billing
# ===================================================================
echo "── MANDEQ (Utility Infrastructure + Billing) ──"

create_issue \
  "feat(utility): create Utility Property DocType" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: high" \
'## Description
Create the `Utility Property` DocType representing the utility connection point for a unit.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| property_name | Data | Required |
| property_type | Select | Electricity / Water / Gas / Internet |
| company | Link → Company | |
| cost_center | Link → Cost Center | |
| cost_customer | Link → Customer | |
| status | Select | Active / Inactive |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] property_type is required
- [ ] Unit test: create Utility Property records for each type

## Notes
Depends on: Rental Unit (Dev 1 Issue #4). Links to unit via Utility Service Request.'

create_issue \
  "feat(utility): create Utility Bill Structure and Bill Structure Item DocTypes" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: high" \
'## Description
Create the tariff slab configuration DocTypes used to price meter consumption.

## Utility Bill Structure fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| structure_name | Data | Required |
| utility_type | Select | Electricity / Water / Gas |
| customer_group | Link → Customer Group | |

## Bill Structure Item (child table of Utility Bill Structure)
| Field | Type | Notes |
|---|---|---|
| from_units | Float | Required |
| to_units | Float | Required |
| rate_per_unit | Currency | Required |
| fixed_charge | Currency | |

## Acceptance criteria
- [ ] Both DocTypes created
- [ ] Slabs validated: from_units < to_units, no gaps or overlaps between consecutive rows
- [ ] Unit test: price 150 units against a 3-slab structure, verify correct total

## Notes
See AGENTS.md Section 4 — tariff billing rule. Slabs are applied progressively.'

create_issue \
  "feat(utility): create Meter Reading DocType with billing trigger" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: high" \
'## Description
Create the `Meter Reading` DocType. On submission, calculate the bill using the assigned Bill Structure and trigger Sales Invoice generation.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `MR-.YYYY.MM.-.#####` |
| customer | Link → Customer | Required |
| meter_serial_no | Link → Serial No | Required |
| property | Link → Utility Property | |
| reading_date | Date | Required |
| previous_reading | Float | |
| current_reading | Float | Required |
| consumption | Float | Auto-calculated: current - previous |
| bill_structure | Link → Utility Bill Structure | Required |
| total_amount | Currency | Auto-calculated via slab pricing |
| status | Select | Draft / Submitted / Invoiced |

## Acceptance criteria
- [ ] consumption auto-calculated on save
- [ ] total_amount calculated using Bill Structure slabs + Billing Adjustment Rules (by priority)
- [ ] On submit: create Sales Invoice linked to this Meter Reading
- [ ] Unit test: full billing cycle — reading → slab pricing → adjustment → invoice amount

## Notes
See AGENTS.md Section 4 — tariff billing and adjustment rules order.'

create_issue \
  "feat(utility): create Billing Adjustment Rule DocType" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: medium" \
'## Description
Create the `Billing Adjustment Rule` DocType for applying discounts or surcharges to meter bills.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| rule_type | Select | Discount / Surcharge |
| applies_to | Select | All / Customer Group / Individual |
| amount_or_percent | Float | |
| valid_from | Date | |
| valid_to | Date | |
| priority | Int | Lower number = applied first |

## Acceptance criteria
- [ ] DocType created
- [ ] Rules applied in priority order during Meter Reading billing calculation
- [ ] valid_from / valid_to respected — expired rules are skipped
- [ ] Unit test: two rules with different priorities applied to a bill; verify order and result

## Notes
Applied after slab pricing, before invoice generation.'

create_issue \
  "feat(utility): create Utility Billing Settings Single DocType" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: high" \
'## Description
Create the `Utility Billing Settings` DocType (Single — only one record exists system-wide).

## Fields
| Field | Type | Notes |
|---|---|---|
| company | Link → Company | Required |
| default_income_account | Link → Account | |
| default_receivable_account | Link → Account | |
| default_cost_center | Link → Cost Center | |
| invoice_status | Select | Draft / Submitted |
| auto_create_customer | Check | Gates Tenant → Customer auto-creation |
| require_contract | Check | Blocks Service Request without active Contract |

## Acceptance criteria
- [ ] Single DocType (is_single = 1)
- [ ] auto_create_customer checked by default
- [ ] Unit test: read settings and verify default values

## Notes
This is the central config referenced by Tenant controller and Meter Reading billing.'

create_issue \
  "feat(utility): register Serial No (meter) and link to Utility Property" \
  "$MANDEQ" \
  "utility-billing,type: feature,priority: medium" \
'## Description
Configure Serial No usage for utility meters — a meter is a tracked serialised item linked to a Utility Property and Customer.

## Tasks
- Create a Frappe Item called "Utility Meter" (or per type: Electricity Meter, Water Meter)
- Ensure Serial No records are created when a meter is installed at a property
- Serial No fields used: serial_no, item_code, customer, status
- Link Serial No to Meter Reading via meter_serial_no field

## Acceptance criteria
- [ ] Item created for meter types
- [ ] Serial No can be searched and linked in Meter Reading
- [ ] Unit test: create Serial No and link to a Meter Reading

## Notes
Use ERPNext core Serial No DocType — do not duplicate it.'

echo ""

# ===================================================================
# RUWEYDA — Service, Finance + Maintenance
# ===================================================================
echo "── HODAN (Service, Finance + Maintenance) ──"

create_issue \
  "feat(service): create Utility Service Request DocType" \
  "$RUWEYDA" \
  "service-finance,type: feature,priority: high" \
'## Description
Create the `Utility Service Request` DocType for tenant connection/activation requests.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `USR-.YYYY.-.#####` |
| customer | Link → Customer | Required |
| property | Link → Utility Property | Required |
| unit | Link → Rental Unit | Required |
| service_type | Select | Electricity / Water / Gas / Internet |
| request_date | Date | Today by default |
| contract_start_date | Date | |
| contract_end_date | Date | |
| monthly_amount | Currency | |
| status | Select | Draft / Pending / Active / Cancelled |
| sales_order | Link → Sales Order | Auto-populated |
| contract | Link → Contract | |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] If Utility Billing Settings.require_contract = true, validate that an active Contract exists for the unit before saving
- [ ] On approval: create Sales Order for connection charge
- [ ] Unit test: require_contract validation blocks request without Contract

## Notes
Depends on: Rental Unit (Dev 1), Utility Property (Dev 2), Utility Billing Settings (Dev 2).'

create_issue \
  "feat(service): Sales Order integration for deposits and service charges" \
  "$RUWEYDA" \
  "service-finance,type: feature,priority: high" \
'## Description
Extend the ERPNext Sales Order DocType (via custom fields / hooks) to support Gurimaal workflows.

## Tasks
- Add custom fields to Sales Order: `service_request` (Link → Utility Service Request), `billing_type` (Select: Deposit / Rent / Service / Utility)
- Hook: when Contract is activated, auto-create a Sales Order for security_deposit_amount
- Hook: when Utility Service Request is approved, auto-create a Sales Order for connection charge
- Link Sales Order back to the originating document

## Acceptance criteria
- [ ] Custom fields added via custom field (not modifying core DocType JSON)
- [ ] Deposit Sales Order created on Contract activation
- [ ] Service charge Sales Order created on Service Request approval
- [ ] Unit test: verify SO is created with correct amount and billing_type

## Notes
Do NOT duplicate the Sales Order DocType. Use custom fields + document_events hooks in hooks.py.'

create_issue \
  "feat(service): Sales Invoice integration — rent, utility, and service invoicing" \
  "$RUWEYDA" \
  "service-finance,type: feature,priority: high" \
'## Description
Extend Sales Invoice to support Gurimaal billing flows (rent cycles, meter billing, service charges).

## Tasks
- Add custom fields: `meter_reading` (Link → Meter Reading), `unit_ref` (Link → Rental Unit)
- Ensure Meter Reading on_submit creates a Sales Invoice with correct line items (consumption amount + fixed charge)
- Recurring rent: Auto Repeat spawns Sales Invoice from Contract — verify line items are correct
- Invoice posting_date, income account, cost_center pulled from Utility Billing Settings defaults

## Acceptance criteria
- [ ] Custom fields added
- [ ] Meter Reading submission creates Sales Invoice with correct total
- [ ] Recurring rent invoice has correct amount and linked unit
- [ ] Unit test: meter reading → invoice amount matches manual slab calculation

## Notes
Depends on: Meter Reading (Dev 2), Contract + Auto Repeat (Dev 1).'

create_issue \
  "feat(service): Payment Entry reconciliation for tenant payments" \
  "$RUWEYDA" \
  "service-finance,type: feature,priority: medium" \
'## Description
Ensure Payment Entry correctly reconciles against Gurimaal Sales Invoices, with correct party linkage through Tenant → Customer.

## Tasks
- Verify Payment Entry party = Customer (auto-created from Tenant)
- Test: create Payment Entry against a rent invoice and a utility invoice
- Document the payment flow in a test fixture for QA reference
- Add custom field if needed: reference back to Tenant for reporting

## Acceptance criteria
- [ ] Payment Entry links to Customer (via Tenant chain)
- [ ] Reconciliation against Sales Invoice works correctly
- [ ] Unit test: full cycle — Contract → Invoice → Payment, verify outstanding = 0

## Notes
Payment Entry is ERPNext core — extend via custom fields only if needed.'

create_issue \
  "feat(maintenance): create Maintenance Request DocType" \
  "$RUWEYDA" \
  "maintenance,type: feature,priority: medium" \
'## Description
Create the `Maintenance Request` DocType for tenant-reported issues.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | Naming series: `MNT-.YYYY.-.#####` |
| unit | Link → Rental Unit | Required |
| customer | Link → Customer | Required |
| property | Link → Utility Property | |
| category | Select | Plumbing / Electrical / HVAC / Structural / Other |
| priority | Select | Low / Medium / High / Emergency |
| description | Text | Required |
| reported_date | Date | Today by default |
| resolved_date | Date | |
| assigned_to | Link → User | |
| status | Select | Open / In Progress / Resolved / Closed |
| issue | Link → Issue | Optional ERPNext Issue link |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] status defaults to Open
- [ ] On Emergency priority: send email notification to assigned_to
- [ ] Unit test: create request, assign, resolve

## Notes
Depends on: Rental Unit (Dev 1).'

create_issue \
  "feat(maintenance): create Maintenance Job DocType with Vendor assignment" \
  "$RUWEYDA" \
  "maintenance,type: feature,priority: medium" \
'## Description
Create `Maintenance Job` and `Vendor` DocTypes. A Job is spawned from a Maintenance Request and assigned to a Vendor.

## Vendor fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| vendor_name | Data | Required |
| trade | Select | Plumbing / Electrical / HVAC / General |
| phone | Data | |
| supplier | Link → Supplier | Optional ERPNext link |

## Maintenance Job fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| request | Link → Maintenance Request | Required |
| vendor | Link → Vendor | Required |
| estimated_cost | Currency | |
| actual_cost | Currency | |
| scheduled_date | Date | |
| completion_date | Date | |
| status | Select | Scheduled / In Progress / Completed / Cancelled |
| purchase_order | Link → Purchase Order | Optional cost reconciliation |

## Acceptance criteria
- [ ] Both DocTypes created
- [ ] Job can be created from Maintenance Request (via button or hook)
- [ ] On completion: set Maintenance Request.status = Resolved, record resolved_date
- [ ] Unit test: create Job, complete it, verify Request status updated

## Notes
Vendor is a Gurimaal DocType, separate from ERPNext Supplier (though they can be linked).'

create_issue \
  "feat(maintenance): create Maintenance Checklist DocType for periodic inspections" \
  "$RUWEYDA" \
  "maintenance,type: feature,priority: low" \
'## Description
Create the `Maintenance Checklist` DocType for scheduled periodic unit inspections.

## Fields
| Field | Type | Notes |
|---|---|---|
| name | Data (PK) | |
| unit | Link → Rental Unit | Required |
| inspection_type | Select | Move-in / Move-out / Periodic / Emergency |
| inspection_date | Date | Required |
| inspector | Link → User | |
| status | Select | Pending / Completed / Failed |
| remarks | Text | |

## Acceptance criteria
- [ ] DocType created with all fields
- [ ] inspection_date cannot be in the future when saving a Completed checklist
- [ ] List view filterable by unit and inspection_type
- [ ] Unit test: create checklist, complete it

## Notes
Depends on: Rental Unit (Dev 1). Lower priority — implement after core domains are stable.'

echo ""
echo "=========================================="
echo "  All issues created successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Go to https://github.com/$REPO/issues to verify"
echo "  2. Create a GitHub Project board and add all issues"
echo "  3. Set default branch protection (if repo is public)"
echo ""