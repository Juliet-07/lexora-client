import { http } from "@/lib/api";
import { api } from "@/lib/api";

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

export interface UploadResult {
  success: boolean;
  fileUrl: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
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

/**
 * Step 1 — Upload file to server storage.
 * Uses multipart/form-data. The interceptor handles auth token automatically.
 * Returns a URL pointing to the file on the server.
 */
export const uploadDocument = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  // Use the raw api instance here (not http wrapper) because
  // we need multipart/form-data, not JSON
  const res = await api.post("/client/onboarding/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

/**
 * Step 2 — Attach the uploaded file URL to the onboarding record.
 * Call this right after uploadDocument() succeeds.
 */
export const addDocument = (doc: Omit<DocumentAttachment, "uploadedAt">) =>
  http.post<OnboardingRecord>("/client/onboarding/documents", doc);

/** Remove a document from the onboarding record by URL */
export const removeDocument = (url: string) =>
  http.delete<OnboardingRecord>("/client/onboarding/documents", { url });
