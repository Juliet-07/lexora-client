import { Link } from "react-router-dom";
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
  CalendarDays,
  ShieldCheck,
  Star,
  Bell,
} from "lucide-react";

/* ── Dummy data — API integration comes later ───────────────── */

const onboarding = {
  status: "under_review" as const,
  completion: 100,
  submittedOn: "Aug 12, 2026",
  classification: "Corporate",
};

const projects = [
  {
    id: "1",
    ref: "MND-1042",
    name: "Tax Filing 2026",
    stage: "Deliver",
    progress: 65,
    manager: "Sarah Kagame",
    dueDate: "Apr 30, 2026",
  },
  {
    id: "2",
    ref: "MND-1051",
    name: "Company Secretarial Review",
    stage: "Review",
    progress: 90,
    manager: "Eric Nsengi",
    dueDate: "Sep 15, 2026",
  },
  {
    id: "3",
    ref: "MND-1063",
    name: "Annual Compliance Audit",
    stage: "Setup",
    progress: 12,
    manager: "Alice Uwase",
    dueDate: "Jun 30, 2026",
  },
];

const stageStyles: Record<string, string> = {
  Create: "bg-muted text-muted-foreground border-border",
  Setup: "bg-muted text-muted-foreground border-border",
  Deliver: "bg-info/10 text-info border-info/20",
  Review: "bg-warning/10 text-warning border-warning/20",
  Bill: "bg-warning/10 text-warning border-warning/20",
  Close: "bg-success/10 text-success border-success/20",
};

const pendingActions = [
  {
    title: "Upload Proof of Address",
    context: "Onboarding · Identification",
    type: "document",
    urgent: true,
    to: "/onboarding",
  },
  {
    title: "Sign Engagement Letter addendum",
    context: "MND-1042 · Tax Filing 2026",
    type: "signature",
    urgent: true,
    to: "/documents",
  },
  {
    title: "Settle Invoice #1042",
    context: "RWF 1,250,000 · due in 4 days",
    type: "payment",
    urgent: false,
    to: "/payments",
  },
  {
    title: "Confirm audit kick-off date",
    context: "MND-1063 · Annual Compliance",
    type: "form",
    urgent: false,
    to: "/projects/3",
  },
];

const alerts = [
  {
    title: "VAT return due",
    category: "Tax",
    due: "Aug 20, 2026",
    severity: "high",
  },
  {
    title: "Beneficial owner register update",
    category: "Compliance",
    due: "Sep 01, 2026",
    severity: "medium",
  },
  {
    title: "PAYE remittance",
    category: "Tax",
    due: "Sep 10, 2026",
    severity: "low",
  },
];

const severityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-info/10 text-info border-info/20",
};

const invoices = [
  { ref: "#1042", amount: "RWF 1,250,000", status: "Due", due: "Aug 23, 2026" },
  { ref: "#1039", amount: "RWF 640,000", status: "Paid", due: "Jul 28, 2026" },
  { ref: "#1035", amount: "RWF 980,000", status: "Paid", due: "Jun 30, 2026" },
];

const tickets = [
  {
    ref: "SD-318",
    subject: "Access to prior year filings",
    status: "In Progress",
    updated: "2h ago",
  },
  {
    ref: "SD-311",
    subject: "Add second authorised signatory",
    status: "Awaiting feedback",
    updated: "1d ago",
  },
  {
    ref: "SD-303",
    subject: "Payment receipt not received",
    status: "Closed",
    updated: "4d ago",
  },
];

const ticketStyles: Record<string, string> = {
  "In Progress": "bg-info/10 text-info border-info/20",
  "Awaiting feedback": "bg-warning/10 text-warning border-warning/20",
  Closed: "bg-success/10 text-success border-success/20",
};

const activity = [
  {
    icon: Upload,
    text: "You uploaded Bank_Statement_Q2.pdf",
    meta: "MND-1042 · 3h ago",
  },
  {
    icon: FileText,
    text: "Sarah K. shared Draft tax computation",
    meta: "MND-1042 · 6h ago",
  },
  {
    icon: CreditCard,
    text: "Invoice #1039 marked as paid",
    meta: "Payments · yesterday",
  },
  {
    icon: LifeBuoy,
    text: "Ticket SD-303 closed — feedback requested",
    meta: "Service Desk · 4d ago",
  },
  {
    icon: ShieldCheck,
    text: "KYC submission received for review",
    meta: "Onboarding · Aug 12",
  },
];

const newsletters = [
  {
    title: "Q3 Tax Bulletin: what changes in September",
    date: "Aug 15, 2026",
    unread: true,
  },
  {
    title: "New e-invoicing rules explained",
    date: "Aug 02, 2026",
    unread: false,
  },
];

export default function Index() {
  const openTickets = tickets.filter((t) => t.status !== "Closed").length;
  const urgent = pendingActions.filter((a) => a.urgent).length;

  return (
    <PortalLayout
      title="Dashboard"
      subtitle="Everything happening across your engagements"
    >
      <div className="space-y-6">
        {/* Onboarding / account status banner */}
        <Card className="animate-fade-in overflow-hidden border-primary/20">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading font-bold text-foreground">
                    KYC onboarding
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-warning/10 text-warning border-warning/20"
                  >
                    Under review
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {onboarding.classification}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {onboarding.submittedOn} · we'll notify you as soon
                  as the review is complete.
                </p>
                <Progress value={onboarding.completion} className="mt-2 h-1.5 w-48" />
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/onboarding">
                View submission <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active projects"
            value={String(projects.length)}
            subtitle="2 in delivery"
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
            value="RWF 1.25M"
            subtitle="1 invoice due"
            icon={CreditCard}
            variant="success"
          />
          <StatCard
            title="Open tickets"
            value={String(openTickets)}
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
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                  <Link to="/projects">
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
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
                          <Clock className="h-3 w-3" /> Due {project.dueDate}
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
              {pendingActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      action.type === "document"
                        ? "bg-primary/10 text-primary"
                        : action.type === "signature"
                          ? "bg-secondary/10 text-secondary"
                          : action.type === "form"
                            ? "bg-info/10 text-info"
                            : "bg-warning/10 text-warning"
                    }`}
                  >
                    {action.type === "document" ? (
                      <Upload className="h-4 w-4" />
                    ) : action.type === "signature" ? (
                      <FileText className="h-4 w-4" />
                    ) : action.type === "form" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
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
              ))}
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
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                  <Link to="/alerts">All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> {alert.category} · due{" "}
                      {alert.due}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={severityStyles[alert.severity]}
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base">
                  Billing
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                  <Link to="/payments">Pay</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {invoices.map((inv) => (
                  <div
                    key={inv.ref}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Invoice {inv.ref}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.status === "Paid" ? "Paid" : "Due"} {inv.due}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {inv.amount}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          inv.status === "Paid"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                  <Link to="/service-desk">Open</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tickets.map((t) => (
                <div key={t.ref} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.ref}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {t.updated}
                      </p>
                    </div>
                    <Badge variant="outline" className={ticketStyles[t.status]}>
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
                {activity.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                ))}
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
                  <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                    <Link to="/newsletters">All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {newsletters.map((n) => (
                  <Link
                    key={n.title}
                    to="/newsletters"
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.date}</p>
                    </div>
                    {n.unread && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    3 new notifications
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
