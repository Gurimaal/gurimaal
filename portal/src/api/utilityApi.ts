import { apiClient } from "./client";

export type MeterReading = {
  name: string;
  unit?: string;
  meter_serial_no?: string;
  property?: string;
  reading_date?: string;
  previous_reading?: number;
  current_reading?: number;
  consumption?: number;
  total_amount?: number;
  status?: string;
  sales_invoice?: string;
};

export type CurrentUsage = {
  total_amount: number;
  total_consumption: number;
  readings: MeterReading[];
};

export type LatestUtilityBill = {
  reading: MeterReading;
  invoice?: {
    name?: string;
    posting_date?: string;
    due_date?: string;
    grand_total?: number;
    outstanding_amount?: number;
    status?: string;
  } | null;
} | null;

export type UtilityServiceRequest = {
  name: string;
  tenant?: string;
  customer?: string;
  property?: string;
  unit?: string;
  service_type?: string;
  request_date?: string;
  monthly_amount?: number;
  status?: string;
};

export const utilityApi = {
  listMeterReadings: (limit = 100) =>
    apiClient.method<MeterReading[]>("gurimaal.api.utility.meter_readings", { limit }),
  currentUsage: () =>
    apiClient.method<CurrentUsage>("gurimaal.api.utility.current_usage"),
  utilityHistory: (limit = 100) =>
    apiClient.method<MeterReading[]>("gurimaal.api.utility.utility_history", { limit }),
  latestBill: () =>
    apiClient.method<LatestUtilityBill>("gurimaal.api.utility.latest_bill"),
  listServiceRequests: (limit = 20, status?: string) =>
    apiClient.method<UtilityServiceRequest[]>("gurimaal.api.utility.list_service_requests", {
      limit,
      status,
    }),
  createServiceRequest: (args: {
    property: string;
    unit: string;
    service_type: string;
    monthly_amount?: number;
  }) => apiClient.method<{ name: string }>("gurimaal.api.utility.create_service_request", args),
  listBillStructures: (utility_type?: string, limit = 50) =>
    apiClient.method("gurimaal.api.utility.list_bill_structures", { utility_type, limit }),
};
