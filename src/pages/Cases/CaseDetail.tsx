import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Gavel,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import { fetchMyCase } from "@/lib/cases-api";

const money = (n: number, c = "USD") =>
  n.toLocaleString(undefined, { style: "currency", currency: c });

export default function CaseDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const caseType = type === "litigation" ? "litigation" : "adr";

  const {
    data: c,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clientCase", caseType, id],
    queryFn: () => fetchMyCase(caseType, id as string),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <PortalLayout title="Case" subtitle="Loading…">
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </PortalLayout>
    );
  }

  if (isError || !c) {
    return (
      <PortalLayout title="Case" subtitle="Not found">
        <Card>
          <CardContent className="space-y-3 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              This case could not be found.
            </p>
            <Button asChild size="sm">
              <Link to="/cases">Back to cases</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  const isAdr = c.caseType === "ADR";
  const timeline = [...c.timeline].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <PortalLayout
      title={c.title}
      subtitle={`${c.ref} · ${c.caseType} · Mandate: ${c.mandateName}`}
    >
      <div className="space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <Link to="/cases">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All cases
          </Link>
        </Button>

        <Card className="animate-fade-in">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Stage: {c.stage}</p>
                {isAdr && c.venue && <p>Venue: {c.venue}</p>}
                {!isAdr && c.court && (
                  <p>
                    {c.court}
                    {c.courtDivision ? ` · ${c.courtDivision}` : ""}
                    {c.registry ? ` · ${c.registry}` : ""}
                  </p>
                )}
              </div>
              <Badge variant="outline">{c.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Filed{" "}
                {c.filedOn?.slice(0, 10)}
              </span>
              {c.claimValue > 0 && (
                <span>Claim value: {money(c.claimValue, c.currency)}</span>
              )}
              {!isAdr && (c.courtFeesPaid ?? 0) > 0 && (
                <span>
                  Court fees paid: {money(c.courtFeesPaid!, c.currency)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value={isAdr ? "sessions" : "court-dates"}>
              {isAdr ? "Sessions" : "Court Dates"}
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {isAdr && c.settlement && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-heading text-sm">
                    <Handshake className="h-4 w-4 text-success" /> Settlement
                    reached
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    {money(c.settlement.amount, c.currency)} on{" "}
                    {c.settlement.date?.slice(0, 10)}
                  </p>
                  {c.settlement.terms && (
                    <p className="text-muted-foreground">
                      {c.settlement.terms}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            {isAdr && c.outcome && !c.settlement && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-heading text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.outcome}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm">
                  Matter details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {isAdr && c.type && <p>Type: {c.type}</p>}
                {isAdr && c.neutral && <p>Neutral: {c.neutral}</p>}
                {isAdr && c.governingLaw && (
                  <p>Governing law: {c.governingLaw}</p>
                )}
                {!isAdr && c.adrCaseId && (
                  <p>Escalated from a prior ADR case on this matter.</p>
                )}
                {!isAdr && !c.adrCaseId && !c.court && (
                  <p>No further details recorded.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Parties ── */}
          <TabsContent value="parties" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-heading text-sm">
                  <Users className="h-4 w-4" /> Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {(c.parties ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      {p.organisation && (
                        <p className="text-xs text-muted-foreground">
                          {p.organisation}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {p.role}
                    </Badge>
                  </div>
                ))}
                {!(c.parties ?? []).length && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No parties recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Sessions / Court dates ── */}
          <TabsContent
            value={isAdr ? "sessions" : "court-dates"}
            className="mt-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-heading text-sm">
                  <Gavel className="h-4 w-4" />{" "}
                  {isAdr ? "Sessions" : "Court dates"}
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {isAdr &&
                  (c.sessions ?? []).map((s, i) => (
                    <div key={i} className="space-y-1 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {s.date?.slice(0, 10)}
                          {s.startTime ? ` · ${s.startTime}` : ""}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.mode}
                        {s.venue ? ` · ${s.venue}` : ""}
                      </p>
                      {s.outcome && (
                        <p className="text-xs text-muted-foreground">
                          {s.outcome}
                        </p>
                      )}
                    </div>
                  ))}
                {!isAdr &&
                  (c.courtDates ?? []).map((d, i) => (
                    <div key={i} className="space-y-1 p-4">
                      <p className="text-sm font-medium text-foreground">
                        {d.date?.slice(0, 10)}
                      </p>
                      {d.purpose && (
                        <p className="text-xs text-muted-foreground">
                          {d.purpose}
                        </p>
                      )}
                      {d.outcome && (
                        <p className="text-xs text-muted-foreground">
                          {d.outcome}
                        </p>
                      )}
                    </div>
                  ))}
                {isAdr && !(c.sessions ?? []).length && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No sessions scheduled yet.
                  </p>
                )}
                {!isAdr && !(c.courtDates ?? []).length && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No court dates recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Timeline ── */}
          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="space-y-4 p-5">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      {i < timeline.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!timeline.length && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No timeline entries yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
