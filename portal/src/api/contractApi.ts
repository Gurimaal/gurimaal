import { apiClient } from "./client";

export type Contract = {
  name: string;
  rental_property?: string;
  rental_unit?: string;
  tenant?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  monthly_rent?: number;
  security_deposit_amount?: number;
  escalation_percentage?: number;
  escalation_interval?: string;
  next_escalation_date?: string;
  notice_period_days?: number;
  status?: string;
};

export const contractApi = {
  getCurrentContract: () =>
    apiClient.method<Contract | null>("gurimaal.api.contract.active_contract"),
  listContracts: (limit = 20) =>
    apiClient.method<Contract[]>("gurimaal.api.contract.contract_history", { limit }),
  requestRenewal: (message?: string) =>
    apiClient.method<{ contract: string; comment: string }>("gurimaal.api.contract.request_renewal", {
      message,
    }),
};
