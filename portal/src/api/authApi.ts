import { apiClient } from "./client";

export type LoginResponse = {
  user: {
    name: string;
    full_name?: string;
    email?: string;
    mobile_no?: string;
  };
  tenant?: {
    name?: string;
    tenant_name?: string;
    user?: string;
    customer?: string;
    mobile_no?: string;
    email?: string;
    national_id?: string;
    status?: string;
  };
};

export type MeResponse = {
  user: LoginResponse["user"];
  tenant?: LoginResponse["tenant"];
};

export const authApi = {
  login: (usr: string, pwd: string) =>
    apiClient.method<LoginResponse>("gurimaal.api.auth.login", { usr, pwd }),
  logout: () => apiClient.method("gurimaal.api.auth.logout"),
  me: () => apiClient.method<MeResponse>("gurimaal.api.auth.me"),
};
