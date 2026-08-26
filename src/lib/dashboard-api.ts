import { http } from "./api";
import type { MandateStage } from "./projects-api";

export interface DashboardProject {
  _id: string;
  ref: string;
  name: string;
  stage: MandateStage;
  progress: number;
  manager: string;
  targetDate: string;
}

export interface DashboardInvoice {
  _id: string;
  ref: string;
  stage: string;
  currency: string;
  payable: number;
  paidAmount: number;
  dueOn: string;
  mandateName: string;
}

export interface DashboardTicket {
  _id: string;
  ref: string;
  subject: string;
  status: string;
  updatedAt: string;
}

export interface DashboardAlert {
  _id: string;
  title: string;
  severity: string;
  type: string;
  createdAt: string;
}

export interface DashboardPendingAction {
  title: string;
  context: string;
  type: "form" | "signature" | "payment" | "compliance" | string;
  urgent: boolean;
  to: string;
}

export interface DashboardActivityItem {
  text: string;
  meta: string;
  at: string;
}

export interface DashboardNewsletter {
  _id: string;
  name: string;
  subject: string;
  sentAt: string;
  opened: boolean;
}

export interface OnboardingBanner {
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  action: string | null;
  link: string | null;
}

export interface DashboardResponse {
  client: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    status: string;
    clientType: string;
    kycStatus: string;
    riskLevel: string;
    mustChangePassword: boolean;
    managedBy: string;
    openAlerts: number;
  };
  onboarding: {
    status: string;
    completionPercent: number;
    submittedAt: string | null;
    lastSavedAt: string | null;
    banner: OnboardingBanner;
  };
  projects: DashboardProject[];
  // Real, uncapped counts — the lists above (projects/invoices/
  // tickets) are each capped to a handful for the preview, so these
  // are what stat cards should read from, not list.length.
  stats: {
    activeProjectCount: number;
    openInvoiceCount: number;
    openTicketCount: number;
    outstandingByCurrency: Record<string, number>;
  };
  invoices: DashboardInvoice[];
  tickets: DashboardTicket[];
  alerts: DashboardAlert[];
  pendingActions: DashboardPendingAction[];
  recentActivity: DashboardActivityItem[];
  newsletters: DashboardNewsletter[];
}

export const fetchDashboard = (): Promise<DashboardResponse> =>
  http.get<DashboardResponse>("/client/dashboard");
