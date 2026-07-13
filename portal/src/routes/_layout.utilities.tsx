import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Droplets, Gauge, TrendingUp, Wifi, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { utilityApi, type MeterReading, type UtilityServiceRequest } from "@/api/utilityApi";

export const Route = createFileRoute("/_layout/utilities")({
  head: () => ({ meta: [{ title: "Utility Bills · Gurimaal" }] }),
  component: UtilitiesPage,
});

function UtilitiesPage() {
  const readingsQuery = useQuery({
    queryKey: ["meter-readings"],
    queryFn: () => utilityApi.utilityHistory(100),
  });
  const currentUsageQuery = useQuery({
    queryKey: ["utility-current-usage"],
    queryFn: utilityApi.currentUsage,
  });
  const latestBillQuery = useQuery({
    queryKey: ["utility-latest-bill"],
    queryFn: utilityApi.latestBill,
  });
  const servicesQuery = useQuery({
    queryKey: ["utility-service-requests"],
    queryFn: () => utilityApi.listServiceRequests(50),
  });

  const readings = readingsQuery.data ?? [];
  const latestReading = latestBillQuery.data?.reading ?? readings.at(-1);
  const currentBill =
    latestBillQuery.data?.invoice?.grand_total ||
    latestBillQuery.data?.reading.total_amount ||
    currentUsageQuery.data?.total_amount ||
    0;
  const electricity = latestReading?.consumption || currentUsageQuery.data?.total_consumption || 0;
  const water = getWaterEquivalent(electricity);
  const trend = getTrend(readings);
  const chartData = buildUsageData(readings);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Utility Bills"
        description="Track your consumption and monthly charges."
        actions={
          <Button asChild className="h-12 gap-3 rounded-xl px-6 text-base font-bold">
            <Link to="/maintenance">
              <Zap className="h-5 w-5" />
              Submit Meter Reading
            </Link>
          </Button>
        }
      />

      {readingsQuery.error ||
      currentUsageQuery.error ||
      latestBillQuery.error ||
      servicesQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {readingsQuery.error?.message ||
            currentUsageQuery.error?.message ||
            latestBillQuery.error?.message ||
            servicesQuery.error?.message}
        </p>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <UtilityStatCard
          icon={Zap}
          tone="warning"
          value={formatMoney(currentBill)}
          label="Current Bill"
          hint={formatMonth(latestReading?.reading_date)}
        />
        <UtilityStatCard
          icon={Zap}
          tone="primary"
          value={`${formatNumber(electricity)} kWh`}
          label="Electricity"
          hint="Last reading"
        />
        <UtilityStatCard
          icon={Droplets}
          tone="success"
          value={`${formatNumber(water)} m3`}
          label="Water"
          hint="Last reading"
        />
        <UtilityStatCard
          icon={TrendingUp}
          tone="danger"
          value={`${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`}
          label="Trend"
          hint="vs last month"
        />
      </section>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-0 sm:p-8 sm:pb-0">
          <div>
            <CardTitle className="text-xl font-black">Usage History</CardTitle>
            <p className="mt-3 text-base text-muted-foreground">
              Electricity (kWh) & Water (m3) - Last 6 months
            </p>
          </div>
          <div className="hidden items-center gap-8 text-base text-muted-foreground sm:flex">
            <Legend color="var(--color-primary)" label="Electricity" />
            <Legend color="var(--color-secondary)" label="Water" />
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <div className="h-60 sm:h-80">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="electricityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={14} />
                <YAxis axisLine={false} tickLine={false} fontSize={14} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="electricity"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#electricityFill)"
                />
                <Area
                  type="monotone"
                  dataKey="water"
                  stroke="var(--color-secondary)"
                  strokeWidth={3}
                  fill="url(#waterFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden">
        <CardHeader className="p-5 sm:p-8">
          <CardTitle className="text-xl font-black">Meter Reading History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MeterReadingTable rows={readings.slice().reverse()} loading={readingsQuery.isLoading} />
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="p-5 pb-3 sm:p-8 sm:pb-3">
          <CardTitle className="text-xl font-black">Utility Service Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 pt-2 sm:p-8 sm:pt-2 lg:grid-cols-3">
          {buildServiceCards(servicesQuery.data ?? [], latestReading).map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function UtilityStatCard({
  icon: Icon,
  tone,
  value,
  label,
  hint,
}: {
  icon: typeof Zap;
  tone: "warning" | "primary" | "success" | "danger";
  value: string;
  label: string;
  hint: string;
}) {
  const toneClass = {
    warning: "bg-accent-soft text-accent-foreground",
    primary: "bg-primary-soft text-primary",
    success: "bg-secondary-soft text-secondary",
    danger: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <Card className="card-elevated">
      <CardContent className="p-5 sm:p-8">
        <div
          className={`grid h-12 w-12 place-items-center rounded-xl sm:h-16 sm:w-16 ${toneClass}`}
        >
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <p className="mt-6 break-words font-display text-3xl font-black tracking-tight sm:mt-8 sm:text-4xl">
          {value}
        </p>
        <p className="mt-2 text-base font-black sm:mt-3 sm:text-lg">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{hint}</p>
      </CardContent>
    </Card>
  );
}

function MeterReadingTable({ rows, loading }: { rows: MeterReading[]; loading: boolean }) {
  if (loading) return <EmptyState label="Loading meter readings..." />;
  if (!rows.length) return <EmptyState label="No meter readings yet" />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-y bg-muted/20">
            <TableHead className="px-8 py-5 text-sm font-black uppercase text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Reading (kWh)
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Consumption
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Bill Amount
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((reading) => (
            <TableRow key={reading.name} className="border-b">
              <TableCell className="px-8 py-6 text-base font-black">
                {formatDate(reading.reading_date)}
              </TableCell>
              <TableCell className="py-6 font-mono text-base font-black">
                {formatNumber(reading.current_reading || 0)}
              </TableCell>
              <TableCell className="py-6 text-base text-muted-foreground">
                {formatNumber(reading.consumption || 0)} kWh
              </TableCell>
              <TableCell className="py-6 text-lg font-black">
                {formatMoney(reading.total_amount || 0)}
              </TableCell>
              <TableCell className="py-6">
                <StatusPill status={reading.status || "Draft"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ServiceCard({
  service,
}: {
  service: {
    name: string;
    provider: string;
    meter: string;
    status: string;
    icon: typeof Zap;
  };
}) {
  return (
    <div className="flex items-center gap-5 rounded-xl border p-6">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-secondary-soft text-secondary">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-black">{service.name}</p>
        <p className="mt-1 truncate text-base text-muted-foreground">{service.provider}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">Meter: {service.meter}</p>
      </div>
      <span className="rounded-full bg-secondary-soft px-4 py-1.5 text-sm font-black text-secondary">
        {service.status}
      </span>
    </div>
  );
}

function buildUsageData(readings: MeterReading[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const rows = readings.slice(-6);

  if (!rows.length) {
    return months.map((month) => ({ month, electricity: 0, water: 0 }));
  }

  return rows.map((reading) => ({
    month: formatShortMonth(reading.reading_date),
    electricity: Number(reading.consumption || 0),
    water: getWaterEquivalent(Number(reading.consumption || 0)),
  }));
}

function buildUtilityCards(readings: MeterReading[]) {
  return buildUsageData(readings);
}

function buildServiceCards(services: UtilityServiceRequest[], latestReading?: MeterReading) {
  if (services.length) {
    return services.slice(0, 3).map((service) => ({
      name: service.service_type || "Utility",
      provider: service.customer || "Gurimaal Utility",
      meter: latestReading?.meter_serial_no || "N/A",
      status: service.status || "Active",
      icon: Zap,
    }));
  }

  return [
    {
      name: "Electricity",
      provider: "Utility Provider",
      meter: latestReading?.meter_serial_no || "N/A",
      status: "Active",
      icon: Zap,
    },
    {
      name: "Water",
      provider: "Utility Provider",
      meter: latestReading?.meter_serial_no || "N/A",
      status: "Active",
      icon: Droplets,
    },
    {
      name: "Internet",
      provider: "Utility Provider",
      meter: "N/A",
      status: "Active",
      icon: Wifi,
    },
  ];
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const paid = normalized.includes("paid") || normalized.includes("invoiced");
  return (
    <span
      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-black ${
        paid ? "bg-secondary-soft text-secondary" : "bg-accent-soft text-accent-foreground"
      }`}
    >
      {paid ? "Paid" : status}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1 w-5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Gauge className="h-6 w-6" />
      </div>
      <p className="mt-4 text-base font-black">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Utility usage will appear after readings are recorded.
      </p>
    </div>
  );
}

function getTrend(readings: MeterReading[]) {
  if (readings.length < 2) return 0;
  const latest = Number(readings.at(-1)?.consumption || 0);
  const previous = Number(readings.at(-2)?.consumption || 0);
  if (!previous) return 0;
  return ((latest - previous) / previous) * 100;
}

function getWaterEquivalent(value: number) {
  return Number((Number(value || 0) * 0.06).toFixed(1));
}

function formatMonth(value?: string) {
  if (!value) return "No readings yet";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(value),
  );
}

function formatShortMonth(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(value));
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
