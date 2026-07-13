import { apiClient } from "./client";

export type PortalNotification = {
  name: string;
  subject?: string;
  type?: string;
  document_type?: string;
  document_name?: string;
  read?: 0 | 1;
  creation?: string;
};

export const notificationsApi = {
  listNotifications: (limit = 50) =>
    apiClient.method<PortalNotification[]>("gurimaal.api.notifications.list_notifications", {
      limit,
    }),
  unreadCount: () =>
    apiClient.method<{ count: number }>("gurimaal.api.notifications.unread_count"),
  markAsRead: (notification: string) =>
    apiClient.method("gurimaal.api.notifications.mark_read", { notification }),
};
