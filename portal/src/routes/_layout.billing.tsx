import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  Filter,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { billingApi, type Invoice, type InvoiceDetail, type Payment } from "@/api/billingApi";

export const Route = createFileRoute("/_layout/billing")({
  head: () => ({ meta: [{ title: "Billing · Gurimaal" }] }),
  component: BillingPage,
});

type InvoiceTab = "all" | "outstanding" | "paid" | "upcoming";

function BillingPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<InvoiceTab>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Card");

  const invoicesQuery = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: () => billingApi.listInvoices(100),
  });
  const paymentsQuery = useQuery({
    queryKey: ["billing-payments"],
    queryFn: () => billingApi.listPayments(50),
  });
  const outstandingQuery = useQuery({
    queryKey: ["billing-outstanding"],
    queryFn: billingApi.getOutstandingSummary,
  });
  const invoiceDetailQuery = useQuery({
    queryKey: ["billing-invoice-detail", selectedInvoice],
    enabled: Boolean(selectedInvoice),
    queryFn: () => billingApi.getInvoice(selectedInvoice as string),
  });

  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const payments = paymentsQuery.data ?? [];
  const payableInvoices = invoices.filter((invoice) => normalizeInvoiceStatus(invoice) !== "paid");
  const defaultPaymentInvoice = payableInvoices[0] ?? invoices[0] ?? null;

  const searchedInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((invoice) =>
      [
        invoice.name,
        invoice.status,
        invoice.due_date,
        invoice.posting_date,
        getInvoiceDescription(invoice),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [invoices, search]);

  const tabbedInvoices = filterInvoicesByTab(searchedInvoices, activeTab);
  const counts = getCounts(invoices);
  const paidYearToDate = payments.reduce(
    (total, payment) => total + Number(payment.paid_amount || payment.received_amount || 0),
    0,
  );
  const nextDueInvoice =
    payableInvoices
      .slice()
      .sort((a, b) => String(a.due_date || "").localeCompare(String(b.due_date || "")))[0] ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Payments"
        description="View invoices, pay dues, and download receipts."
        actions={
          <Button
            className="h-12 gap-3 rounded-xl px-6 text-base font-bold"
            disabled={!defaultPaymentInvoice}
            onClick={() => setPaymentInvoice(defaultPaymentInvoice)}
          >
            <CreditCard className="h-5 w-5" />
            Make Payment
          </Button>
        }
      />

      {invoicesQuery.error || paymentsQuery.error || outstandingQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {invoicesQuery.error?.message ||
            paymentsQuery.error?.message ||
            outstandingQuery.error?.message}
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <BillingSummaryCard
          icon={AlertCircle}
          tone="danger"
          value={formatMoney(outstandingQuery.data?.total_outstanding || 0)}
          label="Outstanding Balance"
          hint={
            nextDueInvoice?.due_date
              ? `Due ${formatRelativeDue(nextDueInvoice.due_date)}`
              : "No unpaid invoices"
          }
        />
        <BillingSummaryCard
          icon={Clock3}
          tone="warning"
          value={formatMoney(
            nextDueInvoice?.grand_total || nextDueInvoice?.outstanding_amount || 0,
          )}
          label="Upcoming This Month"
          hint={
            nextDueInvoice?.due_date
              ? `Next due: ${formatDate(nextDueInvoice.due_date)}`
              : "No upcoming invoice"
          }
        />
        <BillingSummaryCard
          icon={CheckCircle2}
          tone="success"
          value={formatMoney(paidYearToDate)}
          label="Paid Year-To-Date"
          hint={`${payments.length} payments this year`}
        />
      </section>

      <Card className="card-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-5 p-4 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-black">Invoices</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:min-w-72">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoices..."
                  className="h-12 rounded-xl pl-12 text-base"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 gap-3 rounded-xl border-primary px-6 text-base font-bold text-primary"
              >
                <Filter className="h-5 w-5" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InvoiceTab)}>
            <div className="overflow-x-auto px-4 sm:px-8">
              <TabsList className="h-auto min-w-max gap-5 rounded-none border-b bg-transparent p-0 text-sm sm:gap-7 sm:text-base">
                <InvoiceTabTrigger value="all" label="All" />
                <InvoiceTabTrigger
                  value="outstanding"
                  label="Outstanding"
                  count={counts.outstanding}
                />
                <InvoiceTabTrigger value="paid" label="Paid" count={counts.paid} />
                <InvoiceTabTrigger value="upcoming" label="Upcoming" count={counts.upcoming} />
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <InvoiceTable
                rows={tabbedInvoices}
                loading={invoicesQuery.isLoading}
                onView={setSelectedInvoice}
                onPay={setPaymentInvoice}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="p-8">
            <h2 className="text-xl font-black">Payment history</h2>
          </div>
          <PaymentTable rows={payments} loading={paymentsQuery.isLoading} />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Detail</DialogTitle>
          </DialogHeader>
          {invoiceDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading invoice...</p>
          ) : invoiceDetailQuery.data ? (
            <InvoiceDetailView invoice={invoiceDetailQuery.data} />
          ) : (
            <p className="text-sm text-muted-foreground">No invoice selected.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(paymentInvoice)}
        onOpenChange={(open) => !open && setPaymentInvoice(null)}
      >
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="border-b p-5 pb-4 sm:p-8 sm:pb-6">
            <DialogTitle className="text-2xl font-black">Make Payment</DialogTitle>
            <p className="text-base text-muted-foreground">
              {paymentInvoice ? getInvoiceDescription(paymentInvoice) : "Select an invoice"}
            </p>
          </DialogHeader>
          {paymentInvoice ? (
            <PaymentDialogBody
              invoice={paymentInvoice}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onClose={() => setPaymentInvoice(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BillingSummaryCard({
  icon: Icon,
  tone,
  value,
  label,
  hint,
}: {
  icon: typeof AlertCircle;
  tone: "danger" | "warning" | "success";
  value: string;
  label: string;
  hint: string;
}) {
  const toneClass = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-accent-soft text-accent-foreground",
    success: "bg-secondary-soft text-secondary",
  }[tone];
  const valueClass = {
    danger: "text-destructive",
    warning: "text-accent-foreground",
    success: "text-secondary",
  }[tone];

  return (
    <Card className="card-elevated">
      <CardContent className="flex items-center gap-4 p-4 sm:gap-6 sm:p-8">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl sm:h-20 sm:w-20 ${toneClass}`}
        >
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <div className="min-w-0">
          <p
            className={`break-words font-display text-2xl font-black tracking-tight sm:text-3xl ${valueClass}`}
          >
            {value}
          </p>
          <p className="mt-2 text-base font-black sm:text-lg">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceTabTrigger({
  value,
  label,
  count,
}: {
  value: InvoiceTab;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-5 text-base font-bold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
    >
      {label}
      {typeof count === "number" ? (
        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-black text-muted-foreground">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

function InvoiceTable({
  rows,
  loading,
  onView,
  onPay,
}: {
  rows: Invoice[];
  loading: boolean;
  onView: (invoice: string) => void;
  onPay: (invoice: Invoice) => void;
}) {
  if (loading) return <EmptyState label="Loading invoices..." />;
  if (rows.length === 0) return <EmptyState label="No invoices here" />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-y bg-muted/20">
            <TableHead className="px-8 py-5 text-sm font-black uppercase text-muted-foreground">
              Invoice ID
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Description
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Due Date
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="py-5 text-right text-sm font-black uppercase text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invoice) => {
            const status = normalizeInvoiceStatus(invoice);
            return (
              <TableRow key={invoice.name} className="border-b hover:bg-muted/30">
                <TableCell className="px-8 py-6 font-mono text-base font-black text-primary">
                  {invoice.name}
                </TableCell>
                <TableCell className="max-w-64 py-6 text-base font-medium">
                  {getInvoiceDescription(invoice)}
                </TableCell>
                <TableCell className="py-6 text-base text-muted-foreground">
                  {formatDate(invoice.posting_date)}
                </TableCell>
                <TableCell className="py-6 text-base text-muted-foreground">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell className="py-6 text-lg font-black">
                  {formatMoney(invoice.grand_total || 0)}
                </TableCell>
                <TableCell className="py-6">
                  <InvoiceStatusPill status={status} />
                </TableCell>
                <TableCell className="py-6 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="View"
                      onClick={() => onView(invoice.name)}
                    >
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Download"
                      onClick={() =>
                        window.alert(`Download for ${invoice.name} will be generated from Frappe.`)
                      }
                    >
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    {status !== "paid" ? (
                      <Button
                        size="sm"
                        className="rounded-lg px-4 font-bold"
                        onClick={() => onPay(invoice)}
                      >
                        Pay
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentTable({ rows, loading }: { rows: Payment[]; loading: boolean }) {
  if (loading) return <EmptyState label="Loading payments..." />;
  if (rows.length === 0) return <EmptyState label="No payment history yet" />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-y bg-muted/20">
            <TableHead className="px-8 py-5 text-sm font-black uppercase text-muted-foreground">
              Payment ID
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Reference
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Amount
            </TableHead>
            <TableHead className="py-5 text-sm font-black uppercase text-muted-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((payment) => (
            <TableRow key={payment.name} className="border-b">
              <TableCell className="px-8 py-5 font-mono text-base font-black text-primary">
                {payment.name}
              </TableCell>
              <TableCell className="py-5 text-base text-muted-foreground">
                {formatDate(payment.posting_date)}
              </TableCell>
              <TableCell className="py-5 text-base">{payment.reference_no || "-"}</TableCell>
              <TableCell className="py-5 text-lg font-black">
                {formatMoney(payment.paid_amount || payment.received_amount || 0)}
              </TableCell>
              <TableCell className="py-5">
                <InvoiceStatusPill status="paid" label={payment.status || "Paid"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentDialogBody({
  invoice,
  paymentMethod,
  onPaymentMethodChange,
  onClose,
}: {
  invoice: Invoice;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onClose: () => void;
}) {
  const amountDue = Number(invoice.outstanding_amount || invoice.grand_total || 0);

  return (
    <div className="space-y-6 p-5 sm:space-y-8 sm:p-8">
      <div className="rounded-xl bg-muted/50 p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base text-muted-foreground">Amount Due</p>
            <p className="mt-4 break-words font-display text-3xl font-black tracking-tight sm:text-5xl">
              {formatMoney(amountDue)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-mono text-base text-muted-foreground">{invoice.name}</p>
            <p className="mt-2 text-base text-muted-foreground">
              Due: {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black">Payment Method</h3>
        <div className="mt-5 space-y-3">
          <PaymentMethodOption
            title="Credit / Debit Card"
            description="Visa, Mastercard, Amex"
            selected={paymentMethod === "Card"}
            onClick={() => onPaymentMethodChange("Card")}
          />
          <PaymentMethodOption
            title="M-Pesa"
            description="Mobile money transfer"
            selected={paymentMethod === "M-Pesa"}
            onClick={() => onPaymentMethodChange("M-Pesa")}
          />
          <PaymentMethodOption
            title="Bank Transfer"
            description="Direct bank payment"
            selected={paymentMethod === "Bank Transfer"}
            onClick={() => onPaymentMethodChange("Bank Transfer")}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" className="h-12 rounded-xl px-6 font-bold" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          className="h-12 rounded-xl px-6 font-bold"
          onClick={() =>
            window.alert(
              `${paymentMethod} payment checkout is ready to connect to a payment provider.`,
            )
          }
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Continue Payment
        </Button>
      </div>
    </div>
  );
}

function PaymentMethodOption({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-5 rounded-xl border-2 p-6 text-left transition-colors ${
        selected ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full border-2 ${selected ? "border-primary" : "border-border"}`}
      >
        {selected ? <span className="h-3 w-3 rounded-full bg-primary" /> : null}
      </span>
      <span>
        <span className="block text-lg font-black">{title}</span>
        <span className="mt-1 block text-base text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function InvoiceDetailView({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
        <Info label="Invoice" value={invoice.name} />
        <Info label="Customer" value={invoice.customer || "-"} />
        <Info label="Due date" value={formatDate(invoice.due_date)} />
        <Info label="Outstanding" value={formatMoney(invoice.outstanding_amount || 0)} />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(invoice.items || []).map((item, index) => (
              <TableRow key={`${item.item_code}-${index}`}>
                <TableCell>{item.item_name || item.item_code || item.description}</TableCell>
                <TableCell>{item.qty || 0}</TableCell>
                <TableCell>{formatMoney(item.rate || 0)}</TableCell>
                <TableCell>{formatMoney(item.amount || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <p className="font-display text-2xl font-black">{formatMoney(invoice.grand_total || 0)}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function InvoiceStatusPill({
  status,
  label,
}: {
  status: "paid" | "pending" | "overdue" | "upcoming";
  label?: string;
}) {
  const config = {
    paid: {
      label: label || "Paid",
      className: "bg-secondary-soft text-secondary",
      icon: CheckCircle2,
    },
    pending: {
      label: label || "Outstanding",
      className: "bg-destructive/10 text-destructive",
      icon: AlertCircle,
    },
    overdue: {
      label: label || "Outstanding",
      className: "bg-destructive/10 text-destructive",
      icon: AlertCircle,
    },
    upcoming: {
      label: label || "Upcoming",
      className: "bg-accent-soft text-accent-foreground",
      icon: Clock3,
    },
  }[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black ${config.className}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Wallet className="h-6 w-6" />
      </div>
      <p className="mt-4 text-base font-black">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">You're all caught up.</p>
    </div>
  );
}

function filterInvoicesByTab(invoices: Invoice[], tab: InvoiceTab) {
  if (tab === "all") return invoices;
  return invoices.filter((invoice) => {
    const status = normalizeInvoiceStatus(invoice);
    if (tab === "outstanding") return status === "pending" || status === "overdue";
    return status === tab;
  });
}

function getCounts(invoices: Invoice[]) {
  return invoices.reduce(
    (counts, invoice) => {
      const status = normalizeInvoiceStatus(invoice);
      if (status === "paid") counts.paid += 1;
      if (status === "upcoming") counts.upcoming += 1;
      if (status === "pending" || status === "overdue") counts.outstanding += 1;
      return counts;
    },
    { paid: 0, upcoming: 0, outstanding: 0 },
  );
}

function normalizeInvoiceStatus(invoice: Invoice): "paid" | "pending" | "overdue" | "upcoming" {
  if (invoice.status === "Paid" || Number(invoice.outstanding_amount || 0) === 0) return "paid";
  if (invoice.due_date && new Date(invoice.due_date) > new Date()) return "upcoming";
  if (invoice.due_date && new Date(invoice.due_date) < new Date()) return "overdue";
  return "pending";
}

function getInvoiceDescription(invoice: Invoice) {
  const month = invoice.posting_date
    ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(invoice.posting_date),
      )
    : "";
  const prefix = invoice.name?.startsWith("UTL") ? "Utility Bill" : "Monthly Rent";
  return month ? `${prefix} - ${month}` : prefix;
}

function formatRelativeDue(value?: string) {
  if (!value) return "date pending";
  const due = new Date(value).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((due - today.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days > 0) return `within ${days} days`;
  return `${Math.abs(days)} days ago`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
