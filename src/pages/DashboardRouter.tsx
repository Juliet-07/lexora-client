import EmployeeDashboard from "./EmployeeDashboard";
import Index from "./Index";
import { useCurrentUser, isEmployee } from "@/hooks/useCurrentUser";
import { PortalLayout } from "@/components/PortalLayout";

export default function DashboardRouter() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <PortalLayout title="Dashboard" subtitle="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-muted/30" />
      </PortalLayout>
    );
  }

  return isEmployee(user) ? <EmployeeDashboard /> : <Index />;
}
