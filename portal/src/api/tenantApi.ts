import { apiClient } from "./client";

export type TenantProfile = {
  name: string;
  tenant_name?: string;
  user?: string;
  customer?: string;
  mobile_no?: string;
  email?: string;
  national_id?: string;
  status?: string;
};

export const tenantApi = {
  getProfile: () => apiClient.method<TenantProfile>("gurimaal.api.tenant.get_profile"),
  updateProfile: (args: { email?: string; mobile_no?: string }) =>
    apiClient.method<TenantProfile>("gurimaal.api.tenant.update_profile", args),
};
