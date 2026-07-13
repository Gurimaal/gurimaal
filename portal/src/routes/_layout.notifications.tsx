import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, CreditCard, FileText, Wrench, Zap } from "lucide-react";

import { notificationsApi, type PortalNotification } from "@/api/notificationsApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Gurimaal" }] }),
  component: NotificationsPage,
});

type NotificationView = {
  id: string;
  title: string;
  desc: string;
  time: string;
  action?: string;
  icon: typeof Bell;
  tone: "primary" | "secondary" | "accent" | "destructive" | "info";
  read: boolean;
};

const toneClass: Record<NotificationView["tone"], string> = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  accent: "bg-amber-100 text-amber-600",
  destructive: "bg-red-50 text-red-500",
  info: "bg-blue-50 text-blue-600",
};

function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.listNotifications(50),
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const notifications = (notificationsQuery.data ?? []).map(toNotificationView);
  const unread = notifications.filter((notification) => !notification.read);
  const alerts = notifications.filter(
    (notification) => notification.tone === "destructive" || notification.tone === "accent",
  );

  function markAllAsRead() {
    unread.forEach((notification) => markRead.mutate(notification.id));
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="All updates about your tenancy in one place."
        actions={
          <Button
            variant="outline"
            className="h-12 gap-3 rounded-xl border-primary px-5 text-sm font-bold text-primary hover:bg-primary-soft sm:h-14 sm:px-7 sm:text-base"
            onClick={markAllAsRead}
            disabled={unread.length === 0 || markRead.isPending}
          >
            <CheckCircle2 className="h-5 w-5" />
            Mark All as Read
          </Button>
        }
      />

      {notificationsQuery.error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {notificationsQuery.error.message}
        </p>
      ) : null}

      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Tabs defaultValue="all">
          <div className="overflow-x-auto border-b border-border px-5 pt-0 sm:px-8">
            <TabsList className="h-auto min-w-max gap-6 rounded-none bg-transparent p-0 text-base sm:gap-8">
              <NotificationTab value="all" label="All" />
              <NotificationTab value="unread" label="Unread" count={unread.length} />
              <NotificationTab value="alerts" label="Alerts" />
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <NotificationList
              items={notifications}
              loading={notificationsQuery.isLoading}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <NotificationList
              items={unread}
              loading={notificationsQuery.isLoading}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          </TabsContent>
          <TabsContent value="alerts" className="mt-0">
            <NotificationList
              items={alerts}
              loading={notificationsQuery.isLoading}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
}

function NotificationTab({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent px-0 py-4 text-base font-bold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:py-5 sm:text-lg"
    >
      {label}
      {typeof count === "number" ? (
        <span className="ml-2 rounded-full bg-red-500 px-2.5 py-0.5 text-sm font-extrabold text-white">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

function NotificationList({
  items,
  loading,
  onMarkRead,
}: {
  items: NotificationView[];
  loading: boolean;
  onMarkRead: (id: string) => void;
}) {
  if (loading) {
    return (
      <CardContent className="p-8 text-center text-base font-semibold text-muted-foreground sm:p-12">
        Loading notifications...
      </CardContent>
    );
  }

  if (!items.length) {
    return (
      <CardContent className="grid min-h-56 place-items-center text-center sm:min-h-72">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Bell className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-bold">You're all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">No notifications here.</p>
        </div>
      </CardContent>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((notification) => (
        <li
          key={notification.id}
          className={cn(
            "relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 px-5 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6 sm:px-9 sm:py-7",
            !notification.read && "bg-muted/25",
          )}
        >
          {!notification.read ? (
            <span className="absolute left-2 top-6 h-2.5 w-2.5 rounded-full bg-primary sm:left-3 sm:top-1/2 sm:-translate-y-1/2" />
          ) : null}

          <div
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16",
              toneClass[notification.tone],
            )}
          >
            <notification.icon className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-extrabold text-foreground sm:text-xl">
                {notification.title}
              </p>
              {notification.tone === "destructive" || notification.tone === "accent" ? (
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-500">
                  Alert
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-lg sm:leading-8">
              {notification.desc}
            </p>
            {notification.action ? (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="mt-4 text-base font-extrabold text-primary hover:underline sm:text-lg"
              >
                {notification.action} →
              </button>
            ) : !notification.read ? (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="mt-4 text-sm font-bold text-primary hover:underline"
              >
                Mark as read
              </button>
            ) : null}
          </div>

          <span className="col-start-2 shrink-0 whitespace-nowrap text-sm font-semibold text-muted-foreground sm:col-start-auto sm:text-base">
            {formatTime(notification.time)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function toNotificationView(notification: PortalNotification): NotificationView {
  const documentType = notification.document_type || "";
  const title = notification.subject || notification.type || "Notification";
  const desc =
    [documentType, notification.document_name].filter(Boolean).join(" · ") ||
    "Tenant portal update";

  return {
    id: notification.name,
    title,
    desc,
    time: notification.creation || "Recently",
    action: getAction(documentType),
    icon: getIcon(documentType),
    tone: getTone(documentType),
    read: Boolean(notification.read),
  };
}

function formatTime(value: string) {
  if (!value || value === "Recently") return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getAction(documentType: string) {
  if (documentType.includes("Invoice") || documentType.includes("Payment")) return "Pay Now";
  if (documentType.includes("Maintenance")) return "View Request";
  if (documentType.includes("Contract")) return "View Contract";
  return undefined;
}

function getIcon(documentType: string) {
  if (documentType.includes("Maintenance")) return Wrench;
  if (documentType.includes("Invoice") || documentType.includes("Payment")) return CreditCard;
  if (documentType.includes("Utility") || documentType.includes("Meter")) return Zap;
  if (documentType.includes("Contract")) return FileText;
  return Bell;
}

function getTone(documentType: string): NotificationView["tone"] {
  if (documentType.includes("Maintenance")) return "accent";
  if (documentType.includes("Invoice")) return "destructive";
  if (documentType.includes("Payment")) return "secondary";
  if (documentType.includes("Utility") || documentType.includes("Meter")) return "info";
  if (documentType.includes("Contract")) return "primary";
  return "accent";
}
