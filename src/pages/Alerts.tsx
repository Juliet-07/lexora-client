import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Receipt,
  ShieldAlert,
  Bell,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format, isPast, parseISO } from "date-fns";

type AlertSeverity = "info" | "warning" | "critical" | "success";
type AlertStatus = "pending" | "acknowledged" | "resolved";
type AlertCategory =
  | "tax"
  | "compliance"
  | "document"
  | "billing"
  | "general";

interface ClientAlert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  dueDate?: string;
  createdAt: string;
  createdBy?: string;
}

const categoryIcon: Record<AlertCategory, typeof Bell> = {
  tax: Receipt,
  compliance: ShieldAlert,
  document: FileText,
  billing: Receipt,
  general: Bell,
};

const severityStyles: Record<AlertSeverity, string> = {
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-success/10 text-success border-success/20",
};

const severityBadge: Record<AlertSeverity, "default" | "secondary" | "destructive" | "outline"> = {
  info: "secondary",
  warning: "default",
  critical: "destructive",
  success: "outline",
};

const fallbackAlerts: ClientAlert[] = [
  {
    id: "a1",
    title: "Annual Tax Filing Due",
    description:
      "Your annual corporate tax return must be filed before the deadline. Please upload supporting documents.",
    category: "tax",
    severity: "critical",
    status: "pending",
    dueDate: "2026-06-30",
    createdAt: "2026-05-20T09:00:00Z",
    createdBy: "Compliance Team",
  },
  {
    id: "a2",
    title: "VAT Return Reminder",
    description: "Quarterly VAT return for Q2 2026 is approaching.",
    category: "tax",
    severity: "warning",
    status: "pending",
    dueDate: "2026-07-15",
    createdAt: "2026-05-22T10:30:00Z",
    createdBy: "Tax Advisor",
  },
  {
    id: "a3",
    title: "KYC Refresh Required",
    description:
      "Please re-verify your beneficial ownership information as part of our annual compliance review.",
    category: "compliance",
    severity: "warning",
    status: "acknowledged",
    dueDate: "2026-08-01",
    createdAt: "2026-05-10T14:00:00Z",
    createdBy: "Compliance Team",
  },
  {
    id: "a4",
    title: "Engagement Letter Countersigned",
    description: "Your signed engagement letter has been received and filed.",
    category: "document",
    severity: "success",
    status: "resolved",
    createdAt: "2026-04-12T08:00:00Z",
    createdBy: "Admin",
  },
];

export default function Alerts() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "pending" | "resolved">("all");

  const { data: alerts = fallbackAlerts, isLoading } = useQuery<ClientAlert[]>({
    queryKey: ["client-alerts"],
    queryFn: async () => {
      try {
        const res = await api.get("/alerts");
        const payload = res.data?.data ?? res.data;
        return Array.isArray(payload) && payload.length ? payload : fallbackAlerts;
      } catch {
        return fallbackAlerts;
      }
    },
  });

  const setStatus = (id: string, status: AlertStatus) => {
    queryClient.setQueryData<ClientAlert[]>(["client-alerts"], (prev) =>
      (prev ?? []).map((a) => (a.id === id ? { ...a, status } : a)),
    );
    api.patch(`/alerts/${id}`, { status }).catch(() => {});
    toast({
      title: status === "acknowledged" ? "Alert acknowledged" : "Alert resolved",
    });
  };

  const filtered = useMemo(() => {
    if (tab === "all") return alerts;
    if (tab === "pending")
      return alerts.filter((a) => a.status !== "resolved");
    return alerts.filter((a) => a.status === "resolved");
  }, [alerts, tab]);

  const pendingCount = alerts.filter((a) => a.status !== "resolved").length;

  return (
    <PortalLayout
      title="Alerts"
      subtitle={`${pendingCount} active ${pendingCount === 1 ? "alert" : "alerts"} from your account manager`}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="pending">Active ({pendingCount})</TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({alerts.length - pendingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card className="animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">
                  Alerts &amp; Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading alerts…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No alerts to show.
                  </div>
                ) : (
                  <div className="divide-y">
                    {filtered.map((alert) => {
                      const Icon = categoryIcon[alert.category] ?? Bell;
                      const overdue =
                        alert.dueDate &&
                        alert.status !== "resolved" &&
                        isPast(parseISO(alert.dueDate));
                      return (
                        <div
                          key={alert.id}
                          className="flex items-start gap-4 p-4 hover:bg-accent/20 transition-colors"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${severityStyles[alert.severity]}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-foreground">
                                {alert.title}
                              </p>
                              <Badge
                                variant={severityBadge[alert.severity]}
                                className="text-[10px] uppercase"
                              >
                                {alert.severity}
                              </Badge>
                              {alert.status === "resolved" && (
                                <Badge variant="outline" className="text-[10px]">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                              {alert.status === "acknowledged" && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Acknowledged
                                </Badge>
                              )}
                              {overdue && (
                                <Badge variant="destructive" className="text-[10px]">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              {alert.dueDate && (
                                <span className="inline-flex items-center gap-1">
                                  <CalendarClock className="h-3 w-3" />
                                  Due {format(parseISO(alert.dueDate), "MMM d, yyyy")}
                                </span>
                              )}
                              {alert.createdBy && <span>From {alert.createdBy}</span>}
                              <span>
                                Created{" "}
                                {format(parseISO(alert.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            {alert.status !== "resolved" && (
                              <div className="flex gap-2 mt-3">
                                {alert.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setStatus(alert.id, "acknowledged")}
                                  >
                                    Acknowledge
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => setStatus(alert.id, "resolved")}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Mark Resolved
                                </Button>
                              </div>
                            )}
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
    </PortalLayout>
  );
}
