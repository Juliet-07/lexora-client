import { useMemo, useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  CalendarDays,
  GraduationCap,
  Wallet,
  Search,
  Download,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// ─── Types ────────────────────────────────────────────────────

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  jobTitle: string;
  employmentStatus: string;
  annualLeaveBalance: number;
  annualLeaveUsed: number;
  sickLeaveBalance: number;
  sickLeaveUsed: number;
  salary: number | null;
  salaryCurrency: string;
}

interface PaginatedEmployees {
  items: Employee[];
  total: number;
  totalPages: number;
}

interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
  } | null;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

interface PaginatedLeave {
  items: LeaveRequest[];
  total: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  on_leave: "bg-warning/10 text-warning border-warning/20",
  suspended: "bg-orange-100 text-orange-700 border-orange-200",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
  resigned: "bg-muted text-muted-foreground",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
  resigned: "Resigned",
};

const LEAVE_STATUS_STYLE: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground",
};

const LEAVE_TYPES: Record<string, string> = {
  annual: "Annual",
  sick: "Sick",
  maternity: "Maternity",
  paternity: "Paternity",
  compassionate: "Compassionate",
  study: "Study",
  unpaid: "Unpaid",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ─── Component ────────────────────────────────────────────────

export default function HR() {
  const [search, setSearch] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("all");
  const { data: currentUser } = useCurrentUser();

  const clientProfileId = currentUser?.clientProfileId ?? null;

  // ── Fetch employees ───────────────────────────────────────
  const { data: empData, isLoading: empLoading } = useQuery<PaginatedEmployees>(
    {
      queryKey: ["client-hr-employees", clientProfileId],
      queryFn: async () => {
        const res = await api.get("/client/hr/employees", {
          params: { clientProfileId, limit: 100 },
        });
        return res.data?.data ?? res.data;
      },
      enabled: !!clientProfileId,
      staleTime: 60_000,
    },
  );

  // ── Fetch leave requests ──────────────────────────────────
  const { data: leaveData, isLoading: leaveLoading } = useQuery<PaginatedLeave>(
    {
      queryKey: ["client-hr-leave", clientProfileId, leaveStatus],
      queryFn: async () => {
        const params: any = { clientProfileId, limit: 100 };
        if (leaveStatus !== "all") params.status = leaveStatus;
        const res = await api.get("/client/hr/leave", { params });
        return res.data?.data ?? res.data;
      },
      enabled: !!clientProfileId,
      staleTime: 30_000,
    },
  );

  const employees = empData?.items ?? [];
  const leaveRequests = leaveData?.items ?? [];

  // ── Client-side search (employees) ───────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [
        `${e.firstName} ${e.lastName}`,
        e.email,
        e.department ?? "",
        e.jobTitle,
      ].some((v) => v.toLowerCase().includes(q)),
    );
  }, [employees, search]);

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((e) => e.employmentStatus === "active").length,
      onLeave: employees.filter((e) => e.employmentStatus === "on_leave")
        .length,
      trainingDue: 0,
    }),
    [employees],
  );

  const pendingLeave = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  // ── Export CSV ────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["Name", "Email", "Department", "Position", "Status"],
      ...employees.map((e) => [
        `${e.firstName} ${e.lastName}`,
        e.email,
        e.department ?? "—",
        e.jobTitle,
        statusLabel[e.employmentStatus] ?? e.employmentStatus,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="Human Resources"
      subtitle="Overview of every employee's HR status, leave, payroll & training"
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={String(stats.total)}
            subtitle="Across all departments"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active"
            value={String(stats.active)}
            subtitle="Currently working"
            icon={UserCheck}
            variant="success"
          />
          <StatCard
            title="On Leave"
            value={String(stats.onLeave)}
            subtitle="Approved leave"
            icon={CalendarDays}
            variant="warning"
          />
          <StatCard
            title="Pending Leave"
            value={String(pendingLeave)}
            subtitle="Awaiting approval"
            icon={Clock}
          />
        </div>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base font-heading">
                Employees
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, dept, role"
                    className="pl-8 h-9 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={employees.length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!clientProfileId ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                HR data is available for corporate clients. Contact your
                administrator.
              </div>
            ) : (
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="leave">
                    Leave
                    {pendingLeave > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-[10px] px-1.5"
                      >
                        {pendingLeave}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>

                {/* ── Overview tab ── */}
                <TabsContent value="overview" className="mt-4">
                  {empLoading ? (
                    <LoadingState />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-sm text-muted-foreground py-8"
                            >
                              {search
                                ? "No employees match your search."
                                : "No employees have been added yet."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filtered.map((e) => (
                            <TableRow key={e._id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">
                                    {e.firstName} {e.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {e.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {e.department ?? "—"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {e.jobTitle}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    statusStyle[e.employmentStatus] ?? ""
                                  }
                                >
                                  {statusLabel[e.employmentStatus] ??
                                    e.employmentStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* ── Leave tab — real data ── */}
                <TabsContent value="leave" className="mt-4">
                  {leaveLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="space-y-3">
                      {/* Status filter */}
                      <div className="flex gap-2 flex-wrap">
                        {["all", "pending", "approved", "rejected"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setLeaveStatus(s)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                              leaveStatus === s
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {s === "all" ? "All" : s}
                          </button>
                        ))}
                      </div>

                      {leaveRequests.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No leave requests found.
                        </p>
                      ) : (
                        leaveRequests.map((r) => {
                          const emp = r.employeeId;
                          const name = emp
                            ? `${emp.firstName} ${emp.lastName}`
                            : "—";

                          return (
                            <div
                              key={r._id}
                              className="flex items-center gap-3 p-3 rounded-lg border"
                            >
                              {/* Avatar */}
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium">{name}</p>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {LEAVE_TYPES[r.type] ?? r.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {fmt(r.startDate)} → {fmt(r.endDate)} ·{" "}
                                  {r.days}d · {r.reason}
                                </p>
                              </div>

                              {/* Status */}
                              <Badge
                                variant="outline"
                                className={`shrink-0 ${LEAVE_STATUS_STYLE[r.status] ?? ""}`}
                              >
                                <span className="capitalize">{r.status}</span>
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* ── Payroll tab ── */}
                <TabsContent value="payroll" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e._id}>
                          <TableCell className="font-medium">
                            {e.firstName} {e.lastName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {e.department ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {e.jobTitle}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                              {e.salary
                                ? `${e.salaryCurrency} ${e.salary.toLocaleString()}`
                                : "—"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* ── Training tab ── */}
                <TabsContent value="training" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">
                          Training Due
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e._id}>
                          <TableCell className="font-medium">
                            {e.firstName} {e.lastName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {e.department ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            Available when Learning module is active
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

// ─── Loading state ────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}
