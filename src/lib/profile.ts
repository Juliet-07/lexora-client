// Mock client profile helpers (frontend-only). Replace with API calls later.
export interface ClientProfile {
  email: string;
  isOnboarded: boolean;
}

const PROFILE_KEY = "client_profile";
export const KYC_DRAFT_KEY = "kyc_draft";

export function getProfile(): ClientProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // default mock profile: not onboarded
  const def: ClientProfile = { email: "john@example.com", isOnboarded: false };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(def));
  return def;
}

export function setProfile(update: Partial<ClientProfile>) {
  const current = getProfile();
  const next = { ...current, ...update };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}
