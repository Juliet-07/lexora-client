import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType?: "client" | "employee" | "board" | string;
  roles?: string[];
  status?: string;
  clientProfile?: {
    classifications?: "individual" | "corporate" | string;
    kycStatus?: string;
  } | null;
  tenantProfile?: any;
  [k: string]: any;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["superadmin-profile"],
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

export function isEmployee(user: CurrentUser | undefined) {
  return user?.userType === "employee" || hasRole(user, "client_employee");
}
