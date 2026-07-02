import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Download, FileText, RefreshCcw, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_layout/contract")({
  head: () => ({ meta: [{ title: "My Contract · Gurimaal" }] }),
  component: ContractPage,
});

const summary = [
  { label: "Start date", value: "Mar 15, 2025", icon: CalendarDays },
  { label: "End date", value: "Mar 14, 2027", icon: CalendarDays },
  { label: "Security deposit", value: "$3,700", icon: ShieldCheck },
  { label: "Monthly rent", value: "$1,850", icon: Wallet },
];

const escalation = [
  { period: "Year 1", rent: "$1,800", change: "Base" },
  { period: "Year 2", rent: "$1,850", change: "+2.8%" },
  { period: "Renewal", rent: "$1,910", change: "+3.2%" },
];

function ContractPage() {
  return (
    <>
      <PageHeader
        title="My Contract"
        description="Summary of your active lease agreement."
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Renew contract
            </Button>
          </>
        }
      />

      <Card className="card-elevated">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="h-4 w-4" />
                {s.label}
              </div>
              <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Escalation schedule</CardTitle>
              <p className="text-xs text-muted-foreground">Annual adjustments per contract</p>
            </div>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {escalation.map((e, i) => (
              <div
                key={e.period}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary text-xs font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.period}</p>
                  <p className="text-xs text-muted-foreground">Effective monthly rent</p>
                </div>
                <span className="font-display text-base font-bold">{e.rent}</span>
                <StatusBadge status={i === 0 ? "paid" : "upcoming"}>{e.change}</StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Contract status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusBadge status="active">Active · 2-year term</StatusBadge>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Time elapsed</span>
                <span className="font-semibold text-foreground">63%</span>
              </div>
              <Progress value={63} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">274 days remaining</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-semibold">Lease_Agreement_2025.pdf</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Signed Mar 12, 2025</p>
              <Button variant="outline" size="sm" className="mt-3 w-full gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
