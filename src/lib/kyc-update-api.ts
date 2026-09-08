import { http } from "@/lib/api";
import { DocumentAttachment } from "./onboarding-api";

export interface KycUpdateRecord {
  _id: string;
  clientId: string;
  tenantId: string;
  status: "requested" | "submitted" | "approved" | "rejected";
  message: string;
  requestedSections: string[];
  requestedAt: string;
  formData: Record<string, any>;
  documents: DocumentAttachment[];
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface SaveKycUpdatePayload {
  formData?: Record<string, any>;
}

export interface SubmitKycUpdatePayload {
  formData: Record<string, any>;
}

/** Load the current open KYC update request. Throws (404) if there is none. */
export const getKycUpdate = () =>
  http.get<KycUpdateRecord>("/client/kyc-update");

/** Save progress — merges fields, never wipes untouched sections. */
export const saveKycUpdateDraft = (payload: SaveKycUpdatePayload) =>
  http.patch<KycUpdateRecord>("/client/kyc-update/save", payload);

/** Final submit — locks the update for tenant review. */
export const submitKycUpdate = (payload: SubmitKycUpdatePayload) =>
  http.post<KycUpdateRecord>("/client/kyc-update/submit", payload);

/** Attach an uploaded file (upload it first via the shared onboarding upload endpoint). */
export const addKycUpdateDocument = (
  doc: Omit<DocumentAttachment, "uploadedAt">,
) => http.post<KycUpdateRecord>("/client/kyc-update/documents", doc);

/** Remove a document from the KYC update record by URL. */
export const removeKycUpdateDocument = (url: string) =>
  http.delete<KycUpdateRecord>("/client/kyc-update/documents", { url });
