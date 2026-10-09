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

