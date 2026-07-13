import { apiClient, frappeApiBaseUrl } from "./client";

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
  attachments?: MaintenanceAttachment[];
};

export type MaintenanceComment = {
  name: string;
  owner?: string;
  content?: string;
  creation?: string;
};

export type MaintenanceAttachment = {
  name: string;
  file_name?: string;
  file_url?: string;
  is_private?: boolean | number;
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
  uploadAttachment: (request: string, file: File) => uploadMaintenanceAttachment(request, file),
  requestDetail: (request: string) =>
    apiClient.method<MaintenanceRequest>("gurimaal.api.maintenance.request_detail", { request }),
  addComment: (request: string, comment: string) =>
    apiClient.method<{ name: string; comment: MaintenanceComment }>(
      "gurimaal.api.maintenance.add_comment",
      { request, comment },
    ),
};

async function uploadMaintenanceAttachment(request: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("request", request);

  const response = await fetch(
    `${frappeApiBaseUrl}/api/method/gurimaal.api.maintenance.upload_attachment`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Frappe-CSRF-Token": typeof window === "undefined" ? "" : (window.csrf_token ?? ""),
      },
      body: formData,
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getUploadError(payload) || `Could not upload ${file.name}.`);
  }

  return payload?.message?.data as MaintenanceAttachment;
}

function getUploadError(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const serverMessages = "_server_messages" in payload ? payload._server_messages : null;
  if (typeof serverMessages !== "string") return null;

  try {
    const messages = JSON.parse(serverMessages) as string[];
    const first = messages[0] ? JSON.parse(messages[0]) : null;
    return first?.message ?? null;
  } catch {
    return serverMessages;
  }
}
