import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const removedBuilderName = "lova" + "ble";

const checks = [
  {
    name: "Visual builder configuration is removed",
    files: [
      "portal/package.json",
      "portal/bun.lock",
      "portal/bunfig.toml",
      "portal/vite.config.ts",
      "portal/src/routes/__root.tsx",
    ],
    patterns: [
      { file: "portal/vite.config.ts", pattern: /from "vite"/ },
      { file: "portal/vite.config.ts", pattern: /@tanstack\/react-start\/plugin\/vite/ },
      { file: "portal/vite.config.ts", pattern: /@vitejs\/plugin-react/ },
      { file: "portal/vite.config.ts", pattern: /vite-tsconfig-paths/ },
      { file: "portal/vite.config.ts", pattern: /@tailwindcss\/vite/ },
    ],
    forbiddenPatterns: [
      { file: "portal/package.json", pattern: new RegExp(removedBuilderName, "i") },
      { file: "portal/bun.lock", pattern: new RegExp(removedBuilderName, "i") },
      { file: "portal/bunfig.toml", pattern: new RegExp(removedBuilderName, "i") },
      { file: "portal/vite.config.ts", pattern: new RegExp(removedBuilderName, "i") },
      { file: "portal/src/routes/__root.tsx", pattern: new RegExp(removedBuilderName, "i") },
    ],
    missingFiles: [
      `portal/.${removedBuilderName}/project.json`,
      "portal/AGENTS.md",
      `portal/src/lib/${removedBuilderName}-error-reporting.ts`,
    ],
  },
  {
    name: "Mock portal pages use real or empty states",
    files: [
      "portal/src/routes/_layout.documents.tsx",
      "portal/src/routes/_layout.payments.tsx",
      "portal/src/routes/_layout.requests.tsx",
    ],
    patterns: [
      { file: "portal/src/routes/_layout.documents.tsx", pattern: /No files available yet/ },
      { file: "portal/src/routes/_layout.payments.tsx", pattern: /billingApi\.getOutstandingSummary/ },
      { file: "portal/src/routes/_layout.payments.tsx", pattern: /billingApi\.listPayments/ },
      { file: "portal/src/routes/_layout.requests.tsx", pattern: /maintenanceApi\.listRequests/ },
      { file: "portal/src/routes/_layout.requests.tsx", pattern: /maintenanceApi\.requestDetail/ },
      { file: "portal/src/routes/_layout.requests.tsx", pattern: /maintenanceApi\.addComment/ },
    ],
    forbiddenPatterns: [
      { file: "portal/src/routes/_layout.payments.tsx", pattern: /Visa|Mastercard|Bank transfer|Ahmed Hassan/ },
      { file: "portal/src/routes/_layout.requests.tsx", pattern: /Ahmed Hassan|Sarah Malik|Omar K|HVAC · Certified/ },
      { file: "portal/src/routes/_layout.documents.tsx", pattern: /Lease_Agreement|Receipt_2026|Passport_Copy/ },
    ],
  },
  {
    name: "Workspace integration structure is documented",
    files: ["README.md", "portal/docs/frappe-integration.md"],
    patterns: [
      { file: "README.md", pattern: /Workspace structure/ },
      { file: "README.md", pattern: /Portal and Frappe integration/ },
      { file: "README.md", pattern: /VITE_FRAPPE_API_URL/ },
      { file: "README.md", pattern: /npm run dev/ },
      { file: "portal/docs/frappe-integration.md", pattern: /Repository map/ },
      { file: "portal/docs/frappe-integration.md", pattern: /Backend API structure/ },
      { file: "portal/docs/frappe-integration.md", pattern: /Frontend API structure/ },
      { file: "portal/docs/frappe-integration.md", pattern: /Deployment decision/ },
      { file: "portal/docs/frappe-integration.md", pattern: /separate Vite portal/ },
      { file: "portal/docs/frappe-integration.md", pattern: /bench start/ },
    ],
  },
  {
    name: "API client layer works",
    files: [
      "portal/src/api/client.ts",
      "portal/src/api/authApi.ts",
      "portal/src/api/dashboardApi.ts",
      "portal/src/api/propertyApi.ts",
      "portal/src/api/contractApi.ts",
      "portal/src/api/billingApi.ts",
      "portal/src/api/utilityApi.ts",
      "portal/src/api/maintenanceApi.ts",
      "portal/src/api/notificationsApi.ts",
    ],
    patterns: [
      { file: "portal/src/api/client.ts", pattern: /VITE_FRAPPE_API_URL/ },
      { file: "portal/src/api/client.ts", pattern: /credentials:\s*"include"/ },
      { file: "portal/src/api/client.ts", pattern: /class ApiError/ },
      { file: "portal/src/api/client.ts", pattern: /ApiState/ },
      { file: "portal/src/api/client.ts", pattern: /X-Frappe-CSRF-Token/ },
      { file: "portal/src/api/authApi.ts", pattern: /gurimaal\.api\.auth\.login/ },
      { file: "portal/src/api/dashboardApi.ts", pattern: /gurimaal\.api\.dashboard\.summary/ },
      { file: "portal/src/api/propertyApi.ts", pattern: /gurimaal\.api\.property\.my_unit/ },
      { file: "portal/src/api/propertyApi.ts", pattern: /gurimaal\.api\.property\.property_detail/ },
      { file: "portal/src/api/contractApi.ts", pattern: /gurimaal\.api\.contract\.active_contract/ },
      { file: "portal/src/api/contractApi.ts", pattern: /gurimaal\.api\.contract\.contract_history/ },
      { file: "portal/src/api/contractApi.ts", pattern: /gurimaal\.api\.contract\.request_renewal/ },
      { file: "portal/src/api/billingApi.ts", pattern: /gurimaal\.api\.billing\.invoice_list/ },
      { file: "portal/src/api/billingApi.ts", pattern: /gurimaal\.api\.billing\.invoice_detail/ },
      { file: "portal/src/api/billingApi.ts", pattern: /gurimaal\.api\.billing\.payment_history/ },
      { file: "portal/src/api/billingApi.ts", pattern: /gurimaal\.api\.billing\.outstanding_summary/ },
      { file: "portal/src/api/billingApi.ts", pattern: /gurimaal\.api\.billing\.pay_invoice/ },
      { file: "portal/src/api/utilityApi.ts", pattern: /gurimaal\.api\.utility\.meter_readings/ },
      { file: "portal/src/api/utilityApi.ts", pattern: /gurimaal\.api\.utility\.current_usage/ },
      { file: "portal/src/api/utilityApi.ts", pattern: /gurimaal\.api\.utility\.utility_history/ },
      { file: "portal/src/api/utilityApi.ts", pattern: /gurimaal\.api\.utility\.latest_bill/ },
      { file: "portal/src/api/maintenanceApi.ts", pattern: /gurimaal\.api\.maintenance\.request_list/ },
      { file: "portal/src/api/maintenanceApi.ts", pattern: /gurimaal\.api\.maintenance\.request_detail/ },
      { file: "portal/src/api/maintenanceApi.ts", pattern: /gurimaal\.api\.maintenance\.add_comment/ },
      { file: "portal/src/api/notificationsApi.ts", pattern: /gurimaal\.api\.notifications\.list_notifications/ },
      { file: "portal/src/api/notificationsApi.ts", pattern: /gurimaal\.api\.notifications\.unread_count/ },
    ],
  },
  {
    name: "Login works",
    files: [
      "portal/src/routes/auth.tsx",
      "portal/src/lib/auth.ts",
      "portal/src/api/authApi.ts",
      "gurimaal/api/auth.py",
      "gurimaal/api/utils.py",
    ],
    patterns: [
      { file: "portal/src/routes/auth.tsx", pattern: /createFileRoute\("\/auth"\)/ },
      { file: "portal/src/routes/auth.tsx", pattern: /<form\s+onSubmit=\{onSubmit\}/ },
      { file: "portal/src/routes/auth.tsx", pattern: /authApi\.login/ },
      { file: "portal/src/routes/auth.tsx", pattern: /storeSession/ },
      { file: "portal/src/routes/auth.tsx", pattern: /navigate\(\{\s*to:\s*"\/"\s*\}\)/ },
      { file: "portal/src/lib/auth.ts", pattern: /sessionStorage/ },
      { file: "portal/src/lib/auth.ts", pattern: /localStorage/ },
      { file: "portal/src/lib/auth.ts", pattern: /clearStoredSession/ },
      { file: "gurimaal/api/auth.py", pattern: /@frappe\.whitelist\(allow_guest=True\)\s*def login/ },
      { file: "gurimaal/api/auth.py", pattern: /def logout/ },
      { file: "gurimaal/api/auth.py", pattern: /def me/ },
      { file: "gurimaal/api/auth.py", pattern: /def _get_session_payload/ },
      { file: "gurimaal/api/auth.py", pattern: /get_tenant_profile\(\)/ },
      { file: "gurimaal/api/utils.py", pattern: /frappe\.db\.get_value\("Tenant", \{"user": user\}/ },
      { file: "portal/src/api/authApi.ts", pattern: /gurimaal\.api\.auth\.me/ },
      { file: "portal/src/api/authApi.ts", pattern: /gurimaal\.api\.auth\.logout/ },
    ],
  },
  {
    name: "Protected routes work",
    files: [
      "portal/src/routes/_layout.tsx",
      "portal/src/routes/splash.tsx",
      "portal/src/routes/auth.tsx",
      "portal/src/lib/auth.ts",
    ],
    patterns: [
      { file: "portal/src/routes/_layout.tsx", pattern: /beforeLoad/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /redirect\(\{\s*to:\s*"\/splash"\s*\}\)/ },
      { file: "portal/src/routes/auth.tsx", pattern: /SPLASH_READY_KEY/ },
      { file: "portal/src/routes/auth.tsx", pattern: /redirect\(\{\s*to:\s*"\/splash"\s*\}\)/ },
      { file: "portal/src/routes/splash.tsx", pattern: /setTimeout/ },
      { file: "portal/src/routes/splash.tsx", pattern: /SPLASH_READY_KEY/ },
      { file: "portal/src/routes/splash.tsx", pattern: /sessionStorage\.setItem/ },
      { file: "portal/src/routes/splash.tsx", pattern: /navigate\(\{\s*to:\s*"\/auth"\s*\}\)/ },
      { file: "portal/src/routes/splash.tsx", pattern: /},\s*2000\)/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /authApi\.logout/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /clearStoredSession/ },
      { file: "portal/src/routes/auth.tsx", pattern: /redirect\(\{\s*to:\s*"\/"\s*\}\)/ },
      { file: "portal/src/lib/auth.ts", pattern: /isAuthenticated/ },
    ],
  },
  {
    name: "Dashboard loads real data",
    files: ["portal/src/routes/_layout.index.tsx", "gurimaal/api/dashboard.py"],
    patterns: [
      { file: "portal/src/routes/_layout.index.tsx", pattern: /createFileRoute\("\/_layout\/"\)/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /StatCard/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /dashboardApi\.summary/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /recent_activity/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /tenant_name/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /outstanding_amount/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /PageSkeleton/ },
      { file: "portal/src/routes/_layout.index.tsx", pattern: /No dashboard data yet/ },
      { file: "gurimaal/api/dashboard.py", pattern: /def get_summary/ },
      { file: "gurimaal/api/dashboard.py", pattern: /def summary/ },
      { file: "gurimaal/api/dashboard.py", pattern: /pending_maintenance_count/ },
      { file: "gurimaal/api/dashboard.py", pattern: /recent_activity/ },
      { file: "gurimaal/api/dashboard.py", pattern: /get_active_contract/ },
      { file: "gurimaal/api/dashboard.py", pattern: /Sales Invoice/ },
      { file: "gurimaal/api/dashboard.py", pattern: /Meter Reading/ },
      { file: "gurimaal/api/dashboard.py", pattern: /Payment Entry/ },
    ],
  },
  {
    name: "Property page works",
    files: ["portal/src/routes/_layout.property.tsx", "gurimaal/api/property.py"],
    patterns: [
      { file: "portal/src/routes/_layout.property.tsx", pattern: /createFileRoute\("\/_layout\/property"\)/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /My Property/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /propertyApi\.getMyProperty/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /Loading property details/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /No active property found/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /floor_name/ },
      { file: "portal/src/routes/_layout.property.tsx", pattern: /building_name/ },
      { file: "gurimaal/api/property.py", pattern: /def get_my_property/ },
      { file: "gurimaal/api/property.py", pattern: /def my_unit/ },
      { file: "gurimaal/api/property.py", pattern: /def property_detail/ },
      { file: "gurimaal/api/property.py", pattern: /get_unit_hierarchy/ },
    ],
  },
  {
    name: "Contract page works",
    files: ["portal/src/routes/_layout.contract.tsx", "gurimaal/api/contract.py"],
    patterns: [
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /createFileRoute\("\/_layout\/contract"\)/ },
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /My Contract/ },
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /contractApi\.getCurrentContract/ },
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /Loading contract details/ },
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /No active contract found/ },
      { file: "portal/src/routes/_layout.contract.tsx", pattern: /monthly_rent/ },
      { file: "gurimaal/api/contract.py", pattern: /def get_current_contract/ },
      { file: "gurimaal/api/contract.py", pattern: /def active_contract/ },
      { file: "gurimaal/api/contract.py", pattern: /def contract_history/ },
      { file: "gurimaal/api/contract.py", pattern: /def request_renewal/ },
      { file: "gurimaal/api/contract.py", pattern: /"Contracts"/ },
    ],
  },
  {
    name: "Billing page works",
    files: ["portal/src/routes/_layout.billing.tsx", "gurimaal/api/billing.py"],
    patterns: [
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /createFileRoute\("\/_layout\/billing"\)/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /Billing & Payments/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /billingApi\.listInvoices/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /billingApi\.getInvoice/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /billingApi\.listPayments/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /billingApi\.getOutstandingSummary/ },
      { file: "portal/src/routes/_layout.billing.tsx", pattern: /Payment history/ },
      { file: "gurimaal/api/billing.py", pattern: /def list_invoices/ },
      { file: "gurimaal/api/billing.py", pattern: /def invoice_list/ },
      { file: "gurimaal/api/billing.py", pattern: /def get_invoice/ },
      { file: "gurimaal/api/billing.py", pattern: /def invoice_detail/ },
      { file: "gurimaal/api/billing.py", pattern: /def get_outstanding_summary/ },
      { file: "gurimaal/api/billing.py", pattern: /def outstanding_summary/ },
      { file: "gurimaal/api/billing.py", pattern: /def list_payments/ },
      { file: "gurimaal/api/billing.py", pattern: /def payment_history/ },
      { file: "gurimaal/api/billing.py", pattern: /def pay_invoice/ },
      { file: "gurimaal/api/billing.py", pattern: /"reference_doctype": "Sales Invoice"/ },
    ],
  },
  {
    name: "Utility page works",
    files: ["portal/src/routes/_layout.utilities.tsx", "gurimaal/api/utility.py"],
    patterns: [
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /createFileRoute\("\/_layout\/utilities"\)/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /Utility Bills/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /utilityApi\.currentUsage/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /utilityApi\.utilityHistory/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /utilityApi\.latestBill/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /buildUtilityCards/ },
      { file: "portal/src/routes/_layout.utilities.tsx", pattern: /AreaChart/ },
      { file: "gurimaal/api/utility.py", pattern: /def current_usage/ },
      { file: "gurimaal/api/utility.py", pattern: /def utility_history/ },
      { file: "gurimaal/api/utility.py", pattern: /def latest_bill/ },
      { file: "gurimaal/api/utility.py", pattern: /def meter_readings/ },
      { file: "gurimaal/api/utility.py", pattern: /def list_service_requests/ },
      { file: "gurimaal/api/utility.py", pattern: /def list_meter_readings/ },
      { file: "gurimaal/api/utility.py", pattern: /def create_service_request/ },
    ],
  },
  {
    name: "Maintenance request works",
    files: ["portal/src/routes/_layout.maintenance.tsx", "gurimaal/api/maintenance.py"],
    patterns: [
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /createFileRoute\("\/_layout\/maintenance"\)/ },
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /Report new issue/ },
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /maintenanceApi\.listRequests/ },
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /maintenanceApi\.createRequest/ },
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /<Dialog/ },
      { file: "portal/src/routes/_layout.maintenance.tsx", pattern: /<Textarea/ },
      { file: "gurimaal/api/maintenance.py", pattern: /def list_requests/ },
      { file: "gurimaal/api/maintenance.py", pattern: /def request_list/ },
      { file: "gurimaal/api/maintenance.py", pattern: /def create_request/ },
      { file: "gurimaal/api/maintenance.py", pattern: /def request_detail/ },
      { file: "gurimaal/api/maintenance.py", pattern: /def add_comment/ },
      { file: "gurimaal/api/maintenance.py", pattern: /reference_doctype": "Maintenance Request"/ },
    ],
  },
  {
    name: "Notifications work",
    files: ["portal/src/routes/_layout.notifications.tsx", "gurimaal/api/notifications.py"],
    patterns: [
      { file: "portal/src/routes/_layout.notifications.tsx", pattern: /createFileRoute\("\/_layout\/notifications"\)/ },
      { file: "portal/src/routes/_layout.notifications.tsx", pattern: /Notifications/ },
      { file: "portal/src/routes/_layout.notifications.tsx", pattern: /notificationsApi\.listNotifications/ },
      { file: "portal/src/routes/_layout.notifications.tsx", pattern: /notificationsApi\.markAsRead/ },
      { file: "portal/src/routes/_layout.notifications.tsx", pattern: /unread\.length/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /notificationsApi\.unreadCount/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /unreadCount/ },
      { file: "gurimaal/api/notifications.py", pattern: /def list_notifications/ },
      { file: "gurimaal/api/notifications.py", pattern: /def mark_as_read/ },
      { file: "gurimaal/api/notifications.py", pattern: /def mark_read/ },
      { file: "gurimaal/api/notifications.py", pattern: /def unread_count/ },
    ],
  },
  {
    name: "Profile works",
    files: ["portal/src/routes/_layout.profile.tsx", "gurimaal/api/tenant.py"],
    patterns: [
      { file: "portal/src/routes/_layout.profile.tsx", pattern: /createFileRoute\("\/_layout\/profile"\)/ },
      { file: "portal/src/routes/_layout.profile.tsx", pattern: /Profile/ },
      { file: "portal/src/routes/_layout.profile.tsx", pattern: /tenantApi\.getProfile/ },
      { file: "portal/src/routes/_layout.profile.tsx", pattern: /tenantApi\.updateProfile/ },
      { file: "portal/src/routes/_layout.profile.tsx", pattern: /tenant_name/ },
      { file: "gurimaal/api/tenant.py", pattern: /def get_profile/ },
      { file: "gurimaal/api/tenant.py", pattern: /def update_profile/ },
    ],
  },
  {
    name: "Mobile layout works",
    files: ["portal/src/components/MobileBottomNav.tsx"],
    patterns: [
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /md:hidden/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /primaryNav/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Home"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Property"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Contract"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Billing"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Maintenance"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /Drawer/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /secondaryNav/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Requests"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Documents"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Notifications"/ },
      { file: "portal/src/components/MobileBottomNav.tsx", pattern: /title:\s*"Profile"/ },
    ],
  },
  {
    name: "Desktop layout works",
    files: ["portal/src/routes/_layout.tsx", "portal/src/components/AppSidebar.tsx"],
    patterns: [
      { file: "portal/src/routes/_layout.tsx", pattern: /hidden md:block/ },
      { file: "portal/src/routes/_layout.tsx", pattern: /AppSidebar/ },
      { file: "portal/src/components/AppSidebar.tsx", pattern: /mainNav/ },
      { file: "portal/src/components/AppSidebar.tsx", pattern: /bottomNav/ },
    ],
  },
  {
    name: "Tenant cannot access other tenant data",
    files: ["gurimaal/api/utils.py", "gurimaal/api/maintenance.py", "gurimaal/api/utility.py"],
    patterns: [
      { file: "gurimaal/api/utils.py", pattern: /def get_current_tenant/ },
      { file: "gurimaal/api/utils.py", pattern: /def require_tenant_unit/ },
      { file: "gurimaal/api/utils.py", pattern: /frappe\.PermissionError/ },
      { file: "gurimaal/api/maintenance.py", pattern: /require_tenant_unit\(unit\)/ },
      { file: "gurimaal/api/utility.py", pattern: /require_tenant_unit\(unit\)/ },
    ],
  },
];

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function runCheck(check) {
  const failures = [];

  for (const file of check.files) {
    try {
      readFile(file);
    } catch (error) {
      failures.push(error.message);
    }
  }

  for (const assertion of check.patterns) {
    try {
      const source = readFile(assertion.file);
      if (!assertion.pattern.test(source)) {
        failures.push(`Missing expected pattern in ${assertion.file}: ${assertion.pattern}`);
      }
    } catch (error) {
      failures.push(error.message);
    }
  }

  for (const assertion of check.forbiddenPatterns ?? []) {
    try {
      const source = readFile(assertion.file);
      if (assertion.pattern.test(source)) {
        failures.push(`Found forbidden pattern in ${assertion.file}: ${assertion.pattern}`);
      }
    } catch (error) {
      failures.push(error.message);
    }
  }

  for (const relativePath of check.missingFiles ?? []) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (fs.existsSync(absolutePath)) {
      failures.push(`Expected file to be removed: ${relativePath}`);
    }
  }

  return failures;
}

let failed = 0;

console.log("Gurimaal Tenant Portal end-to-end verification");
console.log("------------------------------------------------");

for (const check of checks) {
  const failures = runCheck(check);
  if (failures.length) {
    failed += 1;
    console.log(`FAIL ${check.name}`);
    for (const failure of failures) {
      console.log(`  - ${failure}`);
    }
  } else {
    console.log(`PASS ${check.name}`);
  }
}

console.log("------------------------------------------------");

if (failed) {
  console.log(`${failed} checklist item(s) failed.`);
  process.exit(1);
}

console.log("All checklist items passed. Portal is ready for production testing.");
