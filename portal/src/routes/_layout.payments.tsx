import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Download, Plus, Wallet } from "lucide-react";

import { billingApi, type OutstandingSummary, type Payment } from "@/api/billingApi";
import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/payments")({
  head: () => ({ meta: [{ title: "Payments · Gurimaal" }] }),
  component: PaymentsPage,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value?: number) {
  return currency.format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function PaymentsPage() {
  const [summary, setSummary] = useState<OutstandingSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      setLoading(true);
      setError(null);
      try {
        const [nextSummary, nextPayments] = await Promise.all([
          billingApi.getOutstandingSummary(),
          billingApi.listPayments(50),
        ]);
        if (!mounted) return;
        setSummary(nextSummary);
        setPayments(nextPayments);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load payments.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayments();
    return () => {
      mounted = false;
    };
  }, []);

  const paidThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return payments
      .filter((payment) => {
        if (!payment.posting_date) return false;
        return new Date(payment.posting_date).getFullYear() === year;
      })
      .reduce(
        (total, payment) => total + Number(payment.paid_amount ?? payment.received_amount ?? 0),
        0,
      );
  }, [payments]);

  const averageMonthly = payments.length
    ? paidThisYear / Math.max(new Date().getMonth() + 1, 1)
    : 0;
  const nextDueDate = summary?.invoices?.[0]?.due_date;

  if (loading) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Payments"
        description="History, receipts, and saved payment methods."
        actions={
          <Button asChild className="gap-2">
            <Link to="/billing">
              <CreditCard className="h-4 w-4" /> Pay now
            </Link>
          </Button>
        }
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Outstanding balance"
          value={formatCurrency(summary?.total_outstanding)}
          hint={nextDueDate ? `Due ${formatDate(nextDueDate)}` : "No due date"}
          icon={Wallet}
          tone={summary?.total_outstanding ? "destructive" : "secondary"}
        />
        <StatCard
          label="Paid this year"
          value={formatCurrency(paidThisYear)}
          icon={CheckCircle2}
          tone="secondary"
        />
        <StatCard
          label="Avg monthly"
          value={formatCurrency(averageMonthly)}
          icon={CreditCard}
          tone="primary"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Payment history</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length ? (
              <ol className="relative space-y-4 border-l border-border pl-6">
                {payments.map((payment) => (
                  <li key={payment.name} className="relative">
                    <span className="absolute -left-[27px] top-1.5 grid h-5 w-5 place-items-center rounded-full bg-secondary text-secondary-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card p-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.posting_date)}
                        </p>
                        <p className="mt-0.5 truncate font-semibold">{payment.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {payment.reference_no ? `Ref ${payment.reference_no}` : payment.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-bold">
                          {formatCurrency(payment.paid_amount ?? payment.received_amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-7 gap-1 text-xs"
                          onClick={() =>
                            window.alert(
                              `Receipt for ${payment.name} will be generated from Frappe.`,
                            )
                          }
                        >
                          <Download className="h-3 w-3" /> Receipt
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No payments found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Payment entries from Frappe will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">Payment methods</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() =>
                window.alert(
                  "Saved payment methods will be enabled after payment provider integration.",
                )
              }
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No saved methods</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Saved payment methods will appear after payment provider integration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
