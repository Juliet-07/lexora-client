import { http } from "./api";

export type CaseType = "ADR" | "Litigation";

export interface CaseParty {
  name: string;
  role: string;
  organisation?: string;
}

export interface CaseSession {
  date: string;
  startTime?: string;
  endTime?: string;
  mode: string;
  venue?: string;
  status: string;
  outcome?: string;
}

export interface CourtDate {
  date: string;
  purpose?: string;
  outcome?: string;
}

export interface CaseTimelineEntry {
  at: string;
  title: string;
  description?: string;
}

export interface CaseSettlement {
  amount: number;
  date: string;
  terms?: string;
}

export interface MyCase {
  _id: string;
  caseType: CaseType;
  ref: string;
  title: string;
  type?: string; // ADR type: Mediation | Arbitration | Negotiation | Conciliation
  mandateName: string;
  stage: string;
  status: string;
  claimValue: number;
  currency: string;
  filedOn: string;
  createdAt: string;

  // ADR-specific
  parties?: CaseParty[];
  neutral?: string;
  sessions?: CaseSession[];
  settlement?: CaseSettlement | null;
  outcome?: string | null;
  venue?: string;
  governingLaw?: string;

  // Litigation-specific
  court?: string;
  courtDivision?: string;
  registry?: string;
  courtFeesPaid?: number;
  courtDates?: CourtDate[];
  adrCaseId?: string | null;

  timeline: CaseTimelineEntry[];
}

export const fetchMyCases = (): Promise<MyCase[]> =>
  http.get("/crm/client-cases");

export const fetchMyCase = (
  caseType: "adr" | "litigation",
  id: string,
): Promise<MyCase> => http.get(`/crm/client-cases/${caseType}/${id}`);
