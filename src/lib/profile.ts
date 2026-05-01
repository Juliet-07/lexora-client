// Lightweight client-side profile store (frontend-only).
// Persists the logged-in client's classification and onboarding state
// so the KYC wizard can render the right form variant.

export type ClientClassification =
  | "individual"
  | "corporate"
  | "partnership"
  | "trust";

export const KYC_DRAFT_KEY = "kyc_draft_v1";
const PROFILE_KEY = "client_profile_v1";

export interface ClientProfile {
  classifications: ClientClassification | null;
  isOnboarded: boolean;
  kycStatus?: string;
}

const defaultProfile: ClientProfile = {
  classifications: null,
  isOnboarded: false,
  kycStatus: "not_started",
};

export function getProfile(): ClientProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function setProfile(patch: Partial<ClientProfile>): ClientProfile {
  const next = { ...getProfile(), ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function clearDraft() {
  localStorage.removeItem(KYC_DRAFT_KEY);
}
