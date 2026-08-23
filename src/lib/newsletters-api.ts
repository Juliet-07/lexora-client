import { http } from "./api";

// Only real, sent campaigns the tenant actually sent to this
// client — matches the real backend's own ClientNewsletterService,
// which never exposes drafts, other clients' recipient data, or
// campaigns this client wasn't part of.

export interface NewsletterEventDetails {
  title: string;
  dateTime: string;
  location: string;
  rsvp: boolean;
}

export interface Newsletter {
  _id: string;
  name: string;
  type: "Newsletter" | "Event invite";
  subject: string;
  body: string;
  event: NewsletterEventDetails | null;
  sentAt: string;
  // Real, set by the backend the moment this client actually opens
  // their own copy — not email-open-pixel tracking (no provider for
  // that is connected on the tenant side).
  opened: boolean;
}

export const fetchMyNewsletters = (): Promise<Newsletter[]> =>
  http.get<Newsletter[]>("/crm/client-newsletters");

// Fetching one real newsletter also marks it opened on the backend —
// the same real, in-portal signal the tenant's Communications page
// reads back, not a separate frontend-only "read" flag.
export const fetchMyNewsletter = (id: string): Promise<Newsletter> =>
  http.get<Newsletter>(`/crm/client-newsletters/${id}`);
