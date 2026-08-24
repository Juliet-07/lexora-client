import { http } from "./api";

// Only real, sent contracts the tenant actually sent to this client
// — matches the real backend's own ClientToolContractService, which
// never exposes drafts or another client's contracts, and enforces
// real ownership (tenantId + clientId + contractId all matching) on
// every call.

export type ContractSignatureStatus =
  | "not_sent"
  | "sent"
  | "signed"
  | "countersigned"
  | "declined";

export type ContractInteractionType =
  | "sent"
  | "viewed"
  | "comment"
  | "tenant_response"
  | "updated"
  | "resent"
  | "signed"
  | "countersigned"
  | "signed_copy_sent"
  | "declined";

export interface ContractInteraction {
  type: ContractInteractionType;
  occurredAt: string;
  actor: "signer" | "tenant";
  message: string | null;
}

export interface ContractSignature {
  signedAt: string;
  signerName: string;
  signatureImageData: string | null;
}

export interface Contract {
  _id: string;
  ref: string;
  title: string;
  type: string;
  renderedBody: string;
  signatureStatus: ContractSignatureStatus;
  interactions: ContractInteraction[];
  signature: ContractSignature | null;
  tenantSignature: ContractSignature | null;
  expiresOn: string;
  declinedAt: string | null;
  declineReason: string | null;
}

export const fetchMyContracts = (): Promise<Contract[]> =>
  http.get<Contract[]>("/crm/client-contracts");

// Fetching one real contract also marks it viewed on the backend —
// a real interaction on the audit trail, not a separate
// frontend-only "read" flag.
export const fetchMyContract = (id: string): Promise<Contract> =>
  http.get<Contract>(`/crm/client-contracts/${id}`);

export const submitContractComment = (
  id: string,
  message: string,
): Promise<Contract> =>
  http.post<Contract>(`/crm/client-contracts/${id}/comment`, { message });

export const signContract = (
  id: string,
  dto: { signerName: string; signatureImageData?: string },
): Promise<Contract> =>
  http.post<Contract>(`/crm/client-contracts/${id}/sign`, dto);

export const declineContract = (
  id: string,
  reason?: string,
): Promise<Contract> =>
  http.post<Contract>(`/crm/client-contracts/${id}/decline`, { reason });
