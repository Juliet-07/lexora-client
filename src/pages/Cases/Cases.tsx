import { useQuery } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Gavel,
  ArrowRight,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyCases, type MyCase } from "@/lib/cases-api";

const statusTone: Record<string, string> = {
  Active: "bg-info/10 text-info border-info/20",
  Resolved: "bg-success/10 text-success border-success/20",
  Settled: "bg-success/10 text-success border-success/20",
  "Escalated to litigation": "bg-warning/10 text-warning border-warning/20",
  Withdrawn: "bg-muted text-muted-foreground border-border",
  "Judgment issued": "bg-success/10 text-success border-success/20",
  Enforced: "bg-success/10 text-success border-success/20",
};

const money = (n: number, c = "USD") =>
  n.toLocaleString(undefined, { style: "currency", currency: c });

export default function Cases() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["clientCases"],
    queryFn: fetchMyCases,
  });

  const active = cases.filter((c) => c.status === "Active");
  const totalClaimValue = active.reduce((s, c) => s + (c.claimValue ?? 0), 0);
  const litigationCount = cases.filter(
    (c) => c.caseType === "Litigation",
  ).length;

  if (isLoading) {
    return (
      <PortalLayout title="Cases" subtitle="ADR and litigation matters">
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading your cases…
        </p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Cases" subtitle="ADR and litigation matters">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total matters"
            value={String(cases.length)}
            icon={Scale}
            variant="primary"
          />
          <StatCard
            title="Active"
            value={String(active.length)}
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="In litigation"
            value={String(litigationCount)}
            icon={Gavel}
          />
          <StatCard
            title="Claim value active"
            value={money(totalClaimValue)}
            icon={Scale}
            variant="success"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {cases.map((c) => (
            <Card key={`${c.caseType}-${c._id}`} className="animate-fade-in">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.ref} · {c.caseType}
                    </p>
                    <h3 className="font-heading font-bold text-foreground">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Mandate: {c.mandateName}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusTone[c.status] ?? "border-border"}
                  >
                    {c.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Filed{" "}
                    {c.filedOn?.slice(0, 10)}
                  </span>
                  {c.claimValue > 0 && (
                    <span>{money(c.claimValue, c.currency)} at stake</span>
                  )}
                </div>

                <Button asChild size="sm" className="w-full">
                  <Link to={`/cases/${c.caseType.toLowerCase()}/${c._id}`}>
                    View case <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {!cases.length && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No ADR or litigation matters at this time.
            </p>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
