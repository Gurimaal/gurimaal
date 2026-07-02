import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Download, Plus, Wallet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/payments")({
  head: () => ({ meta: [{ title: "Payments · Gurimaal" }] }),
  component: PaymentsPage,
});

const timeline = [
  { date: "Jun 3, 2026", desc: "Rent · June", amount: "$1,850.00", method: "Visa •• 4242" },
  { date: "May 5, 2026", desc: "Rent · May", amount: "$1,850.00", method: "Bank transfer" },
  { date: "May 10, 2026", desc: "Utilities · April", amount: "$118.30", method: "Visa •• 4242" },
  { date: "Apr 4, 2026", desc: "Rent · April", amount: "$1,850.00", method: "Visa •• 4242" },
  { date: "Mar 5, 2026", desc: "Rent · March", amount: "$1,800.00", method: "Bank transfer" },
];

const methods = [
  { brand: "Visa", last: "4242", exp: "09/28", primary: true },
  { brand: "Mastercard", last: "8891", exp: "03/27", primary: false },
];

function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="History, receipts, and saved payment methods."
        actions={
          <Button className="gap-2">
            <CreditCard className="h-4 w-4" /> Pay now
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding balance" value="$1,968.40" hint="Due Jul 5" icon={Wallet} tone="destructive" />
        <StatCard label="Paid this year" value="$11,830.00" icon={CheckCircle2} tone="secondary" />
        <StatCard label="Avg monthly" value="$1,972" icon={CreditCard} tone="primary" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Payment history</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border pl-6">
              {timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1.5 grid h-5 w-5 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{t.date}</p>
                      <p className="mt-0.5 truncate font-semibold">{t.desc}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">via {t.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-bold">{t.amount}</p>
                      <Button variant="ghost" size="sm" className="mt-1 h-7 gap-1 text-xs">
                        <Download className="h-3 w-3" /> Receipt
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">Payment methods</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.last}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.3_0.08_258)] p-5 text-primary-foreground shadow-[var(--shadow-pop)]"
              >
                <div className="absolute right-4 top-4 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {m.brand}
                </div>
                <div className="mt-6 font-mono text-lg tracking-widest">
                  •••• •••• •••• {m.last}
                </div>
                <div className="mt-4 flex items-end justify-between text-xs">
                  <div>
                    <p className="opacity-70">Ahmed Hassan</p>
                  </div>
                  <div>
                    <p className="opacity-70">Exp</p>
                    <p className="font-semibold">{m.exp}</p>
                  </div>
                </div>
                {m.primary && (
                  <span className="absolute bottom-3 right-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
