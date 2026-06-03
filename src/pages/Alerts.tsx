import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Bell,
  Clock,
  Loader2,
  MessageSquare,
  ChevronRight,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

// ─────────────────────────────────────────────────────────────
// TYPES — matching backend schema exactly
// ─────────────────────────────────────────────────────────────

type AlertSeverity = "low" | "medium" | "high" | "critical";
type AlertStatus =
  | "open"
  | "acknowledged"
  | "reviewed"
  | "dismissed"
  | "escalated";
type AlertType =
  | "sanctions_hit"
  | "pep_match"
  | "adverse_media"
  | "high_risk_client"
  | "review_overdue"
  | "ubo_flagged"
  | "transaction_flag"
  | "watchlist_hit"
  | "manual";

interface ClientResponse {
  note: string;
  documentUrl: string | null;
  acknowledgedAt: string;
  respondedAt: string;
}

interface Alert {
  _id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  clientResponse: ClientResponse | null;
  reviewNote: string | null;
  createdAt: string;
}

interface AlertsResponse {
  summary: {
    total: number;
    open: number;
    acknowledged: number;
    resolved: number;
  };
  alerts: Alert[];
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const typeLabels: Record<AlertType, string> = {
  sanctions_hit: "Sanctions Match",
  pep_match: "PEP Match",
  adverse_media: "Adverse Media",
  high_risk_client: "High Risk",
  review_overdue: "Review Overdue",
  ubo_flagged: "UBO Flagged",
  transaction_flag: "Transaction Flag",
  watchlist_hit: "Watchlist Hit",
  manual: "Compliance Alert",
};

const typeIcons: Record<AlertType, typeof Bell> = {
  sanctions_hit: ShieldAlert,
  pep_match: ShieldAlert,
  adverse_media: AlertTriangle,
  high_risk_client: ShieldAlert,
  review_overdue: Clock,
  ubo_flagged: ShieldAlert,
  transaction_flag: AlertTriangle,
  watchlist_hit: ShieldAlert,
  manual: Bell,
};

const severityConfig: Record<
  AlertSeverity,
  { iconClass: string; badgeClass: string; label: string }
> = {
  critical: {
    iconClass: "bg-destructive/10 text-destructive border-destructive/20",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Critical",
  },
  high: {
    iconClass: "bg-orange-500/10 text-orange-600 border-orange-200",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-200",
    label: "High",
  },
  medium: {
    iconClass: "bg-warning/10 text-warning border-warning/20",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    label: "Medium",
  },
  low: {
    iconClass: "bg-info/10 text-info border-info/20",
    badgeClass: "bg-info/10 text-info border-info/20",
    label: "Low",
  },
};

const statusConfig: Record<AlertStatus, { label: string; class: string }> = {
  open: {
    label: "Action Required",
    class: "bg-destructive/10 text-destructive border-destructive/20",
  },
  acknowledged: {
    label: "Awaiting Review",
    class: "bg-warning/10 text-warning border-warning/20",
  },
  reviewed: {
    label: "Reviewed",
    class: "bg-success/10 text-success border-success/20",
  },
  dismissed: {
    label: "Dismissed",
    class: "bg-muted text-muted-foreground border-border",
  },
  escalated: {
    label: "Escalated",
    class: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
};

const isResolved = (status: AlertStatus) =>
  status === "reviewed" || status === "dismissed" || status === "escalated";

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"all" | "open" | "resolved">("all");
  const [respondingTo, setRespondingTo] = useState<Alert | null>(null);
  const [responseNote, setResponseNote] = useState("");
  const [responseDocUrl, setResponseDocUrl] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch alerts ──────────────────────────────────────────
  const { data, isLoading } = useQuery<AlertsResponse>({
    queryKey: ["client-alerts"],
    queryFn: async () => {
      const res = await api.get("/client/alerts");
      return res.data?.data ?? res.data;
    },
    staleTime: 30_000,
  });

  const summary = data?.summary ?? {
    total: 0,
    open: 0,
    acknowledged: 0,
    resolved: 0,
  };
  const alerts = data?.alerts ?? [];

  // ── Filter alerts by tab ──────────────────────────────────
  const filtered = alerts.filter((a) => {
    if (tab === "open")
      return a.status === "open" || a.status === "acknowledged";
    if (tab === "resolved") return isResolved(a.status);
    return true;
  });

  // ── Respond mutation ──────────────────────────────────────
  const respondMutation = useMutation({
    mutationFn: (alertId: string) =>
      api.post(`/client/alerts/${alertId}/respond`, {
        note: responseNote,
        documentUrl: responseDocUrl.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-alerts"] });
      toast({
        title: "Response submitted",
        description:
          "Your response has been sent to your compliance officer for review.",
      });
      setRespondingTo(null);
      setResponseNote("");
      setResponseDocUrl("");
    },
    onError: (err: any) => {
      toast({
        title: "Failed to submit response",
        description: err?.response?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRespond = () => {
    if (!responseNote.trim() || responseNote.trim().length < 10) {
      toast({
        title: "Response too short",
        description: "Please provide at least 10 characters.",
        variant: "destructive",
      });
      return;
    }
    if (respondingTo) respondMutation.mutate(respondingTo._id);
  };

  const openRespondDialog = (alert: Alert) => {
    setRespondingTo(alert);
    setResponseNote("");
    setResponseDocUrl("");
  };

  // ─────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="Compliance Alerts"
      subtitle={
        summary.open > 0
          ? `${summary.open} alert${summary.open === 1 ? "" : "s"} require your attention`
          : "No alerts requiring action"
      }
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ── Summary stats ── */}
        {!isLoading && summary.total > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Require Action",
                value: summary.open,
                color: "text-destructive",
              },
              {
                label: "Awaiting Review",
                value: summary.acknowledged,
                color: "text-warning",
              },
              {
                label: "Resolved",
                value: summary.resolved,
                color: "text-success",
              },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">
              All
              {summary.total > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs">
                  {summary.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="open">
              Active
              {summary.open + summary.acknowledged > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive/10 text-destructive px-1.5 text-xs">
                  {summary.open + summary.acknowledged}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved
              {summary.resolved > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs">
                  {summary.resolved}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Compliance Alerts &amp; Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading alerts…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-success" />
                    {tab === "open"
                      ? "No active alerts — you're all clear."
                      : "No alerts to show."}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filtered.map((alert) => {
                      const Icon = typeIcons[alert.type] ?? Bell;
                      const sev = severityConfig[alert.severity];
                      const stat = statusConfig[alert.status];
                      const expanded = expandedId === alert._id;

                      return (
                        <div key={alert._id} className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${sev.iconClass}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-sm font-semibold">
                                  {alert.title}
                                </p>
                                <Badge
                                  className={`text-[10px] border ${sev.badgeClass}`}
                                >
                                  {sev.label}
                                </Badge>
                                <Badge
                                  className={`text-[10px] border ${stat.class}`}
                                >
                                  {stat.label}
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground mb-2">
                                {alert.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground mb-3">
                                <span>{typeLabels[alert.type]}</span>
                                <span>·</span>
                                <span>
                                  {format(
                                    parseISO(alert.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>

                              {/* Client's submitted response — show when acknowledged+ */}
                              {alert.clientResponse && (
                                <div
                                  className="mb-3 rounded-lg border bg-muted/30 p-3 cursor-pointer"
                                  onClick={() =>
                                    setExpandedId(expanded ? null : alert._id)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium flex items-center gap-1.5">
                                      <MessageSquare className="h-3 w-3" />
                                      Your response submitted{" "}
                                      {format(
                                        parseISO(
                                          alert.clientResponse.respondedAt,
                                        ),
                                        "MMM d, yyyy",
                                      )}
                                    </p>
                                    <ChevronRight
                                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
                                    />
                                  </div>
                                  {expanded && (
                                    <div className="mt-2 space-y-1.5">
                                      <p className="text-xs text-muted-foreground">
                                        {alert.clientResponse.note}
                                      </p>
                                      {alert.clientResponse.documentUrl && (
                                        <a
                                          href={
                                            alert.clientResponse.documentUrl
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                                        >
                                          <FileText className="h-3 w-3" />
                                          View attached document
                                          <ArrowUpRight className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Tenant review note — show when resolved */}
                              {alert.reviewNote && isResolved(alert.status) && (
                                <div className="mb-3 rounded-lg border border-success/20 bg-success/5 p-3">
                                  <p className="text-xs font-medium text-success mb-1 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Resolution from your compliance officer
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {alert.reviewNote}
                                  </p>
                                </div>
                              )}

                              {/* Action buttons */}
                              {alert.status === "open" && (
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-primary to-secondary"
                                  onClick={() => openRespondDialog(alert)}
                                >
                                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                  Acknowledge &amp; Respond
                                </Button>
                              )}

                              {alert.status === "acknowledged" && (
                                <p className="text-xs text-warning flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  Your response is under review by your
                                  compliance officer.
                                </p>
                              )}

                              {alert.status === "escalated" && (
                                <p className="text-xs text-orange-600 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3 w-3" />
                                  This matter has been escalated for further
                                  review. Please contact your advisor.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Respond dialog ── */}
      <Dialog
        open={!!respondingTo}
        onOpenChange={(open) => {
          if (!open) setRespondingTo(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Alert</DialogTitle>
          </DialogHeader>

          {respondingTo && (
            <div className="space-y-4">
              {/* Alert summary */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{respondingTo.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {respondingTo.description}
                </p>
              </div>

              {/* Response note */}
              <div className="space-y-1.5">
                <Label>
                  Your Response <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  rows={5}
                  placeholder="Provide your explanation, clarification, or any supporting context for this alert. Minimum 10 characters."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {responseNote.length} characters
                  {responseNote.length < 10 && responseNote.length > 0 && (
                    <span className="text-destructive ml-1">(minimum 10)</span>
                  )}
                </p>
              </div>

              {/* Optional document URL */}
              <div className="space-y-1.5">
                <Label>Supporting Document URL (optional)</Label>
                <Input
                  placeholder="https://… paste a link to a supporting document"
                  value={responseDocUrl}
                  onChange={(e) => setResponseDocUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a link to an uploaded document if relevant.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRespondingTo(null)}
              disabled={respondMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={handleRespond}
              disabled={
                respondMutation.isPending || responseNote.trim().length < 10
              }
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
