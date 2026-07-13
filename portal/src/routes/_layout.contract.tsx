import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  RefreshCcw,
  UserRound,
  Building2,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { contractApi, type Contract } from "@/api/contractApi";

export const Route = createFileRoute("/_layout/contract")({
  head: () => ({ meta: [{ title: "My Contract · Gurimaal" }] }),
  component: ContractPage,
});

function ContractPage() {
  const contractQuery = useQuery({
    queryKey: ["current-contract"],
    queryFn: contractApi.getCurrentContract,
  });
  const renewalMutation = useMutation({
    mutationFn: () =>
      contractApi.requestRenewal("Tenant requested contract renewal from the portal."),
  });

  const contract = contractQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Contract"
        description="Summary of your active lease agreement."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 gap-3 rounded-xl border-primary px-6 text-base font-bold text-primary"
              disabled={!contract}
            >
              <Link to="/documents">
                <Download className="h-5 w-5" />
                Download PDF
              </Link>
            </Button>
            <Button
              className="h-12 gap-3 rounded-xl px-6 text-base font-bold"
              disabled={!contract || renewalMutation.isPending}
              onClick={() => renewalMutation.mutate()}
            >
              <RefreshCcw className="h-5 w-5" />
              {renewalMutation.isPending ? "Sending..." : "Renew Contract"}
            </Button>
          </div>
        }
      />

      {contractQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {contractQuery.error.message}
        </p>
      ) : null}

      {renewalMutation.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {renewalMutation.error.message}
        </p>
      ) : null}

      {renewalMutation.data ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary-soft p-3 text-sm font-semibold text-secondary">
          Renewal request sent for {renewalMutation.data.contract}.
        </p>
      ) : null}

      {contractQuery.isLoading ? (
        <Card className="card-elevated p-6 text-sm text-muted-foreground">
          Loading contract details...
        </Card>
      ) : !contract ? (
        <Card className="card-elevated p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">No active contract found</p>
          <p className="text-xs text-muted-foreground">
            Your lease summary will appear after an active contract is linked.
          </p>
        </Card>
      ) : (
        <ContractContent
          contract={contract}
          onRenew={() => renewalMutation.mutate()}
          renewing={renewalMutation.isPending}
        />
      )}
    </div>
  );
}

function ContractContent({
  contract,
  onRenew,
  renewing,
}: {
  contract: Contract;
  onRenew: () => void;
  renewing: boolean;
}) {
  const progress = getContractProgress(contract);
  const duration = getDurationMonths(contract);
  const renewalWindowDays = 25;
  const propertyUnit = contract.rental_property
    ? `${contract.rental_property} - Unit ${contract.rental_unit || "-"}`
    : `Unit ${contract.rental_unit || "-"}`;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.95fr)]">
      <div className="space-y-8">
        <Card className="card-elevated">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-4 py-2 text-sm font-black text-secondary">
                  <RefreshCcw className="h-4 w-4" />
                  {contract.status === "Active" ? "Active Lease" : contract.status || "Lease"}
                </span>
                <h2 className="mt-7 font-display text-3xl font-black tracking-tight">
                  Residential Lease Agreement
                </h2>
                <p className="mt-3 text-base font-medium text-muted-foreground">
                  Contract ID: {contract.name}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-base font-medium text-muted-foreground">Monthly Rent</p>
                <p className="mt-3 break-words font-display text-3xl font-black tracking-tight text-primary sm:text-5xl">
                  {formatMoney(contract.monthly_rent || 0)}
                </p>
              </div>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <SummaryTile
                icon={CalendarDays}
                label="Start Date"
                value={formatDate(contract.contract_start_date)}
              />
              <SummaryTile
                icon={CalendarDays}
                label="End Date"
                value={formatDate(contract.contract_end_date)}
              />
              <SummaryTile
                icon={Clock3}
                label="Remaining"
                value={`${progress.daysRemaining} days`}
              />
              <SummaryTile
                icon={FileText}
                label="Security Deposit"
                value={formatMoney(contract.security_deposit_amount || 0)}
              />
              <SummaryTile
                icon={CalendarDays}
                label="Lease Duration"
                value={`${duration} Months`}
              />
              <SummaryTile icon={RefreshCcw} label="Renewal Status" value="Not Requested" />
            </div>

            <div className="mt-9 grid gap-5 lg:grid-cols-2">
              <DetailTile icon={UserRound} label="Tenant Name" value={contract.tenant || "-"} />
              <DetailTile icon={Building2} label="Property / Unit" value={propertyUnit} />
              <DetailTile
                icon={FileText}
                label="Signed Date"
                value={formatLongDate(contract.contract_start_date)}
              />
              <DetailTile icon={FileText} label="Contract Type" value="Fixed-Term Lease" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="p-5 pb-3 sm:p-8 sm:pb-3">
            <CardTitle className="text-xl font-black">Lease Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 sm:p-8 sm:pt-2">
            <div className="relative space-y-10 pl-12 before:absolute before:left-5 before:top-4 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-border">
              <TimelineItem
                state="done"
                title="Contract Started"
                date={formatLongDate(contract.contract_start_date)}
                description="Lease agreement signed and activated"
              />
              <TimelineItem
                state="done"
                title="Mid-Lease Review"
                date={formatLongDate(getMidpointDate(contract))}
                description="Optional lease review point"
              />
              <TimelineItem
                state="current"
                title="Today"
                date={formatLongDate(new Date())}
                description={`${progress.percent}% of lease completed, ${progress.daysRemaining} days remaining`}
              />
              <TimelineItem
                state="upcoming"
                title="Renewal Window Opens"
                date={formatLongDate(getRenewalDate(contract, renewalWindowDays))}
                description="You can request contract renewal from this date"
              />
              <TimelineItem
                state="upcoming"
                title="Contract Ends"
                date={formatLongDate(contract.contract_end_date)}
                description="Lease agreement expires"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="card-elevated">
          <CardContent className="p-5 sm:p-8">
            <h3 className="text-xl font-black">Lease Progress</h3>
            <Progress value={progress.percent} className="mt-7 h-3 bg-muted" />
            <div className="mt-5 flex items-center justify-between text-base">
              <span className="text-muted-foreground">{progress.percent}% complete</span>
              <span className="font-black text-primary">{progress.daysRemaining} days left</span>
            </div>
            <div className="mt-7 flex gap-3 rounded-xl bg-accent-soft p-5 text-accent-foreground">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-base leading-7">
                Renewal window opens in <strong>{renewalWindowDays} days</strong>. Request early to
                ensure continuity.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="p-5 pb-3 sm:p-8 sm:pb-3">
            <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-2 sm:p-8 sm:pt-2">
            <ActionButton icon={Download} label="Download PDF" to="/documents" />
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full justify-between rounded-xl bg-muted/40 px-5 text-base font-bold"
              disabled={renewing}
              onClick={onRenew}
            >
              <span className="inline-flex items-center gap-3">
                <RefreshCcw className="h-5 w-5 text-primary" />
                {renewing ? "Sending Renewal..." : "Request Renewal"}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
            <ActionButton icon={FileText} label="View Payment History" to="/billing" />
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-border bg-transparent shadow-none">
          <CardContent className="p-5 text-center sm:p-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-6 text-lg font-black text-muted-foreground">
              Lease Agreement 2023.pdf
            </p>
            <p className="mt-2 text-base text-muted-foreground">Signed · 2.4 MB</p>
            <Button
              asChild
              variant="outline"
              className="mt-7 h-14 w-full gap-3 rounded-xl border-primary bg-primary-soft text-base font-black text-primary"
            >
              <Link to="/documents">
                <Download className="h-5 w-5" />
                Download
              </Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <p className="flex items-center gap-3 text-sm font-black uppercase tracking-wider text-muted-foreground">
        <Icon className="h-5 w-5 text-primary" />
        {label}
      </p>
      <p className="mt-5 text-xl font-black">{value}</p>
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border p-6">
      <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-black text-muted-foreground">{label}</p>
        <p className="mt-2 text-base font-black leading-7">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof Download;
  label: string;
  to: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-14 w-full justify-between rounded-xl bg-muted/40 px-5 text-base font-bold"
    >
      <Link to={to}>
        <span className="inline-flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          {label}
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </Button>
  );
}

function TimelineItem({
  state,
  title,
  date,
  description,
}: {
  state: "done" | "current" | "upcoming";
  title: string;
  date: string;
  description: string;
}) {
  const markerClass =
    state === "done"
      ? "bg-secondary text-secondary-foreground"
      : state === "current"
        ? "bg-primary text-primary-foreground ring-8 ring-primary/12"
        : "bg-muted text-muted-foreground";

  return (
    <div className="relative">
      <div
        className={`absolute -left-[3.2rem] top-1 grid h-8 w-8 place-items-center rounded-full ${markerClass}`}
      >
        {state === "upcoming" ? null : <RefreshCcw className="h-4 w-4" />}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-black">{title}</h3>
        {state === "current" ? (
          <span className="rounded-full bg-primary-soft px-4 py-1 text-sm font-black text-primary">
            Current
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-base font-semibold text-muted-foreground">{date}</p>
      <p className="mt-3 text-base text-muted-foreground">{description}</p>
    </div>
  );
}

function getContractProgress(contract?: Contract | null) {
  if (!contract?.contract_start_date || !contract.contract_end_date) {
    return { percent: 0, daysRemaining: 0 };
  }

  const start = new Date(contract.contract_start_date).getTime();
  const end = new Date(contract.contract_end_date).getTime();
  const now = Date.now();
  const total = Math.max(end - start, 1);
  const elapsed = Math.max(0, Math.min(now - start, total));
  const daysRemaining = Math.max(0, Math.ceil((end - now) / 86400000));

  return {
    percent: Math.round((elapsed / total) * 100),
    daysRemaining,
  };
}

function getDurationMonths(contract: Contract) {
  if (!contract.contract_start_date || !contract.contract_end_date) return 0;
  const start = new Date(contract.contract_start_date);
  const end = new Date(contract.contract_end_date);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (30 * 86400000)));
}

function getMidpointDate(contract: Contract) {
  if (!contract.contract_start_date || !contract.contract_end_date) return new Date();
  const start = new Date(contract.contract_start_date).getTime();
  const end = new Date(contract.contract_end_date).getTime();
  return new Date(start + (end - start) / 2);
}

function getRenewalDate(contract: Contract, daysBeforeEnd: number) {
  if (!contract.contract_end_date) return new Date();
  const end = new Date(contract.contract_end_date);
  end.setDate(end.getDate() - daysBeforeEnd);
  return end;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value?: string | Date) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatLongDate(value?: string | Date) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
