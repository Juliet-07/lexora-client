export interface Milestone {
  name: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
}

export interface ProjectDoc {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  date: string;
  size: string;
}

export interface ProjectMessage {
  id: string;
  from: string;
  self: boolean;
  text: string;
  time: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  time: string;
}

export interface Project {
  id: string;
  name: string;
  reference: string;
  manager: string;
  status: "In Progress" | "Pending Review" | "Not Started" | "Completed";
  progress: number;
  startDate: string;
  dueDate: string;
  description: string;
  milestones: Milestone[];
  documents: ProjectDoc[];
  messages: ProjectMessage[];
  activity: ActivityItem[];
}

export const projects: Project[] = [
  {
    id: "tax-filing-2024",
    name: "Tax Filing 2024",
    reference: "PRJ-1041",
    manager: "Sarah K.",
    status: "In Progress",
    progress: 65,
    startDate: "Feb 1, 2026",
    dueDate: "Apr 30, 2026",
    description:
      "Preparation and submission of annual corporate tax returns, including supporting schedules and reconciliations.",
    milestones: [
      { name: "Engagement signed", status: "completed", date: "Feb 3, 2026" },
      { name: "Records collected", status: "completed", date: "Feb 24, 2026" },
      { name: "Draft return prepared", status: "in_progress", date: "Apr 12, 2026" },
      { name: "Client approval", status: "pending", date: "Apr 22, 2026" },
      { name: "Filed with authority", status: "pending", date: "Apr 30, 2026" },
    ],
    documents: [
      { id: "d1", name: "Trial Balance 2024.xlsx", category: "Financial", uploadedBy: "You", date: "Feb 20, 2026", size: "412 KB" },
      { id: "d2", name: "Tax Return Draft.pdf", category: "Report", uploadedBy: "Sarah K.", date: "Apr 3, 2026", size: "1.2 MB" },
    ],
    messages: [
      { id: "m1", from: "Sarah K.", self: false, text: "We've started the draft return. Could you share the Q4 bank statements?", time: "Apr 2, 10:12" },
      { id: "m2", from: "You", self: true, text: "Sure — uploading them to the project documents now.", time: "Apr 2, 11:40" },
      { id: "m3", from: "Sarah K.", self: false, text: "Received, thank you. Draft will be ready for your review by Apr 12.", time: "Apr 3, 09:05" },
    ],
    activity: [
      { id: "a1", actor: "Sarah K.", text: "uploaded Tax Return Draft.pdf", time: "Apr 3, 2026" },
      { id: "a2", actor: "You", text: "uploaded Trial Balance 2024.xlsx", time: "Feb 20, 2026" },
      { id: "a3", actor: "System", text: "milestone “Records collected” marked complete", time: "Feb 24, 2026" },
      { id: "a4", actor: "You", text: "signed the engagement letter", time: "Feb 3, 2026" },
    ],
  },
  {
    id: "company-registration",
    name: "Company Registration",
    reference: "PRJ-1038",
    manager: "James M.",
    status: "Pending Review",
    progress: 90,
    startDate: "Jan 8, 2026",
    dueDate: "Apr 15, 2026",
    description:
      "Incorporation of the new subsidiary, including name reservation, statutory filings and tax registration.",
    milestones: [
      { name: "Name reservation", status: "completed", date: "Jan 12, 2026" },
      { name: "Documents filed", status: "completed", date: "Feb 6, 2026" },
      { name: "Certificate issued", status: "completed", date: "Mar 18, 2026" },
      { name: "Tax registration", status: "in_progress", date: "Apr 15, 2026" },
    ],
    documents: [
      { id: "d3", name: "Certificate of Incorporation.pdf", category: "Statutory", uploadedBy: "James M.", date: "Mar 18, 2026", size: "620 KB" },
    ],
    messages: [
      { id: "m4", from: "James M.", self: false, text: "Certificate has been issued — attached in documents. Tax registration is next.", time: "Mar 18, 14:20" },
    ],
    activity: [
      { id: "a5", actor: "James M.", text: "uploaded Certificate of Incorporation.pdf", time: "Mar 18, 2026" },
      { id: "a6", actor: "System", text: "project progress updated to 90%", time: "Mar 18, 2026" },
    ],
  },
  {
    id: "annual-compliance",
    name: "Annual Compliance",
    reference: "PRJ-1052",
    manager: "Sarah K.",
    status: "Not Started",
    progress: 0,
    startDate: "May 1, 2026",
    dueDate: "Jun 30, 2026",
    description:
      "Annual statutory compliance review, including returns, registers and board resolutions.",
    milestones: [
      { name: "Kick-off meeting", status: "pending", date: "May 5, 2026" },
      { name: "Compliance checklist", status: "pending", date: "May 20, 2026" },
      { name: "Filings submitted", status: "pending", date: "Jun 30, 2026" },
    ],
    documents: [],
    messages: [],
    activity: [
      { id: "a7", actor: "System", text: "project created", time: "Apr 1, 2026" },
    ],
  },
];

export const statusStyles: Record<Project["status"], string> = {
  "In Progress": "bg-info/10 text-info border-info/20",
  "Pending Review": "bg-warning/10 text-warning border-warning/20",
  "Not Started": "bg-muted text-muted-foreground border-border",
  Completed: "bg-success/10 text-success border-success/20",
};
