import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Plus,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

interface LeaveBalance {
  type: string;
  label: string;
  daysAllowed: number;
  daysUsed: number;
  daysLeft: number;
}

interface LeaveRequest {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────

const LEAVE_TYPES = [
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "maternity", label: "Maternity" },
  { value: "paternity", label: "Paternity" },
  { value: "compassionate", label: "Compassionate" },
  { value: "study", label: "Study" },
  { value: "unpaid", label: "Unpaid" },
];

const typeLabel = (type: string) =>
  LEAVE_TYPES.find((t) => t.value === type)?.label ?? type;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  cancelled: XCircle,
};

const BALANCE_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-red-500",
  "from-pink-500 to-pink-600",
  "from-violet-500 to-purple-600",
];

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

// ─── Component ────────────────────────────────────────────────

export default function MyLeave() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const setF = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Fetch leave balances ──────────────────────────────────
  const { data: balanceData, isLoading: balanceLoading } = useQuery<{
    balances: LeaveBalance[];
  }>({
    queryKey: ["employee-leave-balance"],
    queryFn: async () => {
      const res = await api.get("/employee/leave/balance");
      return res.data?.data ?? res.data;
    },
    staleTime: 60_000,
  });

  // ── Fetch leave history ───────────────────────────────────
  const { data: history = [], isLoading: historyLoading } = useQuery<
    LeaveRequest[]
  >({
    queryKey: ["employee-leave-history"],
    queryFn: async () => {
      const res = await api.get("/employee/leave");
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    staleTime: 30_000,
  });

  // ── Submit leave request ──────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: () =>
      api.post("/employee/leave", {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-leave-history"] });
      queryClient.invalidateQueries({ queryKey: ["employee-leave-balance"] });
      setOpen(false);
      setForm({ type: "annual", startDate: "", endDate: "", reason: "" });
      toast.success(
        "Leave request submitted. You will be notified once reviewed.",
      );
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Failed to submit leave request",
      ),
  });

  // ── Cancel leave request ──────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/employee/leave/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-leave-history"] });
      toast.success("Leave request cancelled.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to cancel request"),
  });

  const balances = balanceData?.balances ?? [];

  // Show only first 4 balances in the top cards
  const displayBalances = balances.slice(0, 4);

  const canSubmit =
    !!form.type &&
    !!form.startDate &&
    !!form.endDate &&
    !!form.reason.trim() &&
    !submitMutation.isPending;

  // ─────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="My Leave"
      subtitle="Balances, requests & team calendar"
    >
      <div className="space-y-6">
        {/* Balance cards header + apply button */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Leave Balances
          </h2>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Apply for Leave
          </Button>
        </div>

        {/* Balance cards */}
        {balanceLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading balances…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayBalances.map((b, i) => (
              <Card key={b.type}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {b.label}
                    </p>
                    <div
                      className={`h-7 w-7 rounded-md bg-gradient-to-br ${
                        BALANCE_COLORS[i % BALANCE_COLORS.length]
                      } flex items-center justify-center`}
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold">
                    {b.daysLeft}
                    <span className="text-sm text-muted-foreground font-normal">
                      {" "}
                      / {b.daysAllowed}
                    </span>
                  </p>
                  <Progress
                    value={
                      b.daysAllowed > 0 ? (b.daysUsed / b.daysAllowed) * 100 : 0
                    }
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    {b.daysUsed} day{b.daysUsed !== 1 ? "s" : ""} used
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Requests tabs */}
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="team">Team Calendar</TabsTrigger>
          </TabsList>

          {/* My requests */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leave Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading…</span>
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No leave requests yet. Click "Apply for Leave" to submit
                    one.
                  </p>
                ) : (
                  history.map((r) => {
                    const StatusIcon = STATUS_ICON[r.status] ?? Clock;
                    return (
                      <div
                        key={r._id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">
                              {typeLabel(r.type)} Leave
                            </p>
                            <Badge
                              variant="outline"
                              className={STATUS_STYLE[r.status] ?? ""}
                            >
                              <StatusIcon className="h-3 w-3 mr-1 inline" />
                              <span className="capitalize">{r.status}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {r.days} day{r.days !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {fmt(r.startDate)} → {fmt(r.endDate)}
                          </p>
                          {r.reason && (
                            <p className="text-xs mt-1 text-muted-foreground">
                              {r.reason}
                            </p>
                          )}
                          {r.reviewNote && (
                            <p className="text-xs text-destructive mt-1">
                              Note: {r.reviewNote}
                            </p>
                          )}
                        </div>
                        {r.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(r._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team calendar — placeholder until team visibility endpoint built */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> Team Leave Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-6">
                  Team leave calendar will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Apply for Leave Dialog ── */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v)
            setForm({ type: "annual", startDate: "", endDate: "", reason: "" });
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Type */}
            <div>
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={form.type} onValueChange={(v) => setF("type", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  From <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={form.startDate}
                  onChange={(e) => setF("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>
                  To <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => setF("endDate", e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label>
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                placeholder="Brief reason for your leave request…"
                value={form.reason}
                onChange={(e) => setF("reason", e.target.value)}
              />
            </div>

            {/* Sick leave note */}
            {form.type === "sick" && (
              <div>
                <Label>Medical certificate</Label>
                <Input type="file" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for sick leave longer than 2 days
                </p>
              </div>
            )}

            {/* Balance hint */}
            {form.type &&
              (() => {
                const b = balances.find((x) => x.type === form.type);
                if (!b || b.daysLeft >= 999) return null;
                return (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                    {b.label} balance: <strong>{b.daysLeft}</strong> of{" "}
                    {b.daysAllowed} days remaining
                  </p>
                );
              })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
