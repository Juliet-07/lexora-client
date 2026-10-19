import { http } from "./api";

// In-house events this client is invited to — matches the real
// backend's ClientEventController. Only events this client was
// actually invited to are ever returned; acknowledging attendance
// here IS this client's attendance record, nothing further happens
// behind the scenes.

export type EventType =
  | "Webinar"
  | "Conference"
  | "Workshop"
  | "Networking"
  | "Client briefing";
export type EventStatus = "Draft" | "Published" | "Completed" | "Cancelled";
export type EventInviteStatus =
  | "Invited"
  | "Registered"
  | "Acknowledged"
  | "Declined";

// Sanitized portal shape (backend EventService#sanitizeForPortal) —
// only this client's own `myStatus`, never the rest of the guest list.
export interface MyEvent {
  _id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  virtual: boolean;
  meetingLink: string;
  host: string;
  agenda: string;
  myStatus: EventInviteStatus | null;
}

export const fetchMyEvents = (): Promise<MyEvent[]> =>
  http.get<MyEvent[]>("/crm/client-events");

export const acknowledgeMyEvent = (
  id: string,
): Promise<{ acknowledged: boolean }> =>
  http.post<{ acknowledged: boolean }>(`/crm/client-events/${id}/acknowledge`);
