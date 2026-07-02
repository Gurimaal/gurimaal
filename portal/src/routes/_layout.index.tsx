import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CreditCard,
  Download,
  FileText,
  MessageCircle,
  Wallet,
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

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_layout/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Gurimaal" },
      { name: "description", content: "Your tenant dashboard: rent, utilities, and requests at a glance." },
    ],
  }),
  component: Dashboard,
});

const utilityData = [
  { m: "Jan", electricity: 240, water: 90, gas: 40 },
  { m: "Feb", electricity: 210, water: 85, gas: 45 },
  { m: "Mar", electricity: 260, water: 100, gas: 38 },
  { m: "Apr", electricity: 300, water: 110, gas: 42 },
  { m: "May", electricity: 340, water: 120, gas: 46 },
  { m: "Jun", electricity: 380, water: 130, gas: 50 },
];

const paymentHistory = [
  { m: "Jan", amount: 1800 },
  { m: "Feb", amount: 1800 },
  { m: "Mar", amount: 1800 },
  { m: "Apr", amount: 1850 },
  { m: "May", amount: 1850 },
  { m: "Jun", amount: 1850 },
];

const activities = [
  { title: "Payment received", meta: "Jun rent · $1,850", time: "2 days ago", tone: "secondary" as const, icon: Wallet },
  { title: "Maintenance update", meta: "AC repair · in progress", time: "3 days ago", tone: "info" as const, icon: Wrench },
  { title: "Utility bill ready", meta: "Electricity · $86.40", time: "5 days ago", tone: "accent" as const, icon: Zap },
  { title: "Invoice issued", meta: "INV-2026-072", time: "1 week ago", tone: "primary" as const, icon: FileText },
];

function Dashboard() {
  return (
    <>
      {/* Welcome hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.08_258)] p-6 text-primary-foreground shadow-[var(--shadow-pop)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="text-sm/6 text-primary-foreground/70">Wednesday, July 1</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Hello Ahmed, welcome back.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
              Here's a quick look at your apartment, upcoming payments, and open requests.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { k: "Apartment", v: "Unit 12B" },
                { k: "Monthly rent", v: "$1,850" },
                { k: "Outstanding", v: "$86.40" },
                { k: "Next due", v: "Jul 5" },
                { k: "Lease ends", v: "Mar 2027" },
                { k: "Utilities", v: "$142" },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-wide text-primary-foreground/70">
                    {item.k}
                  </div>
                  <div className="mt-0.5 font-display text-base font-semibold">
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
              Quick actions
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: "Pay rent", icon: CreditCard, to: "/billing" },
                { label: "New request", icon: Wrench, to: "/maintenance" },
                { label: "View utilities", icon: Zap, to: "/utilities" },
                { label: "Download invoice", icon: Download, to: "/documents" },
              ].map((a) => (
                <Button
                  key={a.label}
                  asChild
                  variant="secondary"
                  className="h-auto justify-start gap-2 rounded-lg bg-white text-primary hover:bg-white/90"
                >
                  <Link to={a.to}>
                    <a.icon className="h-4 w-4" />
                    <span className="truncate">{a.label}</span>
                  </Link>
                </Button>
              ))}
              <Button
                asChild
                variant="ghost"
                className="col-span-2 h-auto justify-start gap-2 rounded-lg text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/requests">
                  <MessageCircle className="h-4 w-4" />
                  Contact property manager
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current rent" value="$1,850" hint="Due Jul 5" icon={Wallet} tone="primary" />
        <StatCard label="Utilities" value="$142.20" hint="Jun consumption" icon={Zap} tone="accent" />
        <StatCard label="Pending requests" value="2" hint="1 in progress" icon={Wrench} tone="info" />
        <StatCard label="Lease status" value="Active" hint="9 months left" icon={CalendarDays} tone="secondary" />
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Monthly utility usage</CardTitle>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <LegendDot color="var(--color-chart-1)" label="Electricity" />
              <LegendDot color="var(--color-chart-4)" label="Water" />
              <LegendDot color="var(--color-chart-3)" label="Gas" />
            </div>
          </CardHeader>
          <CardContent className="pl-1">
            <div className="h-[260px] w-full">
              <ResponsiveContainer>
                <BarChart data={utilityData} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="m" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="electricity" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="water" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="gas" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Rent payment history</CardTitle>
            <p className="text-xs text-muted-foreground">Paid on time · 100%</p>
          </CardHeader>
          <CardContent className="pl-1">
            <div className="h-[260px] w-full">
              <ResponsiveContainer>
                <AreaChart data={paymentHistory}>
                  <defs>
                    <linearGradient id="rentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="m" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    fill="url(#rentFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Lease progress + activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
              <p className="text-xs text-muted-foreground">Updates from your account</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/notifications">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a) => {
              const toneMap: Record<string, string> = {
                primary: "bg-primary-soft text-primary",
                secondary: "bg-secondary-soft text-secondary",
                accent: "bg-accent-soft text-accent-foreground",
                info: "bg-info/10 text-info",
              };
              return (
                <div
                  key={a.title}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneMap[a.tone]}`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Lease progress</CardTitle>
            <p className="text-xs text-muted-foreground">Mar 2025 – Mar 2027</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Elapsed</span>
                <span className="font-semibold text-foreground">63%</span>
              </div>
              <Progress value={63} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Next payment</p>
                <p className="mt-1 font-display text-base font-bold">Jul 5</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Renewal</p>
                <p className="mt-1 font-display text-base font-bold">Mar 2027</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary-soft p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">SM</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-secondary">Sarah Malik</p>
                <p className="truncate text-xs text-secondary/80">Property Manager</p>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto text-secondary hover:bg-secondary/10">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="truncate">Skyline Tower · Downtown District</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="active">Lease active</StatusBadge>
              <StatusBadge status="paid">Rent current</StatusBadge>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
