import BoardDashboard from "@/pages/Board/BoardDashboard";
import { Route } from "react-router-dom";

export const boardRoutes = (
  <>
    <Route path="/board/home" element={<BoardDashboard />} />
    {/* <Route path="/board/payroll" element={<BoardPayroll />} /> */}*
  </>
);
