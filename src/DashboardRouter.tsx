import { PortalLayout } from "@/components/PortalLayout";
import BoardDashboard from "./pages/Board/BoardDashboard";
import ClientDashboard from "./pages/Client/ClientDashboard";
import Index from "./pages/Index";
import { useCurrentUser, getPortalType } from "@/hooks/useCurrentUser";

export default function DashboardRouter() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <PortalLayout title="Dashboard" subtitle="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-muted/30" />
      </PortalLayout>
    );
  }

  const portalType = getPortalType(user);

  switch (portalType) {
    case "board":
      return <BoardDashboard />;
    case "client_client":
      return <ClientDashboard />;
    case "kyc_client":
    default:
      return <Index />;
  }
}
