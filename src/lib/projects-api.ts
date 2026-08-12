import { http } from "./api";

export type MandateStage =
  | "Create"
  | "Setup"
  | "Deliver"
  | "Review"
  | "Bill"
  | "Close";
export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface Milestone {
  _id: string;
  name: string;
  status: MilestoneStatus;
  date: string;
}

export interface Project {
  _id: string;
  ref: string;
  name: string;
  description: string;
  clientName: string;
  type: string;
  stage: MandateStage;
  manager: string;
  team: string[];
  startDate: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
}

// Badges are styled straight off the real mandate stage — no
// translation layer into a separate vocabulary the backend doesn't
// actually have.
export const stageStyles: Record<MandateStage, string> = {
  Create: "bg-muted text-muted-foreground border-border",
  Setup: "bg-muted text-muted-foreground border-border",
  Deliver: "bg-info/10 text-info border-info/20",
  Review: "bg-warning/10 text-warning border-warning/20",
  Bill: "bg-warning/10 text-warning border-warning/20",
  Close: "bg-success/10 text-success border-success/20",
};

export const fetchProjects = (): Promise<Project[]> =>
  http.get("/crm/client-projects");
export const fetchProject = (id: string): Promise<Project> =>
  http.get(`/crm/client-projects/${id}`);

export interface ProjectMessage {
  _id: string;
  direction: "tenant" | "client";
  author: string;
  body: string;
  createdAt: string;
}

export const fetchMessages = (id: string): Promise<ProjectMessage[]> =>
  http.get(`/crm/client-projects/${id}/messages`);

export const sendMessage = (
  id: string,
  author: string,
  body: string,
): Promise<ProjectMessage> =>
  http.post(`/crm/client-projects/${id}/messages`, { author, body });

export interface ProjectDocument {
  _id: string;
  folder: string;
  name: string;
  fileUrl: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export const fetchDocuments = (id: string): Promise<ProjectDocument[]> =>
  http.get(`/crm/client-projects/${id}/documents`);

// Always lands in "Client submissions" server-side — the tenant's
// real folder structure doesn't map to a client-facing category
// picker, so there's nothing meaningful to choose here.
export const uploadDocument = (
  id: string,
  file: File,
): Promise<ProjectDocument> => {
  const form = new FormData();
  form.append("file", file);
  return http.post(`/crm/client-projects/${id}/documents`, form);
};
