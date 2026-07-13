import { apiClient } from "./client";

type Nullable<T> = T | null;

export type PortalNotification = {
  name: string;
  subject?: Nullable<string>;
  type?: Nullable<string>;
  document_type?: Nullable<string>;
  document_name?: Nullable<string>;
  read?: Nullable<0 | 1>;
  creation?: Nullable<string>;
};

export const notificationsApi = {
  listNotifications: (limit = 50) =>
    apiClient.method<PortalNotification[]>("gurimaal.api.notifications.list_notifications", {
      limit,
    }),
  unreadCount: () => apiClient.method<{ count: number }>("gurimaal.api.notifications.unread_count"),
  markAsRead: (notification: string) =>
    apiClient.method("gurimaal.api.notifications.mark_read", { notification }),
};
