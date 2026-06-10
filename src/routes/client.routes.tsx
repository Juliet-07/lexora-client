import ClientDashboard from "@/pages/Client/ClientDashboard";
import { Route } from "react-router-dom";

export const clientClientRoutes = (
  <>
    <Route path="/client/dashboard" element={<ClientDashboard />} />
  </>
);
