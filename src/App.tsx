import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import EngagementLetter from "./pages/EngagementLetter.tsx";
import Index from "./pages/Index.tsx";
import Documents from "./pages/Documents.tsx";
import Payments from "./pages/Payments.tsx";
import Messages from "./pages/Messages.tsx";
import KycOnboarding from "./pages/KYC/KycOnboarding.tsx";
import Notifications from "./pages/Notifications.tsx";
import Alerts from "./pages/Alerts.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/engagement-letter/:token"
            element={<EngagementLetter />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/onboarding" element={<KycOnboarding />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
