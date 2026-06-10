import { Route } from "react-router-dom";
import MyProfile from "@/pages/Employee/MyProfile";
import MyLeave from "@/pages/Employee/MyLeave";
import MyPayslips from "@/pages/Employee/MyPayslips";
import MyLoans from "@/pages/Employee/MyLoans";
import MyTime from "@/pages/Employee/MyTime";
import MyPerformance from "@/pages/Employee/MyPerformance";
import MyTraining from "@/pages/Employee/MyTraining";
import MyDocuments from "@/pages/Employee/MyDocuments";
import MyRequests from "@/pages/Employee/MyRequests";

/**
 * Employee portal routes — client_employee role.
 */
export const employeeRoutes = (
  <>
    <Route path="/employee/profile" element={<MyProfile />} />
    <Route path="/employee/leave" element={<MyLeave />} />
    <Route path="/employee/payslips" element={<MyPayslips />} />
    <Route path="/employee/loans" element={<MyLoans />} />
    <Route path="/employee/time" element={<MyTime />} />
    <Route path="/employee/performance" element={<MyPerformance />} />
    <Route path="/employee/training" element={<MyTraining />} />
    <Route path="/employee/documents" element={<MyDocuments />} />
    <Route path="/employee/requests" element={<MyRequests />} />
  </>
);
