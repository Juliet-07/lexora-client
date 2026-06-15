import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Square,
  Coffee,
  Clock,
  MapPin,
  Timer,
  TrendingUp,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  breakStartedAt: string | null;
  hoursWorked: number | null;
  location: string;
  status: string;
}

interface AttendanceStats {
  weekHours: number;
  monthHours: number;
  daysPresent: number;
}

// ─── Helpers ──────────────────────────────────────────────────

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const STATUS_STYLE: Record<string, string> = {
  present: "bg-success/10 text-success border-success/20",
  late: "bg-warning/10 text-warning border-warning/20",
  remote: "bg-info/10 text-info border-info/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  on_leave: "bg-purple-100 text-purple-700 border-purple-200",
};

const STATUS_LABEL: Record<string, string> = {
  present: "Present",
  late: "Late",
  remote: "Remote",
  absent: "Absent",
  on_leave: "On Leave",
};

// ─── Component ────────────────────────────────────────────────

export default function MyTime() {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState("Office");

  // Tick every 30s for elapsed display
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ── Queries ───────────────────────────────────────────────

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

  const { data: stats } = useQuery<AttendanceStats>({
    queryKey: ["employee-attendance-stats"],
    queryFn: async () => {
      const res = await api.get("/employee/attendance/stats");
      return res.data?.data ?? res.data;
    },
    staleTime: 60_000,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<
    AttendanceRecord[]
  >({
    queryKey: ["employee-attendance-history"],
    queryFn: async () => {
      const res = await api.get("/employee/attendance", {
        params: { limit: 20 },
      });
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    staleTime: 60_000,
  });

  // ── Derived clock state ───────────────────────────────────

  const clockedIn = !!activeShift && !activeShift.clockOut;
  const onBreak = clockedIn && !!activeShift?.breakStartedAt;

  const elapsedMins = activeShift?.clockIn
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(activeShift.clockIn).getTime()) / 60000,
        ) - (activeShift.breakMinutes ?? 0),
      )
    : 0;
  const hh = Math.floor(elapsedMins / 60);
  const mm = elapsedMins % 60;

  // ── Mutations ─────────────────────────────────────────────

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["employee-active-shift"] });
    queryClient.invalidateQueries({ queryKey: ["employee-attendance-stats"] });
    queryClient.invalidateQueries({
      queryKey: ["employee-attendance-history"],
    });
  };

  const clockInMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/clock-in", { location }),
    onSuccess: (res) => {
      invalidateAll();
      const record = res.data?.data ?? res.data;
      toast.success(
        `Clocked in at ${fmtTime(record?.clockIn ?? new Date().toISOString())} — ${location}`,
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to clock in"),
  });

  const breakStartMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/break/start", {}),
    onSuccess: () => {
      invalidateAll();
      toast.success("Break started.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to start break"),
  });

  const breakEndMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/break/end", {}),
    onSuccess: () => {
      invalidateAll();
      toast.success("Break ended.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to end break"),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.post("/employee/attendance/clock-out", {}),
    onSuccess: (res) => {
      invalidateAll();
      const record = res.data?.data ?? res.data;
      const hours = record?.hoursWorked ?? 0;
      toast.success(`Clocked out. ${Number(hours).toFixed(1)}h logged today.`);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to clock out"),
  });

  const anyMutating =
    clockInMutation.isPending ||
    breakStartMutation.isPending ||
    breakEndMutation.isPending ||
    clockOutMutation.isPending;

  // ─────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="My Time"
      subtitle="Clock in/out, track breaks and view your attendance history."
    >
      <div className="space-y-6">
        {/* ── Live clock card ── */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Status display */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                    clockedIn
                      ? onBreak
                        ? "bg-amber-500/10"
                        : "bg-success/10"
                      : "bg-muted"
                  }`}
                >
                  <Clock
                    className={`h-7 w-7 ${
                      clockedIn
                        ? onBreak
                          ? "text-amber-600"
                          : "text-success"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {shiftLoading
                      ? "Loading…"
                      : clockedIn
                        ? onBreak
                          ? "On break"
                          : "Currently on shift"
                        : "Not clocked in"}
                  </p>
                  <p className="text-3xl font-bold font-mono">
                    {clockedIn ? `${hh}h ${mm}m` : "0h 0m"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clockedIn ? activeShift?.location : location}
                    {clockedIn && activeShift?.clockIn && (
                      <> · since {fmtTime(activeShift.clockIn)}</>
                    )}
                    {clockedIn && activeShift?.breakMinutes > 0 && (
                      <> · {activeShift.breakMinutes}m break</>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Location selector — only when not clocked in */}
                {!clockedIn && (
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-32 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Field">Field</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {!clockedIn ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
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
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
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
                      {onBreak ? "End Break" : "Start Break"}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
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
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "This Week",
              value: `${stats?.weekHours ?? 0}h`,
              icon: Timer,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "This Month",
              value: `${stats?.monthHours ?? 0}h`,
              icon: TrendingUp,
              color: "from-emerald-500 to-teal-500",
            },
            {
              label: "Days Present",
              value: stats?.daysPresent ?? 0,
              icon: Clock,
              color: "from-violet-500 to-purple-600",
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}
                >
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Attendance history ── */}
        <Tabs defaultValue="log">
          <TabsList>
            <TabsTrigger value="log">Clock Log</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading…</span>
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No attendance records yet. Clock in to start tracking.
                  </p>
                ) : (
                  <div className="space-y-0">
                    {history.map((rec) => (
                      <div
                        key={rec._id}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        {/* Date + location */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {fmtDate(rec.date)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {rec.location}
                          </p>
                        </div>

                        {/* Clock times — hidden on small screens */}
                        <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                          <div className="text-center">
                            <p>In</p>
                            <p className="font-mono text-sm text-foreground">
                              {fmtTime(rec.clockIn)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p>Out</p>
                            <p className="font-mono text-sm text-foreground">
                              {rec.clockOut ? fmtTime(rec.clockOut) : "—"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p>Break</p>
                            <p className="font-mono text-sm text-foreground">
                              {rec.breakMinutes}m
                            </p>
                          </div>
                          <div className="text-center">
                            <p>Hours</p>
                            <p className="font-mono text-sm text-foreground">
                              {rec.hoursWorked != null
                                ? Number(rec.hoursWorked).toFixed(1)
                                : rec.clockOut
                                  ? "—"
                                  : "live"}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${STATUS_STYLE[rec.status] ?? ""}`}
                        >
                          {STATUS_LABEL[rec.status] ?? rec.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
