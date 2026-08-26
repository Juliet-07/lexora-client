import { http } from "./api";

export type ClientNotificationType =
  | "Document"
  | "Invoice"
  | "Payment"
  | "Ticket"
  | "Compliance"
  | "Onboarding"
  | "Newsletter"
  | "General";

export interface ClientNotification {
  _id: string;
  type: ClientNotificationType;
  title: string;
  description: string;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export const fetchMyNotifications = (): Promise<ClientNotification[]> =>
  http.get<ClientNotification[]>("/client/notifications");

export const fetchUnreadCount = (): Promise<{ count: number }> =>
  http.get<{ count: number }>("/client/notifications/unread-count");

export const markNotificationRead = (id: string): Promise<ClientNotification> =>
  http.post<ClientNotification>(`/client/notifications/${id}/read`);

export const markAllNotificationsRead = (): Promise<{ marked: boolean }> =>
  http.post<{ marked: boolean }>("/client/notifications/mark-all-read");
