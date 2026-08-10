import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, ArrowRight, CalendarDays, User, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { projects, statusStyles } from "./data";

export default function Projects() {
  const active = projects.filter((p) => p.status === "In Progress" || p.status === "Pending Review");
  const completedMilestones = projects.reduce(
    (n, p) => n + p.milestones.filter((m) => m.status === "completed").length,
    0,
  );

  return (
    <PortalLayout title="Projects" subtitle="Track everything happening on your engagements">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Projects" value={String(projects.length)} icon={FolderOpen} variant="primary" />
          <StatCard title="Active" value={String(active.length)} icon={Clock} variant="warning" />
          <StatCard title="Milestones done" value={String(completedMilestones)} icon={CheckCircle2} variant="success" />
          <StatCard
            title="Next deadline"
            value="Apr 15"
            subtitle="Company Registration"
            icon={CalendarDays}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="animate-fade-in">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.reference}</p>
                    <h3 className="font-heading font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  </div>
                  <Badge variant="outline" className={statusStyles[p.status]}>
                    {p.status}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> {p.manager}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Due {p.dueDate}
                  </span>
                </div>

                <Button asChild size="sm" className="w-full">
                  <Link to={`/projects/${p.id}`}>
                    View project <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
