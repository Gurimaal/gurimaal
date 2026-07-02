import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download, Eye, Filter, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, AlertCircle, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_layout/billing")({
  head: () => ({ meta: [{ title: "Billing · Gurimaal" }] }),
  component: BillingPage,
});

type Invoice = {
  id: string;
  desc: string;
  due: string;
  amount: string;
  status: "paid" | "pending" | "overdue" | "upcoming";
};

const invoices: Invoice[] = [
  { id: "INV-2026-072", desc: "Rent · July", due: "Jul 5, 2026", amount: "$1,850.00", status: "pending" },
  { id: "INV-2026-071", desc: "Electricity · June", due: "Jul 10, 2026", amount: "$86.40", status: "pending" },
  { id: "INV-2026-070", desc: "Water · June", due: "Jul 12, 2026", amount: "$32.10", status: "upcoming" },
  { id: "INV-2026-065", desc: "Rent · June", due: "Jun 5, 2026", amount: "$1,850.00", status: "paid" },
  { id: "INV-2026-064", desc: "Utilities · May", due: "Jun 10, 2026", amount: "$128.90", status: "paid" },
  { id: "INV-2026-058", desc: "Late fee · May", due: "May 20, 2026", amount: "$25.00", status: "overdue" },
];

function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing & Payments"
        description="View invoices, pay dues, and download receipts."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Make payment
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding balance" value="$1,968.40" hint="3 unpaid invoices" icon={AlertCircle} tone="destructive" />
        <StatCard label="Upcoming this month" value="$32.10" hint="Water · Jul 12" icon={CalendarClock} tone="accent" />
        <StatCard label="Paid year-to-date" value="$11,830.00" hint="6 payments" icon={Wallet} tone="secondary" />
      </section>

      <Card className="card-elevated">
        <CardHeader className="gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <CardTitle className="text-base font-semibold">Invoices</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoices…" className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-4">
              <InvoiceTable rows={invoices} />
            </TabsContent>
            <TabsContent value="outstanding" className="mt-4">
              <InvoiceTable rows={invoices.filter((i) => i.status === "pending" || i.status === "overdue")} />
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <InvoiceTable rows={invoices.filter((i) => i.status === "paid")} />
            </TabsContent>
            <TabsContent value="upcoming" className="mt-4">
              <InvoiceTable rows={invoices.filter((i) => i.status === "upcoming")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

function InvoiceTable({ rows }: { rows: Invoice[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Wallet className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold">No invoices here</p>
        <p className="text-xs text-muted-foreground">You're all caught up.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Invoice</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-xs">{r.id}</TableCell>
              <TableCell className="font-medium">{r.desc}</TableCell>
              <TableCell className="text-muted-foreground">{r.due}</TableCell>
              <TableCell className="font-semibold">{r.amount}</TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-1">
                  <Button size="icon" variant="ghost" title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                  {r.status !== "paid" && (
                    <Button size="sm" className="ml-1 gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Pay
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
