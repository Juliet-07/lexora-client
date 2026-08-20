import { http, api } from "./api";

// Only the stages a client should ever see — Draft/In Review/
// Approved invoices are the tenant's internal business, never
// exposed here. Matches the real backend's own visibleStages list,
// not a separate frontend guess at what to show.
export type ClientInvoiceStage =
  | "Sent"
  | "Part Paid"
  | "Paid"
  | "Overdue"
  | "Written Off";

export interface InvoiceLine {
  _id: string;
  description: string;
  qty: number;
  unit: number;
  timeEntryId: string | null;
}

// The tenant's real bank details for receiving payment — shown so
// the client knows where to send money. Never a Lexora-collected
// payment method; the money moves directly between the client and
// the firm, outside this system.
export interface RemittanceAccount {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  branchCode: string;
  swiftCode: string;
}

export type ClientInvoiceAction = "Paid" | "Cancelled";

export interface ClientInvoice {
  _id: string;
  ref: string;
  clientName: string;
  mandateName: string;
  currency: string;
  vatRate: number;
  whtRate: number;
  discount: number;
  stage: ClientInvoiceStage;
  issuedOn: string;
  dueOn: string;
  paidAmount: number;
  openedByClient: boolean;
  lines: InvoiceLine[];
  subtotal: number;
  net: number;
  vat: number;
  wht: number;
  gross: number;
  payable: number;
  createdAt: string;
  // Only present on the single-invoice detail fetch, not the list —
  // matches what the real backend actually returns where.
  remittanceAccounts?: RemittanceAccount[];
  // The client's own claim — "I've paid" or "there's an issue" — a
  // real, timestamped signal the firm sees, not a payment by itself.
  clientAction: ClientInvoiceAction | null;
  clientActionAt: string | null;
  clientActionNote: string | null;
}

export const fetchMyInvoices = (): Promise<ClientInvoice[]> =>
  http.get("/crm/client-invoices");

export const fetchMyInvoice = (id: string): Promise<ClientInvoice> =>
  http.get(`/crm/client-invoices/${id}`);

export const downloadMyInvoicePdf = async (
  id: string,
  ref: string,
): Promise<void> => {
  const res = await api.get(`/crm/client-invoices/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${ref}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Marks the invoice from the client's own side — a claim the firm
// sees and acts on, never something that settles the invoice by
// itself. The firm's own confirmation is the real payment event.
export const markInvoiceStatus = (
  id: string,
  action: ClientInvoiceAction,
  note?: string,
): Promise<ClientInvoice> =>
  http.post(`/crm/client-invoices/${id}/status`, { action, note });

// A balance still owed — used to decide whether to show the
// outstanding badge, not to imply a payment can be made here.
export const balanceOwed = (inv: ClientInvoice) =>
  Math.max(0, inv.payable - inv.paidAmount);

export const daysOverdue = (dueOn: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(dueOn).getTime()) / 86400000));
