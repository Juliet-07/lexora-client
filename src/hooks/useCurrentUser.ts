import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType?: "client" | "employee" | string;
  roles?: string[];
  status?: string;
  clientProfile?: {
    classifications?: "individual" | "corporate" | string;
    kycStatus?: string;
  } | null;
  clientProfileId?: string | null;
  tenantProfile?: any;
  [k: string]: any;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data?.data ?? res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function hasRole(user: CurrentUser | undefined, role: string) {
  return !!user?.roles?.includes(role);
}

// ── Role-based portal type detection ─────────────────────────

export function isEmployee(user: CurrentUser | undefined): boolean {
  return hasRole(user, "client_employee");
}

export function isBoardMember(user: CurrentUser | undefined): boolean {
  return hasRole(user, "client_board");
}

export function isClientUser(user: CurrentUser | undefined): boolean {
  return hasRole(user, "client_client");
}

export function isKycClient(user: CurrentUser | undefined): boolean {
  return hasRole(user, "client_primary");
}

// Convenience: is this user any kind of HR portal user?
export function isHrPortalUser(user: CurrentUser | undefined): boolean {
  return isEmployee(user) || isBoardMember(user);
}

// Derive portal type as a string — useful for switch statements
export type PortalType =
  | "employee"
  | "board"
  | "client_client"
  | "kyc_client"
  | "unknown";

export function getPortalType(user: CurrentUser | undefined): PortalType {
  if (!user) return "unknown";
  if (isEmployee(user)) return "employee";
  if (isBoardMember(user)) return "board";
  if (isClientUser(user)) return "client_client";
  if (isKycClient(user)) return "kyc_client";
  return "unknown";
}
