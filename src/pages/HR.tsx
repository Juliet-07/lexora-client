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

// ─── Component ────────────────────────────────────────────────

export default function HR() {
  const [search, setSearch] = useState("");
  const { data: currentUser } = useCurrentUser();

  // ── Use clientProfileId — the ClientProfileRecord._id ────
  // This is what employees are linked to via their clientId field.
  // Returned by GET /auth/me after the getProfile() patch.
  const clientProfileId = currentUser?.clientProfileId ?? null;

  // ── Fetch employees for this client ──────────────────────
  const { data, isLoading } = useQuery<PaginatedEmployees>({
    queryKey: ["client-hr-employees", clientProfileId],
    queryFn: async () => {
      const res = await api.get("/client/hr/employees", {
        params: { clientProfileId, limit: 100 },
      });
      console.log(res.data, "checking if this calls");
      return res.data?.data ?? res.data;
    },
    enabled: !!clientProfileId,
    staleTime: 60_000,
  });

  const employees = data?.items ?? [];

  // ── Client-side search ────────────────────────────────────
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
            title="Training Due"
            value={String(stats.trainingDue)}
            subtitle="Across team"
            icon={GraduationCap}
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
            {isLoading ? (
              <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading employees…</span>
              </div>
            ) : !clientProfileId ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                HR data is available for corporate clients. Contact your
                administrator.
              </div>
            ) : (
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="leave">Leave</TabsTrigger>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="mt-4">
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
                </TabsContent>

                {/* Leave */}
                <TabsContent value="leave" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          Annual Balance
                        </TableHead>
                        <TableHead className="text-right">
                          Sick Balance
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
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusStyle[e.employmentStatus] ?? ""}
                            >
                              {statusLabel[e.employmentStatus] ??
                                e.employmentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {e.annualLeaveBalance - e.annualLeaveUsed} /{" "}
                            {e.annualLeaveBalance}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {e.sickLeaveBalance - e.sickLeaveUsed} /{" "}
                            {e.sickLeaveBalance}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Payroll */}
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

                {/* Training */}
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
