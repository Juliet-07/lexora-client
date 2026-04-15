import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderOpen,
  AlertCircle,
  MessageSquare,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  Upload,
} from "lucide-react";

const projects = [
  { name: "Tax Filing 2024", status: "In Progress", progress: 65, dueDate: "Apr 30, 2026" },
  { name: "Company Registration", status: "Pending Review", progress: 90, dueDate: "Apr 15, 2026" },
  { name: "Annual Compliance", status: "Not Started", progress: 0, dueDate: "Jun 30, 2026" },
];

const pendingActions = [
  { title: "Upload ID Document", type: "document", urgent: true },
  { title: "Sign Engagement Letter", type: "signature", urgent: true },
  { title: "Complete KYC Form", type: "form", urgent: false },
  { title: "Review Invoice #1042", type: "payment", urgent: false },
];

const recentMessages = [
  { from: "Sarah K.", message: "Your tax filing documents are ready for review", time: "2h ago", unread: true },
  { from: "Admin", message: "New compliance deadline reminder", time: "5h ago", unread: false },
  { from: "Finance Dept.", message: "Invoice #1041 has been processed", time: "1d ago", unread: false },
];

const statusStyles: Record<string, string> = {
  "In Progress": "bg-info/10 text-info border-info/20",
  "Pending Review": "bg-warning/10 text-warning border-warning/20",
  "Not Started": "bg-muted text-muted-foreground border-border",
};

export default function Index() {
  return (
    <PortalLayout title="Dashboard" subtitle="Overview of your projects and tasks">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Active Projects" value="3" subtitle="2 in progress" icon={FolderOpen} variant="primary" />
          <StatCard title="Pending Actions" value="4" subtitle="2 urgent" icon={AlertCircle} variant="warning" />
          {/* <StatCard title="Messages" value="1" subtitle="Unread" icon={MessageSquare} variant="success" /> */}
          <StatCard title="Documents" value="12" subtitle="3 awaiting signature" icon={FileText} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Active Projects</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project) => (
                <div key={project.name} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-foreground">{project.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due {project.dueDate}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusStyles[project.status]}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingActions.map((action) => (
                <div
                  key={action.title}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${action.type === "document" ? "bg-primary/10 text-primary" :
                    action.type === "signature" ? "bg-secondary/10 text-secondary" :
                      action.type === "form" ? "bg-info/10 text-info" :
                        "bg-warning/10 text-warning"
                    }`}>
                    {action.type === "document" ? <Upload className="h-4 w-4" /> :
                      action.type === "signature" ? <FileText className="h-4 w-4" /> :
                        action.type === "form" ? <CheckCircle2 className="h-4 w-4" /> :
                          <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{action.title}</p>
                    {action.urgent && (
                      <p className="text-[10px] text-destructive font-medium uppercase">Urgent</p>
                    )}
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        {/* <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">Recent Messages</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentMessages.map((msg) => (
                <div key={msg.message} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">{msg.from[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{msg.from}</p>
                      {msg.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </PortalLayout>
  );
}
