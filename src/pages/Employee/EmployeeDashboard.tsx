import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Wallet,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Inbox,
  LogIn,
  LogOut,
  Coffee,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/lib/api";

interface AttendanceRecord {
  _id: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  breakStartedAt: string | null;
  hoursWorked: number | null;
  location: string;
  status: string;
}

interface LeaveBalance {
  type: string;
  label: string;
  entitled: number;
  used: number;
  remaining: number;
}

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const BALANCE_DISPLAY = ["annual", "sick", "compassionate"];
const BALANCE_LABEL: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  compassionate: "Compassionate",
};

const NOTIFICATIONS = [
  { text: "Your leave request (Jun 12 – Jun 14) was approved", time: "2h ago" },
  { text: "May payslip is now available", time: "1d ago" },
  { text: "New e-learning module assigned: Data Privacy", time: "2d ago" },
];

export default function EmployeeDashboard() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const firstName = user?.firstName ?? "there";

  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState("Office");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Fetch active shift — null means not clocked in
  const { data: activeShift, isLoading: shiftLoading } =
    useQuery<AttendanceRecord | null>({
      queryKey: ["employee-active-shift"],
      queryFn: async () => {
        const res = await api.get("/employee/attendance/active");
        return res.data?.data ?? res.data ?? null;
      },
      staleTime: 30_000,
      refetchInterval: 60_000,
    });

  // Fetch leave balances
  const { data: balanceData } = useQuery<{ balances: LeaveBalance[] }>({
    queryKey: ["employee-leave-balance"],
    queryFn: async () => {
      const res = await api.get("/employee/leave/balance");
      return res.data?.data ?? res.data;
    },
    staleTime: 5 * 60_000,
  });

  const allBalances = balanceData?.balances ?? [];
  const annualRemaining =
    allBalances.find((b) => b.type === "annual")?.remaining ?? 0;
  const displayBalances = allBalances.filter((b) =>
    BALANCE_DISPLAY.includes(b.type),
  );

  // clockedIn = open shift exists (clockOut is null)
  const clockedIn = !!activeShift && activeShift.clockOut === null;
  const onBreak = clockedIn && !!activeShift?.breakStartedAt;

  const elapsedMins =
    clockedIn && activeShift?.clockIn
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - new Date(activeShift.clockIn).getTime()) / 60000,
          ) - (activeShift.breakMinutes ?? 0),
        )
      : 0;
  const hh = Math.floor(elapsedMins / 60);
  const mm = elapsedMins % 60;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["employee-active-shift"] });

  const clockInMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/clock-in", { location }),
    onSuccess: (res) => {
      invalidate();
      const r = res.data?.data ?? res.data;
      toast.success(
        `Clocked in at ${fmtTime(r?.clockIn ?? new Date().toISOString())} — ${location}`,
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to clock in"),
  });

  const breakStartMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/break/start", {}),
    onSuccess: () => {
      invalidate();
      toast.success("Break started.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed"),
  });

  const breakEndMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/break/end", {}),
    onSuccess: () => {
      invalidate();
      toast.success("Break ended.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed"),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/clock-out", {}),
    onSuccess: (res) => {
      invalidate();
      const r = res.data?.data ?? res.data;
      toast.success(
        `Clocked out. ${Number(r?.hoursWorked ?? 0).toFixed(1)}h logged today.`,
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to clock out"),
  });

  const anyMutating =
    clockInMutation.isPending ||
    breakStartMutation.isPending ||
    breakEndMutation.isPending ||
    clockOutMutation.isPending;

  return (
    <PortalLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Here's what's happening with your employment today"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Leave Balance"
            value={String(annualRemaining)}
            subtitle="Annual days remaining"
            icon={CalendarDays}
            variant="primary"
          />
          <StatCard
            title="Next Payslip"
            value="Jun 28"
            subtitle="Auto-generated"
            icon={Wallet}
            variant="success"
          />
          <StatCard
            title="Training Due"
            value="2"
            subtitle="1 overdue"
            icon={GraduationCap}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">
                Time & Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-card space-y-3">
                {shiftLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking shift
                    status…
                  </div>
                ) : (
                  <>
                    {/* Status line */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        You are currently
                      </p>
                      <p className="text-lg font-heading font-bold">
                        {!clockedIn
                          ? "Clocked out"
                          : onBreak
                            ? "On break"
                            : `Clocked in — ${hh}h ${mm}m`}
                      </p>
                      {clockedIn && activeShift?.clockIn && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {activeShift.location} · since{" "}
                          {fmtTime(activeShift.clockIn)}
                          {(activeShift.breakMinutes ?? 0) > 0 && (
                            <span className="ml-1">
                              · {activeShift.breakMinutes}m break
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* NOT clocked in → location picker + Clock In button */}
                    {!clockedIn && (
                      <>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Field">Field</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          className="w-full gradient-primary"
                          disabled={anyMutating}
                          onClick={() => clockInMutation.mutate()}
                        >
                          {clockInMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <LogIn className="h-4 w-4 mr-2" />
                          )}
                          Clock In
                        </Button>
                      </>
                    )}

                    {/* Clocked in → Break + Clock Out buttons */}
                    {clockedIn && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={anyMutating}
                          onClick={() =>
                            onBreak
                              ? breakEndMutation.mutate()
                              : breakStartMutation.mutate()
                          }
                        >
                          {breakStartMutation.isPending ||
                          breakEndMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Coffee className="h-4 w-4 mr-2" />
                          )}
                          {onBreak ? "End Break" : "Break"}
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={anyMutating}
                          onClick={() => clockOutMutation.mutate()}
                        >
                          {clockOutMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4 mr-2" />
                          )}
                          Clock Out
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Leave balance bars */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Leave Balances
                </p>
                {displayBalances.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Loading balances…
                  </p>
                ) : (
                  displayBalances.map((b) => (
                    <div key={b.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">
                          {BALANCE_LABEL[b.type] ?? b.label}
                        </span>
                        <span className="text-muted-foreground">
                          {b.remaining} / {b.entitled} days
                        </span>
                      </div>
                      <Progress
                        value={b.entitled > 0 ? (b.used / b.entitled) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Inbox className="h-4 w-4" /> Recent Notifications
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary text-xs"
                >
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.text}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{n.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
