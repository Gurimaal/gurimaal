import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Flame, Wifi, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/utilities")({
  head: () => ({ meta: [{ title: "Utility Bills · Gurimaal" }] }),
  component: UtilitiesPage,
});

const seed = (base: number) =>
  Array.from({ length: 8 }, (_, i) => ({
    m: i,
    v: Math.round(base * (0.8 + Math.sin(i / 2) * 0.15 + Math.random() * 0.15)),
  }));

const utils = [
  {
    key: "electricity",
    name: "Electricity",
    unit: "kWh",
    prev: 4820,
    curr: 5210,
    bill: "$86.40",
    limit: 6000,
    icon: Zap,
    tone: "accent",
    color: "var(--color-accent)",
    data: seed(280),
  },
  {
    key: "water",
    name: "Water",
    unit: "gal",
    prev: 1240,
    curr: 1385,
    bill: "$32.10",
    limit: 2000,
    icon: Droplet,
    tone: "info",
    color: "var(--color-info)",
    data: seed(120),
  },
  {
    key: "gas",
    name: "Gas",
    unit: "m³",
    prev: 82,
    curr: 96,
    bill: "$18.70",
    limit: 150,
    icon: Flame,
    tone: "destructive",
    color: "var(--color-destructive)",
    data: seed(45),
  },
  {
    key: "internet",
    name: "Internet",
    unit: "GB",
    prev: 420,
    curr: 512,
    bill: "$45.00",
    limit: 1000,
    icon: Wifi,
    tone: "primary",
    color: "var(--color-primary)",
    data: seed(180),
  },
];

const toneClass: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-foreground",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

function UtilitiesPage() {
  return (
    <>
      <PageHeader
        title="Utility Bills"
        description="Track your consumption and monthly charges."
        actions={<Button variant="outline">Submit meter reading</Button>}
      />

      <section className="grid gap-5 sm:grid-cols-2">
        {utils.map((u) => {
          const consumption = u.curr - u.prev;
          const pct = Math.round((u.curr / u.limit) * 100);
          return (
            <Card key={u.key} className="card-elevated overflow-hidden">
              <CardContent className="p-5">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <div className={cn("grid h-11 w-11 place-items-center rounded-xl", toneClass[u.tone])}>
                    <u.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">Billing cycle · June 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold">{u.bill}</p>
                    <p className="text-xs text-muted-foreground">current bill</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[11px] uppercase text-muted-foreground">Previous</p>
                    <p className="mt-1 font-semibold">{u.prev.toLocaleString()} {u.unit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[11px] uppercase text-muted-foreground">Current</p>
                    <p className="mt-1 font-semibold">{u.curr.toLocaleString()} {u.unit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[11px] uppercase text-muted-foreground">Used</p>
                    <p className="mt-1 font-semibold">{consumption.toLocaleString()} {u.unit}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Monthly allowance</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                <div className="mt-4 h-24">
                  <ResponsiveContainer>
                    <AreaChart data={u.data}>
                      <defs>
                        <linearGradient id={`grad-${u.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={u.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={u.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 10,
                          fontSize: 11,
                        }}
                        labelFormatter={() => ""}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={u.color}
                        strokeWidth={2}
                        fill={`url(#grad-${u.key})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
