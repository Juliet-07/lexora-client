import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderOpen,
  AlertCircle,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  Upload,
  CreditCard,
  LifeBuoy,
  Inbox,
  ShieldCheck,
  ShieldAlert,
  Star,
  Bell,
  Loader2,
} from "lucide-react";
import { fetchDashboard } from "@/lib/dashboard-api";
import { fetchUnreadCount } from "@/lib/notifications-api";
import { stageStyles } from "@/lib/projects-api";
import { statusStyles as ticketStatusStyles } from "@/lib/service-desk-api";

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-info/10 text-info border-info/20",
};

const actionIcon: Record<string, typeof Upload> = {
  form: CheckCircle2,
  signature: FileText,
  payment: CreditCard,
  compliance: ShieldAlert,
};
const actionTone: Record<string, string> = {
  form: "bg-info/10 text-info",
  signature: "bg-secondary/10 text-secondary",
  payment: "bg-warning/10 text-warning",
  compliance: "bg-destructive/10 text-destructive",
};

const bannerTone: Record<string, string> = {
  info: "border-info/20",
  warning: "border-warning/20",
  success: "border-success/20",
  error: "border-destructive/20",
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

const money = (n: number, currency: string) =>
  `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function Index() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: fetchDashboard,
  });
  const { data: unread } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
  });

  if (isLoading || !dashboard) {
    return (
      <PortalLayout title="Dashboard" subtitle="Loading…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  const {
    onboarding,
    stats,
    projects,
    invoices,
    tickets,
    alerts,
    pendingActions,
    recentActivity,
    newsletters,
  } = dashboard;
  const urgent = pendingActions.filter((a) => a.urgent).length;
  const outstandingEntries = Object.entries(stats.outstandingByCurrency);

  return (
    <PortalLayout
      title="Dashboard"
      subtitle="Everything happening across your engagements"
    >
      <div className="space-y-6">
        {/* Onboarding / account status banner — hidden once fully approved,
            since it stops being actionable at that point */}
        {onboarding.status !== "approved" && (
          <Card
            className={`animate-fade-in overflow-hidden ${bannerTone[onboarding.banner.type]}`}
          >
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading font-bold text-foreground">
                      {onboarding.banner.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {onboarding.banner.message}
                  </p>
                  {onboarding.completionPercent > 0 && (
                    <Progress
                      value={onboarding.completionPercent}
                      className="mt-2 h-1.5 w-48"
                    />
                  )}
                </div>
              </div>
              {onboarding.banner.action && onboarding.banner.link && (
                <Button asChild variant="outline" size="sm">
                  <Link to={onboarding.banner.link}>
                    {onboarding.banner.action}{" "}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active projects"
            value={String(stats.activeProjectCount)}
            subtitle={`${projects.length} shown below`}
            icon={FolderOpen}
            variant="primary"
          />
          <StatCard
            title="Pending actions"
            value={String(pendingActions.length)}
            subtitle={`${urgent} urgent`}
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="Outstanding balance"
            value={
              outstandingEntries.length
                ? outstandingEntries.map(([c, n]) => money(n, c)).join(", ")
                : "None due"
            }
            subtitle={`${stats.openInvoiceCount} invoice${stats.openInvoiceCount === 1 ? "" : "s"} due`}
            icon={CreditCard}
            variant="success"
          />
          <StatCard
            title="Open tickets"
            value={String(stats.openTicketCount)}
            subtitle="Service desk"
            icon={LifeBuoy}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Projects */}
          <Card className="animate-fade-in lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base">
                  Active projects
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  <Link to="/projects">
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {project.ref}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {project.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Due{" "}
                          {new Date(project.targetDate).toLocaleDateString()}
                        </span>
                        <span>{project.manager}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={stageStyles[project.stage]}
                    >
                      {project.stage}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-medium text-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                </Link>
              ))}
              {!projects.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No projects yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                Needs your attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingActions.map((action, i) => {
                const Icon = actionIcon[action.type] ?? Upload;
                return (
                  <Link
                    key={i}
                    to={action.to}
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        actionTone[action.type] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {action.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.context}
                      </p>
                      {action.urgent && (
                        <p className="text-[10px] font-medium uppercase text-destructive">
                          Urgent
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })}
              {!pendingActions.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nothing needs your attention right now.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Alerts */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base">
                  Compliance alerts
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  <Link to="/alerts">All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Raised {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      severityStyles[alert.severity] ?? severityStyles.low
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
              {!alerts.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No open alerts.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base">
                  Billing
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  <Link to="/payments">Pay</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {invoices.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Invoice {inv.ref}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.stage === "Paid" ? "Paid" : "Due"}{" "}
                        {new Date(inv.dueOn).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {money(inv.payable, inv.currency)}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          inv.stage === "Paid"
                            ? "bg-success/10 text-success border-success/20"
                            : inv.stage === "Overdue"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {inv.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!invoices.length && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No invoices yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base">
                  Service desk
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  <Link to="/service-desk">Open</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tickets.map((t) => (
                <div key={t._id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.ref}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {timeAgo(t.updatedAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        ticketStatusStyles[
                          t.status as keyof typeof ticketStatusStyles
                        ]
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                  {t.status === "Closed" && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-warning" /> Rate this
                      resolution
                    </p>
                  )}
                </div>
              ))}
              {!tickets.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No tickets yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity */}
          <Card className="animate-fade-in lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.meta} · {timeAgo(item.at)}
                      </p>
                    </div>
                  </div>
                ))}
                {!recentActivity.length && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Newsletters + notifications shortcut */}
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-base">
                    Newsletters
                  </CardTitle>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary"
                  >
                    <Link to="/newsletters">All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {newsletters.map((n) => (
                  <Link
                    key={n._id}
                    to="/newsletters"
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {n.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.opened && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}
                {!newsletters.length && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No newsletters yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {unread?.count
                      ? `${unread.count} new notification${unread.count === 1 ? "" : "s"}`
                      : "No new notifications"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Document requests and status updates
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/notifications">Open</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
