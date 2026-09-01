import axios from "axios";

// Deliberately NOT the shared `api` instance from lib/api.ts — that
// one auto-attaches any token sitting in localStorage and force-
// redirects to /login on a 401. Neither is acceptable on a genuinely
// public, token-gated page reached by someone who may not even have
// real credentials yet (the real KYC-onboarding case this exists
// for). A fresh, clean instance avoids both.
const PUBLIC_API_BASE = import.meta.env.VITE_REACT_APP_BASE_URL;
const publicApi = axios.create({ baseURL: PUBLIC_API_BASE });

export type SignatureStatus =
  | "not_sent"
  | "sent"
  | "signed"
  | "countersigned"
  | "declined";

export interface ContractInteraction {
  type: string;
  occurredAt: string;
  actor: string;
  message: string | null;
}

export interface ContractSignature {
  signedAt: string;
  signerName: string;
}

export interface PublicSignableContract {
  _id: string;
  title: string;
  counterparty: string;
  renderedBody: string;
  signatureStatus: SignatureStatus;
  interactions: ContractInteraction[];
  signature: ContractSignature | null;
}

export const fetchContractByToken = async (
  token: string,
): Promise<PublicSignableContract> => {
  const res = await publicApi.get(`/tools/contracts/sign/${token}`);
  return res.data?.data ?? res.data;
};

export const submitContractComment = async (
  token: string,
  message: string,
): Promise<PublicSignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/comment`, {
    message,
  });
  return res.data?.data ?? res.data;
};

export const signContract = async (
  token: string,
  signerName: string,
): Promise<PublicSignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/sign`, {
    signerName,
  });
  return res.data?.data ?? res.data;
};

export const declineContract = async (
  token: string,
  reason?: string,
): Promise<PublicSignableContract> => {
  const res = await publicApi.post(`/tools/contracts/sign/${token}/decline`, {
    reason,
  });
  return res.data?.data ?? res.data;
};
