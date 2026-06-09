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
  AlertCircle,
  Wallet,
  Search,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "on_leave" | "probation" | "exited";
  leaveBalance: number;
  trainingDue: number;
  outstandingTasks: number;
  lastPayslip: string;
}

const fallbackEmployees: EmployeeRow[] = [
  {
    id: "e1",
    name: "Amaka Obi",
    email: "amaka.obi@acme.co",
    department: "Finance",
    position: "Senior Accountant",
    status: "active",
    leaveBalance: 14,
    trainingDue: 1,
    outstandingTasks: 2,
    lastPayslip: "May 2026",
  },
  {
    id: "e2",
    name: "David Mwangi",
    email: "david.m@acme.co",
    department: "Operations",
    position: "Ops Manager",
    status: "on_leave",
    leaveBalance: 6,
    trainingDue: 0,
    outstandingTasks: 0,
    lastPayslip: "May 2026",
  },
  {
    id: "e3",
    name: "Fatima Diallo",
    email: "fatima.d@acme.co",
    department: "HR",
    position: "HR Officer",
    status: "active",
    leaveBalance: 18,
    trainingDue: 2,
    outstandingTasks: 1,
    lastPayslip: "May 2026",
  },
  {
    id: "e4",
    name: "Joshua Bello",
    email: "joshua.b@acme.co",
    department: "Engineering",
    position: "Software Engineer",
    status: "probation",
    leaveBalance: 5,
    trainingDue: 3,
    outstandingTasks: 4,
    lastPayslip: "May 2026",
  },
  {
    id: "e5",
    name: "Linda Okafor",
    email: "linda.o@acme.co",
    department: "Sales",
    position: "Account Executive",
    status: "active",
    leaveBalance: 12,
    trainingDue: 0,
    outstandingTasks: 0,
    lastPayslip: "May 2026",
  },
];

const statusStyle: Record<EmployeeRow["status"], string> = {
  active: "bg-success/10 text-success border-success/20",
  on_leave: "bg-warning/10 text-warning border-warning/20",
  probation: "bg-info/10 text-info border-info/20",
  exited: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabel: Record<EmployeeRow["status"], string> = {
  active: "Active",
  on_leave: "On Leave",
  probation: "Probation",
  exited: "Exited",
};

export default function HR() {
  const [search, setSearch] = useState("");

  const { data } = useQuery<EmployeeRow[]>({
    queryKey: ["hr-employees"],
    queryFn: async () => {
      try {
        const res = await api.get("/hr/employees");
        const list = res.data?.data ?? res.data;
        return Array.isArray(list) && list.length ? list : fallbackEmployees;
      } catch {
        return fallbackEmployees;
      }
    },
  });

  const employees = data ?? fallbackEmployees;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.name, e.email, e.department, e.position].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [employees, search]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "active").length;
    const onLeave = employees.filter((e) => e.status === "on_leave").length;
    const trainingDue = employees.reduce((s, e) => s + e.trainingDue, 0);
    return { total, active, onLeave, trainingDue };
  }, [employees]);

  return (
    <PortalLayout
      title="Human Resources"
      subtitle="Overview of every employee's HR status, leave, payroll & training"
    >
      <div className="space-y-6">
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
              <CardTitle className="text-base font-heading">Employees</CardTitle>
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
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="leave">Leave</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{e.name}</span>
                            <span className="text-xs text-muted-foreground">{e.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{e.department}</TableCell>
                        <TableCell className="text-sm">{e.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyle[e.status]}>
                            {statusLabel[e.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {e.outstandingTasks > 0 ? (
                            <span className="inline-flex items-center gap-1 text-warning text-sm">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {e.outstandingTasks}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="leave" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Balance (days)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-sm">{e.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyle[e.status]}>
                            {statusLabel[e.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{e.leaveBalance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="payroll" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Last Payslip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-sm">{e.department}</TableCell>
                        <TableCell className="text-sm">{e.position}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                            {e.lastPayslip}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="training" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Training Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-sm">{e.department}</TableCell>
                        <TableCell className="text-right">
                          {e.trainingDue > 0 ? (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              {e.trainingDue} pending
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Up to date</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
