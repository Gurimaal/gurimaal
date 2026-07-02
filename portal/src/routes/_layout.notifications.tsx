import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarClock, CheckCircle2, CreditCard, FileText, Wrench, Zap } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Gurimaal" }] }),
  component: NotificationsPage,
});

type N = {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: typeof Bell;
  tone: "primary" | "secondary" | "accent" | "destructive" | "info";
  read: boolean;
};

const notifications: N[] = [
  { id: "1", title: "Rent due reminder", desc: "July rent of $1,850 is due Jul 5.", time: "2h ago", icon: CalendarClock, tone: "accent", read: false },
  { id: "2", title: "Utility bill ready", desc: "Electricity bill for June: $86.40.", time: "5h ago", icon: Zap, tone: "info", read: false },
  { id: "3", title: "Maintenance update", desc: "Omar K. updated MR-2201 (AC repair).", time: "1d ago", icon: Wrench, tone: "primary", read: false },
  { id: "4", title: "Payment received", desc: "Your June rent payment was received.", time: "3d ago", icon: CreditCard, tone: "secondary", read: true },
  { id: "5", title: "Contract expiring soon", desc: "Your lease ends Mar 14, 2027. Renewal opens Dec 2026.", time: "1w ago", icon: FileText, tone: "destructive", read: true },
];

const toneClass: Record<N["tone"], string> = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  accent: "bg-accent-soft text-accent-foreground",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="All updates about your tenancy in one place."
        actions={
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <Card className="card-elevated">
        <Tabs defaultValue="all">
          <div className="border-b border-border px-4 pt-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">3</span>
              </TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="mt-0">
            <List items={notifications} />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <List items={notifications.filter((n) => !n.read)} />
          </TabsContent>
          <TabsContent value="alerts" className="mt-0">
            <List items={notifications.filter((n) => n.tone === "destructive" || n.tone === "accent")} />
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
}

function List({ items }: { items: N[] }) {
  if (items.length === 0)
    return (
      <CardContent className="p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Bell className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold">You're all caught up</p>
        <p className="text-xs text-muted-foreground">No notifications here.</p>
      </CardContent>
    );
  return (
    <ul className="divide-y divide-border">
      {items.map((n) => (
        <li
          key={n.id}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 p-4 transition-colors hover:bg-muted/40 sm:px-6",
            !n.read && "bg-primary-soft/40",
          )}
        >
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneClass[n.tone])}>
            <n.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{n.title}</p>
              {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{n.desc}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
        </li>
      ))}
    </ul>
  );
}
