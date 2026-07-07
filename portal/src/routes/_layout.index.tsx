import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Home,
  Phone,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageSkeleton } from "@/components/PageSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardApi, type DashboardActivity, type DashboardSummary } from "@/api/dashboardApi";

export const Route = createFileRoute("/_layout/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Gurimaal" },
      {
        name: "description",
        content: "Your tenant dashboard: rent, utilities, and requests at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.summary,
  });

  if (summaryQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (summaryQuery.error) {
    return (
      <Card className="card-elevated p-6">
        <p className="text-sm text-destructive">{summaryQuery.error.message}</p>
      </Card>
    );
  }

  const summary = summaryQuery.data;
  if (!summary) {
    return (
      <Card className="card-elevated p-10 text-center">
        <Home className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold">No dashboard data yet</p>
        <p className="text-xs text-muted-foreground">
          Your portal summary will appear once your tenant profile is linked.
        </p>
      </Card>
    );
  }

  const tenantName = summary.tenant_name || summary.tenant?.tenant_name || "Tenant";
  const firstName = tenantName.split(/\s+/)[0] || tenantName;
  const unitLabel =
    summary.property?.unit?.unit_no || summary.unit || summary.contract?.rental_unit || "-";
  const floorLabel = summary.property?.floor?.floor_name || summary.property?.floor?.floor_number;
  const buildingLabel =
    summary.property?.building?.building_name || summary.property?.project?.project_name || "-";
  const leaseProgress = getLeaseProgress(summary.contract);
  const rent = summary.monthly_rent || summary.contract?.monthly_rent || 0;
  const outstanding = summary.outstanding_balance || summary.billing?.outstanding_amount || 0;
  const utilities = summary.utility_balance || summary.utilities?.current_amount || 0;
  const requestCount =
    summary.pending_maintenance_count || summary.counts?.open_maintenance_requests || 0;
  const paymentHistory = buildPaymentHistory(summary.billing?.payment_history || [], rent);
  const utilityData = buildUtilityData(summary.utilities?.recent_readings || []);
  const activities = buildActivities(summary.recent_activity || [], summary);

  return (
    <div className="space-y-5">
      <section className="pt-1">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-muted-foreground sm:text-base">
            {formatLongDate(new Date())}
          </p>
          <h1 className="mt-3 font-display text-3xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-muted-foreground sm:text-lg sm:leading-7">
            Here's a quick look at your apartment, upcoming payments, and open requests.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
          <HeroAction to="/billing" icon={CreditCard} label="Pay Rent" primary />
          <HeroAction to="/maintenance" icon={Wrench} label="New Request" />
          <HeroAction to="/utilities" icon={Zap} label="Utilities" />
          <HeroAction to="/requests" icon={Phone} label="Contact Manager" />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CreditCard}
          value={formatMoney(rent)}
          label="Current Rent"
          badge="+0%"
          tone="primary"
        />
        <StatCard
          icon={Zap}
          value={formatMoney(utilities)}
          label="Utilities"
          badge="+12%"
          tone="secondary"
        />
        <StatCard
          icon={Wrench}
          value={String(requestCount)}
          label="Open Requests"
          badge={`-${Math.max(0, 3 - requestCount)}`}
          tone="accent"
        />
        <StatCard
          icon={FileText}
          value={summary.contract?.status || "No Lease"}
          label="Lease Status"
          badge={summary.contract ? `${leaseProgress.daysRemaining} days left` : "Pending"}
          tone="success"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,0.95fr)]">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <div>
              <CardTitle className="text-base font-black">Rent Payment History</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Last 6 months</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link to="/billing">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-4 sm:p-6 sm:pt-4">
            <div className="h-44 sm:h-52">
              <ResponsiveContainer>
                <BarChart data={paymentHistory}>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <div>
              <CardTitle className="text-base font-black">Monthly Utility Usage</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Water & Electricity (USD)</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link to="/utilities">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-4 sm:p-6 sm:pt-4">
            <div className="h-44 sm:h-52">
              <ResponsiveContainer>
                <AreaChart data={utilityData}>
                  <defs>
                    <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="electricFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="water"
                    stroke="var(--color-secondary)"
                    strokeWidth={2.5}
                    fill="url(#waterFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="electric"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#electricFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="card-elevated">
            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <CalendarDays className="h-5 w-5 text-primary" />
                Lease Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-2 sm:p-6 sm:pt-2">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
                <span>{summary.contract?.contract_start_date || "-"}</span>
                <span>{summary.contract?.contract_end_date || "-"}</span>
              </div>
              <Progress value={leaseProgress.percent} className="h-2" />
              <p className="text-center text-sm font-semibold text-primary">
                {leaseProgress.percent}% complete · {leaseProgress.daysRemaining} days remaining
              </p>
              <div className="border-t pt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Renewal window: {summary.contract?.contract_end_date || "Pending"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                    {getInitials(tenantName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{tenantName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Tenant ID: {summary.tenant?.name || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-secondary" />
                  Unit {unitLabel}
                  {floorLabel ? `, ${floorLabel}` : ""}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  {outstanding > 0 ? "Payment Due" : "Good Standing"}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="mt-6 w-full justify-center gap-1 text-primary"
              >
                <Link to="/profile">
                  View Profile <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base font-black">Recent Activity</CardTitle>
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-5 sm:px-6">
            {activities.map((activity, index) => (
              <ActivityRow
                key={activity.key}
                activity={activity}
                showBorder={index < activities.length - 1}
              />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HeroAction({
  to,
  icon: Icon,
  label,
  primary = false,
}: {
  to: string;
  icon: typeof CreditCard;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className={`h-12 w-full justify-center gap-3 rounded-xl px-5 text-sm font-black shadow-[var(--shadow-button)] sm:h-14 sm:w-auto sm:min-w-44 sm:px-6 sm:text-base ${
        primary
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/92 hover:text-primary-foreground"
          : "border-border bg-card text-primary hover:bg-primary-soft hover:text-primary"
      }`}
    >
      <Link to={to}>
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  badge,
  tone,
}: {
  icon: typeof CreditCard;
  value: string;
  label: string;
  badge: string;
  tone: "primary" | "secondary" | "accent" | "success";
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent-foreground",
    success: "bg-secondary-soft text-secondary",
  }[tone];

  return (
    <Card className="card-elevated">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div
            className={`grid h-11 w-11 place-items-center rounded-xl sm:h-12 sm:w-12 ${toneClass}`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground sm:px-4 sm:py-1.5 sm:text-sm">
            {badge}
          </span>
        </div>
        <p className="mt-5 break-words font-display text-2xl font-black tracking-tight sm:mt-6 sm:text-3xl">
          {value}
        </p>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground sm:mt-2 sm:text-base">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  activity,
  showBorder,
}: {
  activity: ReturnType<typeof buildActivities>[number];
  showBorder: boolean;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent-foreground",
    success: "bg-secondary-soft text-secondary",
  }[activity.tone];

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 ${showBorder ? "border-b" : ""}`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
        <activity.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold sm:text-base">{activity.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{activity.meta}</p>
      </div>
      <span className="col-start-2 text-xs font-medium text-muted-foreground sm:col-start-auto sm:text-sm">
        {activity.time}
      </span>
    </div>
  );
}

function buildActivities(rows: DashboardActivity[], summary: DashboardSummary) {
  const mapped = rows.slice(0, 4).map((row) => {
    if (row.type === "maintenance") {
      return {
        key: `${row.type}-${row.name}`,
        title: "Maintenance request updated",
        meta: `${row.description || row.name} - ${row.status || "Open"}`,
        time: "Recently",
        tone: "accent" as const,
        icon: Wrench,
      };
    }

    return {
      key: `${row.type}-${row.name}`,
      title: "Utility bill generated",
      meta: `${row.service_type || row.name} - ${row.status || "Updated"}`,
      time: "Recently",
      tone: "secondary" as const,
      icon: Zap,
    };
  });

  return [
    {
      key: "rent-status",
      title:
        (summary.billing?.outstanding_amount || 0) > 0
          ? "Rent payment due"
          : "Rent account current",
      meta:
        (summary.billing?.outstanding_amount || 0) > 0
          ? `Outstanding - ${formatMoney(summary.billing?.outstanding_amount || 0)}`
          : "No outstanding balance",
      time: "Today",
      tone: "success" as const,
      icon: CheckCircle2,
    },
    ...mapped,
    {
      key: "contract-reminder",
      title: "Contract renewal reminder",
      meta: summary.contract?.contract_end_date
        ? `Lease expires on ${summary.contract.contract_end_date}`
        : "No active contract linked",
      time: "This week",
      tone: "primary" as const,
      icon: FileText,
    },
  ].slice(0, 4);
}

function buildUtilityData(readings: NonNullable<DashboardSummary["utilities"]>["recent_readings"]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const rows = (readings || []).slice(-6);

  if (!rows.length) {
    return months.map((m, index) => ({
      m,
      water: [120, 134, 98, 112, 128, 148][index],
      electric: [45, 38, 52, 41, 48, 56][index],
    }));
  }

  return rows.map((reading, index) => ({
    m: months[index % months.length],
    water: Number(reading.total_amount || 0) * 4,
    electric: Number(reading.consumption || 0),
  }));
}

function buildPaymentHistory(
  payments: NonNullable<DashboardSummary["billing"]>["payment_history"],
  rent: number,
) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const rows = (payments || []).slice(-7);

  if (!rows.length) {
    return months.map((m, index) => ({
      m,
      amount: index < 6 ? rent || 0 : 0,
    }));
  }

  return months.map((m, index) => ({
    m,
    amount: Number(
      rows[index]?.paid_amount || rows[index]?.received_amount || (index < 6 ? rent : 0),
    ),
  }));
}

function getLeaseProgress(contract?: DashboardSummary["contract"]) {
  if (!contract?.contract_start_date || !contract.contract_end_date) {
    return { percent: 0, daysRemaining: 0 };
  }

  const start = new Date(contract.contract_start_date).getTime();
  const end = new Date(contract.contract_end_date).getTime();
  const now = Date.now();
  const total = Math.max(end - start, 1);
  const elapsed = Math.max(0, Math.min(now - start, total));

  return {
    percent: Math.round((elapsed / total) * 100),
    daysRemaining: Math.max(0, Math.ceil((end - now) / 86400000)),
  };
}

type ChartTooltipItem = {
  dataKey: string;
  name?: string;
  value?: number | string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-muted-foreground">
          {item.name || item.dataKey}: {Number(item.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
