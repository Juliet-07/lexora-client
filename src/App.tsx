import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import EngagementLetter from "./pages/EngagementLetter.tsx";
import DashboardRouter from "./pages/DashboardRouter.tsx";
import Documents from "./pages/Documents.tsx";
import Payments from "./pages/Payments.tsx";
import Messages from "./pages/Messages.tsx";
import KycOnboarding from "./pages/KYC/KycOnboarding.tsx";
import Notifications from "./pages/Notifications.tsx";
import Alerts from "./pages/Alerts.tsx";
import HR from "./pages/HR.tsx";
import EmployeeSection from "./pages/EmployeeSection.tsx";
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
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/onboarding" element={<KycOnboarding />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/hr" element={<HR />} />
          <Route
            path="/employee/profile"
            element={
              <EmployeeSection
                title="My Profile"
                subtitle="Personal details, employment history & qualifications"
                description="View and update your personal details (address, phone, emergency contact, bank details — subject to approval), upload qualifications and certificates, and review your employment history and current position."
              />
            }
          />
          <Route
            path="/employee/leave"
            element={
              <EmployeeSection
                title="My Leave"
                subtitle="Balances, requests & team calendar"
                description="View leave balances by type, apply for leave with supporting documents where required, track approval status, view leave history and check colleague availability before applying."
              />
            }
          />
          <Route
            path="/employee/payslips"
            element={
              <EmployeeSection
                title="My Payslips"
                subtitle="Current and historical pay information"
                description="View and download current and historical payslips (PDF, password-protected) and review your year-to-date earnings and deductions summary."
              />
            }
          />
          <Route
            path="/employee/loans"
            element={
              <EmployeeSection
                title="My Loans"
                subtitle="Loan balances, applications & repayments"
                description="View active loan balances and repayment schedules, apply for a new loan or salary advance, track application status and view repayment history."
              />
            }
          />
          <Route
            path="/employee/time"
            element={
              <EmployeeSection
                title="My Time"
                subtitle="Clock in/out, timesheets & overtime"
                description="Clock in and clock out (web or mobile), view your timesheet for current and prior periods, submit timesheets for approval and view overtime hours."
              />
            }
          />
          <Route
            path="/employee/performance"
            element={
              <EmployeeSection
                title="My Performance"
                subtitle="Goals, feedback & reviews"
                description="View current goals and objectives, submit self-assessments, view manager feedback, access performance review history, and view PIP status and milestones where applicable."
              />
            }
          />
          <Route
            path="/employee/training"
            element={
              <EmployeeSection
                title="My Training"
                subtitle="Programmes, e-learning & certifications"
                description="View assigned training programmes, access e-learning materials, register for upcoming sessions, view certifications and CPD records, and download certificates."
              />
            }
          />
          <Route
            path="/employee/requests"
            element={
              <EmployeeSection
                title="My Requests"
                subtitle="Grievances & HR requests"
                description="Submit grievances (confidential routing to HR) and general HR requests such as letter requests, employment verification and reference requests, and track their status."
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
