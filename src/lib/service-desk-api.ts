import { http } from "./api";

// Real vocabulary, matching the tenant/employee side exactly — the
// prototype's own local Ticket type had a narrower status/priority
// set and different categories. Reconciled to one real shape rather
// than kept as a second, disagreeing type.
export type TicketStatus =
  | "New"
  | "Assigned"
  | "In Progress"
  | "Pending Client"
  | "Resolved"
  | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export const TICKET_PRIORITIES: TicketPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

// Same vocabulary the Knowledge Base and tenant/employee sides use.
export const TICKET_CATEGORIES = [
  "Portal access",
  "Billing",
  "Advisory",
  "Process",
  "New work",
  "Other",
];

// Client-facing labels for the real statuses — not a narrower status
// set, just friendlier copy for the same six real values.
export const statusLabel: Record<TicketStatus, string> = {
  New: "Received",
  Assigned: "In queue",
  "In Progress": "In progress",
  "Pending Client": "Awaiting your response",
  Resolved: "Resolved",
  Closed: "Closed",
};
export const statusStyles: Record<TicketStatus, string> = {
  New: "bg-info/10 text-info border-info/20",
  Assigned: "bg-info/10 text-info border-info/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Pending Client": "bg-warning/10 text-warning border-warning/20",
  Resolved: "bg-success/10 text-success border-success/20",
  Closed: "bg-success/10 text-success border-success/20",
};

export interface TicketNote {
  _id: string;
  author: string;
  internal: boolean;
  body: string;
  at: string;
}

export interface Ticket {
  _id: string;
  ref: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  category: string;
  agent: string;
  status: TicketStatus;
  slaTargetHrs: number;
  slaElapsedHrs: number;
  rating: number | null;
  ratingComment: string | null;
  // Only ever the non-internal half — the backend never sends
  // internal notes to the client endpoints at all.
  notes: TicketNote[];
  createdAt: string;
  updatedAt: string;
}

export interface RaiseTicketPayload {
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  clientName: string;
}

export const raiseTicket = (dto: RaiseTicketPayload): Promise<Ticket> =>
  http.post("/crm/client-tickets", dto);

export const fetchMyTickets = (): Promise<Ticket[]> =>
  http.get("/crm/client-tickets");

export const fetchMyTicket = (id: string): Promise<Ticket> =>
  http.get(`/crm/client-tickets/${id}`);

export const replyToTicket = (
  id: string,
  clientName: string,
  body: string,
): Promise<Ticket> =>
  http.post(`/crm/client-tickets/${id}/reply`, { clientName, body });

export const rateTicket = (
  id: string,
  rating: number,
  comment: string,
): Promise<Ticket> =>
  http.post(`/crm/client-tickets/${id}/rate`, { rating, comment });

// ── Knowledge Base ────────────────────────────────────────────

export interface KbArticle {
  _id: string;
  ref: string;
  title: string;
  category: string;
  tags: string[];
  body: string;
  views: number;
  helpful: number;
  notHelpful: number;
}

export const fetchKbArticles = (): Promise<KbArticle[]> =>
  http.get("/crm/client-kb-articles");

export const recordKbView = (id: string): Promise<KbArticle> =>
  http.post(`/crm/client-kb-articles/${id}/view`);

export const voteKbArticle = (
  id: string,
  helpful: boolean,
): Promise<KbArticle> =>
  http.post(`/crm/client-kb-articles/${id}/vote`, { helpful });
