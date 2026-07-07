import { apiClient } from "./client";

export type MaintenanceRequest = {
  name: string;
  unit?: string;
  category?: string;
  priority?: string;
  description?: string;
  reported_date?: string;
  resolved_date?: string;
  assigned_to?: string;
  status?: string;
  comments?: MaintenanceComment[];
};

export type MaintenanceComment = {
  name: string;
  owner?: string;
  content?: string;
  creation?: string;
};

export const maintenanceApi = {
  listRequests: (limit = 50, status?: string) =>
    apiClient.method<MaintenanceRequest[]>("gurimaal.api.maintenance.request_list", {
      limit,
      status,
    }),
  createRequest: (args: {
    unit?: string;
    category?: string;
    priority?: string;
    description: string;
    property?: string;
  }) => apiClient.method<{ name: string }>("gurimaal.api.maintenance.create_request", args),
  requestDetail: (request: string) =>
    apiClient.method<MaintenanceRequest>("gurimaal.api.maintenance.request_detail", { request }),
  addComment: (request: string, comment: string) =>
    apiClient.method<{ name: string; comment: MaintenanceComment }>(
      "gurimaal.api.maintenance.add_comment",
      { request, comment },
    ),
};
