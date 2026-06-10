import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Play, Calendar, Download, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const assigned = [
  { id: "T1", title: "Data Privacy Essentials", category: "Compliance", progress: 60, due: "2026-06-30" },
  { id: "T2", title: "Anti-Bribery Training", category: "Compliance", progress: 0, due: "2026-06-15", overdue: true },
  { id: "T3", title: "Advanced Excel for Analysts", category: "Skills", progress: 25, due: "2026-08-31" },
];

const upcoming = [
  { id: "S1", title: "Tax Updates 2026 Workshop", date: "2026-06-20", location: "Virtual", registered: false },
  { id: "S2", title: "Leadership Development Seminar", date: "2026-07-05", location: "Lagos HQ", registered: true },
];

const certifications = [
  { id: "C1", name: "ACCA Tax Module", issued: "2025-11-10", cpdHours: 20, file: "acca-tax.pdf" },
  { id: "C2", name: "AML & KYC Foundations", issued: "2025-08-22", cpdHours: 12, file: "aml-kyc.pdf" },
];

export default function MyTraining() {
  const [sessions, setSessions] = useState(upcoming);

  const register = (id: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, registered: true } : s)));
    toast({ title: "Registered", description: "You'll receive a calendar invite shortly." });
  };

  return (
    <PortalLayout title="My Training" subtitle="Programmes, e-learning & certifications">
      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="certs">Certifications & CPD</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          <Card>
            <CardContent className="p-4 space-y-3">
              {assigned.map((t) => (
                <div key={t.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{t.title}</p>
                        <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                        {t.overdue && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Overdue</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">Due {t.due}</p>
                    </div>
                    <Button size="sm" variant="outline"><Play className="h-3.5 w-3.5 mr-1.5" />{t.progress > 0 ? "Resume" : "Start"}</Button>
                  </div>
                  <Progress value={t.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="p-4 space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.date} • {s.location}</p>
                  </div>
                  {s.registered ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Registered</Badge>
                  ) : (
                    <Button size="sm" onClick={() => register(s.id)}>Register</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" />CPD Record — {certifications.reduce((s, c) => s + c.cpdHours, 0)} hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {certifications.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-md bg-success/10 text-success flex items-center justify-center"><Award className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Issued {c.issued} • {c.cpdHours} CPD hours</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Downloading certificate", description: c.file })}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Certificate
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
}
