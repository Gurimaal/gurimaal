import { apiClient } from "./client";

type Nullable<T> = T | null;

export type TenantProfile = {
  name: string;
  tenant_name?: Nullable<string>;
  user?: Nullable<string>;
  customer?: Nullable<string>;
  mobile_no?: Nullable<string>;
  email?: Nullable<string>;
  national_id?: Nullable<string>;
  status?: Nullable<string>;
};

export const tenantApi = {
  getProfile: () => apiClient.method<TenantProfile>("gurimaal.api.tenant.get_profile"),
  updateProfile: (args: { email?: string; mobile_no?: string }) =>
    apiClient.method<TenantProfile>("gurimaal.api.tenant.update_profile", args),
};
