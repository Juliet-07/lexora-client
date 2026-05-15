import { http } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────

export interface OnboardingRecord {
  _id: string;
  clientId: string;
  tenantId: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  clientType: string;
  formData: Record<string, any>;
  documents: DocumentAttachment[];
  sectionCompletion: Record<string, boolean>;
  completionPercent: number;
  submittedAt: string | null;
  lastSavedAt: string | null;
}

export interface DocumentAttachment {
  name: string;
  category: string;
  url: string;
  mimeType?: string;
  size?: number;
  description?: string;
  uploadedAt: string;
}

export interface SavePayload {
  formData?: Record<string, any>;
  sectionCompletion?: Record<string, boolean>;
  completionPercent?: number;
}

export interface SubmitPayload {
  formData: Record<string, any>;
  agreeTrue: boolean;
  agreeUpdate: boolean;
  agreeConsent: boolean;
  signature: string;
  signatoryTitle?: string;
}

// ── API calls ─────────────────────────────────────────────────

/** Load current draft — auto-creates one on first visit */
export const getOnboarding = () =>
  http.get<OnboardingRecord>("/client/onboarding");

/** Save draft — merges fields, never wipes untouched sections */
export const saveDraft = (payload: SavePayload) =>
  http.patch<OnboardingRecord>("/client/onboarding/save", payload);

/** Final submit — locks the form */
export const submitOnboarding = (payload: SubmitPayload) =>
  http.post<OnboardingRecord>("/client/onboarding/submit", payload);

/** Attach a document (Azure Blob URL) */
export const addDocument = (doc: Omit<DocumentAttachment, "uploadedAt">) =>
  http.post<OnboardingRecord>("/client/onboarding/documents", doc);

/** Remove a document by URL */
export const removeDocument = (url: string) =>
  http.delete<OnboardingRecord>("/client/onboarding/documents", { url });
