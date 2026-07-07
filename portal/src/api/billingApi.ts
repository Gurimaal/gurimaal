import { apiClient } from "./client";

export type Invoice = {
  name: string;
  posting_date?: string;
  due_date?: string;
  grand_total?: number;
  outstanding_amount?: number;
  status?: string;
  docstatus?: number;
};

export type Payment = {
  name: string;
  posting_date?: string;
  paid_amount?: number;
  received_amount?: number;
  reference_no?: string;
  status?: string;
};

export type OutstandingSummary = {
  total_outstanding: number;
  invoice_count: number;
  invoices: Invoice[];
};

export type InvoiceDetail = Invoice & {
  customer?: string;
  items?: {
    item_code?: string;
    item_name?: string;
    description?: string;
    qty?: number;
    rate?: number;
    amount?: number;
  }[];
};

export type PayInvoiceArgs = {
  invoice: string;
  amount?: number;
  mode_of_payment?: string;
  paid_to?: string;
  reference_no?: string;
  reference_date?: string;
};

export const billingApi = {
  listInvoices: (limit = 100) =>
    apiClient.method<Invoice[]>("gurimaal.api.billing.invoice_list", { limit }),
  getInvoice: (invoice: string) =>
    apiClient.method<InvoiceDetail>("gurimaal.api.billing.invoice_detail", { invoice }),
  getOutstandingSummary: () =>
    apiClient.method<OutstandingSummary>("gurimaal.api.billing.outstanding_summary"),
  listPayments: (limit = 50) =>
    apiClient.method<Payment[]>("gurimaal.api.billing.payment_history", { limit }),
  payInvoice: (args: PayInvoiceArgs) =>
    apiClient.method<{ name: string; paid_amount: number; invoice: string }>(
      "gurimaal.api.billing.pay_invoice",
      args,
    ),
};
