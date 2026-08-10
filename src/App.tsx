import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/Login";
import EngagementLetter from "@/pages/EngagementLetter";
import DashboardRouter from "@/DashboardRouter";
import Documents from "@/pages/Documents";
import Payments from "@/pages/Payments";
import Messages from "@/pages/Messages";
import KycOnboarding from "@/pages/KYC/KycOnboarding";
import Notifications from "@/pages/Notifications";
import Alerts from "@/pages/Alerts";
import Profile from "@/pages/Profile";
import Projects from "@/pages/Projects/Projects";
import ProjectDetail from "@/pages/Projects/ProjectDetail";
import Newsletters from "@/pages/Newsletters";
import ServiceDesk from "@/pages/ServiceDesk";
import NotFound from "@/pages/NotFound";
import { boardRoutes } from "@/routes/board.routes";
import { clientClientRoutes } from "@/routes/client.routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ── Public ──────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/engagement-letter/:token"
            element={<EngagementLetter />}
          />

          {/* ── Shared (all portal types) ───────────────────── */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* ── KYC client portal ───────────────────────────── */}
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/onboarding" element={<KycOnboarding />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/profile" element={<Profile />} />

          {/* ── Board portal (client_board) ─────────────────── */}
          {boardRoutes}

          {/* ── Client-client portal (client_client) ────────── */}
          {clientClientRoutes}

          {/* ── Fallback ────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
