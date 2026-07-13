import { apiClient } from "./client";

export type DashboardSummary = {
  tenant_name?: string;
  unit?: string;
  monthly_rent?: number;
  outstanding_balance?: number;
  next_due_date?: string;
  lease_expiry?: string;
  utility_balance?: number;
  pending_maintenance_count?: number;
  recent_activity?: DashboardActivity[];
  tenant?: {
    name?: string;
    tenant_name?: string;
    email?: string;
    mobile_no?: string;
    status?: string;
  };
  contract?: {
    name?: string;
    rental_unit?: string;
    contract_start_date?: string;
    contract_end_date?: string;
    monthly_rent?: number;
    status?: string;
  } | null;
  property?: {
    unit?: { name?: string; unit_no?: string; status?: string };
    floor?: { floor_name?: string; floor_number?: number };
    building?: { building_name?: string };
    project?: { project_name?: string; city?: string; address?: string };
  } | null;
  counts?: {
    open_maintenance_requests?: number;
    active_utility_services?: number;
  };
  billing?: {
    outstanding_amount?: number;
    as_of?: string;
    next_due_invoice?: {
      name?: string;
      due_date?: string;
      grand_total?: number;
      outstanding_amount?: number;
      status?: string;
    } | null;
    payment_history?: {
      name?: string;
      posting_date?: string;
      paid_amount?: number;
      received_amount?: number;
    }[];
  };
  utilities?: {
    current_amount?: number;
    recent_readings?: {
      name?: string;
      property?: string;
      reading_date?: string;
      consumption?: number;
      total_amount?: number;
      status?: string;
    }[];
  };
};

export type DashboardActivity = {
  type?: string;
  name?: string;
  status?: string;
  priority?: string;
  description?: string;
  service_type?: string;
  modified?: string;
};

export const dashboardApi = {
  summary: () => apiClient.method<DashboardSummary>("gurimaal.api.dashboard.summary"),
  getSummary: () => apiClient.method<DashboardSummary>("gurimaal.api.dashboard.summary"),
  getRecentActivity: (limit = 8) =>
    apiClient.method<DashboardActivity[]>("gurimaal.api.dashboard.get_recent_activity", { limit }),
};
