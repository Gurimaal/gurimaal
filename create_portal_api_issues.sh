#!/usr/bin/env bash
# Gurimaal — Auto create Portal + API integration issues
# Usage:
# chmod +x create_portal_api_issues.sh
# ./create_portal_api_issues.sh Gurimaal/gurimaal

set -e

REPO="${1:?Usage: ./create_portal_api_issues.sh <owner>/<repo>}"

MANDEQ="MandeqAli"
RUWEYDA="RuweydaAbdulKhadirAdam"
HODAN="Hodan-dev"

create_issue () {
  local title="$1"
  local assignee="$2"
  local labels="$3"
  local body="$4"

  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --assignee "$assignee" \
    --label "$labels" \
    --body "$body"

  echo "✓ Created: $title → @$assignee"
}

echo "Creating Gurimaal Portal + API issues on $REPO ..."

# =========================
# MANDEQ — Project/Foundation
# =========================

create_issue \
"chore(portal): audit and remove Lovable configuration" \
"$MANDEQ" \
"type: chore,portal,frontend,priority: high" \
"## Goal
Clean the /portal project and remove Lovable-only configuration.

## Tasks
- Remove .lovable folder
- Remove mock/demo data
- Remove unused Lovable config
- Clean package.json dependencies
- Organize src structure
- Ensure portal still runs with bun install && bun run dev

## Acceptance Criteria
- No Lovable-only config remains
- Portal builds successfully
- Existing UI remains working"

create_issue \
"chore(workspace): prepare Gurimaal frontend/backend integration structure" \
"$MANDEQ" \
"type: chore,backend,frontend,priority: high" \
"## Goal
Prepare clean structure for portal and Frappe integration.

## Tasks
- Review /gurimaal backend app
- Review /portal frontend app
- Document how portal connects to Frappe APIs
- Add README setup instructions
- Decide deployment option: separate Vite app or served via Frappe public/www

## Acceptance Criteria
- Clear integration plan exists
- README updated
- Team can run both backend and portal locally"

# =========================
# RUWEYDA — Backend APIs
# =========================

create_issue \
"feat(api): create Gurimaal API base architecture" \
"$RUWEYDA" \
"type: feature,api,backend,priority: high" \
"## Goal
Create backend API structure for Tenant Portal.

## Files
Create:
- gurimaal/api/auth.py
- gurimaal/api/dashboard.py
- gurimaal/api/tenant.py
- gurimaal/api/property.py
- gurimaal/api/contract.py
- gurimaal/api/billing.py
- gurimaal/api/utility.py
- gurimaal/api/maintenance.py
- gurimaal/api/notifications.py
- gurimaal/api/utils.py

## Acceptance Criteria
- All files created
- Shared helpers exist
- All endpoints use frappe.whitelist
- No core ERPNext/Frappe modification"

create_issue \
"feat(api): implement authentication endpoints" \
"$RUWEYDA" \
"type: feature,api,backend,priority: high" \
"## Endpoints
- login
- logout
- me

## Requirements
- Tenant login works
- Return logged-in user
- Return linked Tenant
- Validate permissions

## Acceptance Criteria
- Tenant can login
- Tenant can get own profile
- Other tenant data is not exposed"

create_issue \
"feat(api): implement dashboard summary endpoint" \
"$RUWEYDA" \
"type: feature,api,backend,priority: high" \
"## Endpoint
gurimaal.api.dashboard.summary

## Return
- tenant name
- unit
- monthly rent
- outstanding balance
- next due date
- lease expiry
- utility balance
- pending maintenance count
- recent activity

## Acceptance Criteria
- Dashboard loads from one API call
- Data is tenant-specific only"

create_issue \
"feat(api): implement tenant, property, and contract APIs" \
"$RUWEYDA" \
"type: feature,api,backend,priority: high" \
"## Endpoints
Tenant:
- get_profile
- update_profile

Property:
- my_unit
- property_detail

Contract:
- active_contract
- contract_history
- request_renewal

## Acceptance Criteria
- Tenant sees only own unit and contract
- No hardcoded data
- Proper error handling"

create_issue \
"feat(api): implement billing and payment APIs" \
"$RUWEYDA" \
"type: feature,api,backend,priority: high" \
"## Endpoints
- invoice_list
- invoice_detail
- payment_history
- outstanding_summary
- pay_invoice

## Requirements
- Use Tenant → Customer relation
- Filter Sales Invoice by tenant customer
- Payment Entry must reconcile with invoice

## Acceptance Criteria
- Paid/unpaid invoices display correctly
- Outstanding balance is accurate"

create_issue \
"feat(api): implement utility billing APIs" \
"$RUWEYDA" \
"type: feature,api,backend,priority: medium" \
"## Endpoints
- current_usage
- utility_history
- latest_bill
- meter_readings

## Acceptance Criteria
- Utility page can show current usage
- History charts use real Meter Reading data"

create_issue \
"feat(api): implement maintenance APIs" \
"$RUWEYDA" \
"type: feature,api,backend,priority: medium" \
"## Endpoints
- request_list
- create_request
- request_detail
- add_comment

## Acceptance Criteria
- Tenant can create request
- Tenant can track only own requests
- Request detail supports conversation/comments"

create_issue \
"feat(api): implement notifications API" \
"$RUWEYDA" \
"type: feature,api,backend,priority: medium" \
"## Endpoints
- list_notifications
- mark_read
- unread_count

## Acceptance Criteria
- Notification badge works
- Mark as read works"

# =========================
# HODAN — Frontend Portal
# =========================

create_issue \
"feat(portal): create API client layer" \
"$HODAN" \
"type: feature,portal,frontend,priority: high" \
"## Goal
Create reusable API client for the React/Vite portal.

## Files
- portal/src/api/client.ts
- portal/src/api/authApi.ts
- portal/src/api/dashboardApi.ts
- portal/src/api/propertyApi.ts
- portal/src/api/contractApi.ts
- portal/src/api/billingApi.ts
- portal/src/api/utilityApi.ts
- portal/src/api/maintenanceApi.ts
- portal/src/api/notificationsApi.ts

## Acceptance Criteria
- Base URL uses VITE_FRAPPE_API_URL
- Handles loading/errors
- Supports authenticated requests"

create_issue \
"feat(portal): implement login and protected routes" \
"$HODAN" \
"type: feature,portal,frontend,priority: high" \
"## Tasks
- Login page
- Logout
- Session storage
- Protected routes
- Redirect unauthenticated users

## Acceptance Criteria
- User cannot access portal without login
- Logout clears session"

create_issue \
"feat(portal): connect dashboard to real backend" \
"$HODAN" \
"type: feature,portal,frontend,priority: high" \
"## Goal
Replace all static dashboard data with gurimaal.api.dashboard.summary.

## Acceptance Criteria
- Tenant name comes from API
- Unit, rent, outstanding, due date, utilities come from API
- Loading and empty states exist
- No mock data remains"

create_issue \
"feat(portal): connect property and contract pages" \
"$HODAN" \
"type: feature,portal,frontend,priority: medium" \
"## Tasks
- My Property page uses property API
- My Contract page uses contract API
- Add loading, empty, and error states

## Acceptance Criteria
- Tenant sees real unit/building/floor
- Tenant sees real active contract"

create_issue \
"feat(portal): connect billing and utility pages" \
"$HODAN" \
"type: feature,portal,frontend,priority: high" \
"## Tasks
- Invoice list
- Invoice detail
- Payment history
- Outstanding balance
- Utility usage
- Utility charts

## Acceptance Criteria
- Billing page uses real Sales Invoice data
- Utility page uses real Meter Reading data"

create_issue \
"feat(portal): connect maintenance, notifications, and profile" \
"$HODAN" \
"type: feature,portal,frontend,priority: medium" \
"## Tasks
- Maintenance request list
- Create maintenance request form
- Notification list
- Mark notification as read
- Profile page

## Acceptance Criteria
- Tenant can create maintenance request
- Notifications show real unread count
- Profile shows Tenant data"

create_issue \
"feat(portal): improve mobile bottom navigation" \
"$HODAN" \
"type: feature,portal,mobile,frontend,priority: medium" \
"## Goal
Mobile view should use app-style bottom navigation instead of sidebar.

## Bottom Nav
- Home
- Property
- Contract
- Billing
- Maintenance
- More menu

## Acceptance Criteria
- Desktop sidebar remains unchanged
- Mobile bottom nav is fixed
- Active tab is highlighted
- More menu contains Requests, Documents, Notifications, Profile"

# =========================
# ALL — Testing
# =========================

create_issue \
"test: full tenant portal end-to-end verification" \
"$MANDEQ" \
"type: needs-review,qa,priority: high" \
"## Goal
Verify full Gurimaal Tenant Portal flow.

## Checklist
- Login works
- Dashboard loads real data
- Property page works
- Contract page works
- Billing page works
- Utility page works
- Maintenance request works
- Notifications work
- Profile works
- Mobile layout works
- Desktop layout works
- Tenant cannot access other tenant data

## Acceptance Criteria
Portal is ready for production testing."

echo "Done. All issues created."