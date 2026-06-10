import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Target, MessageSquare, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const goals = [
  { id: "G1", title: "Close 8 new client engagements this quarter", progress: 62, due: "2026-06-30", status: "on_track" },
  { id: "G2", title: "Complete Advanced Tax certification", progress: 40, due: "2026-09-30", status: "at_risk" },
  { id: "G3", title: "Mentor 2 junior analysts", progress: 100, due: "2026-05-31", status: "complete" },
];

const feedback = [
  { id: "F1", from: "Sarah Manager", date: "2026-05-20", text: "Great work leading the ABC engagement — client commended your attention to detail." },
  { id: "F2", from: "Sarah Manager", date: "2026-04-15", text: "Continue building on stakeholder communication; consider weekly status updates." },
];

const reviewHistory = [
  { id: "R1", period: "Q1 2026", rating: "Exceeds", reviewer: "Sarah Manager", date: "2026-04-05" },
  { id: "R2", period: "Q4 2025", rating: "Meets", reviewer: "Sarah Manager", date: "2026-01-10" },
  { id: "R3", period: "Q3 2025", rating: "Meets", reviewer: "Sarah Manager", date: "2025-10-08" },
];

const statusStyle: Record<string, string> = {
  on_track: "bg-success/10 text-success border-success/20",
  at_risk: "bg-warning/10 text-warning border-warning/20",
  complete: "bg-primary/10 text-primary border-primary/20",
};

export default function MyPerformance() {
  const [open, setOpen] = useState(false);
  const [self, setSelf] = useState("");

  const submit = () => {
    if (!self.trim()) return;
    setOpen(false);
    setSelf("");
    toast({ title: "Self-assessment submitted", description: "Your manager will review shortly." });
  };

  return (
    <PortalLayout title="My Performance" subtitle="Goals, feedback & reviews">
      <div className="space-y-6">
        <Tabs defaultValue="goals">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="pip">PIP</TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Current Goals & Objectives</CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button size="sm">Submit Self-Assessment</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Self-Assessment</DialogTitle></DialogHeader>
                    <Textarea rows={8} value={self} onChange={(e) => setSelf(e.target.value)} placeholder="Reflect on your achievements, challenges and development needs..." />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={submit}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                {goals.map((g) => (
                  <div key={g.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Target className="h-4 w-4" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{g.title}</p>
                          <Badge variant="outline" className={statusStyle[g.status]}>{g.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Due {g.due}</p>
                      </div>
                    </div>
                    <Progress value={g.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{g.progress}% complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardContent className="p-4 space-y-2">
                {feedback.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0"><MessageSquare className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{f.from}</p>
                        <p className="text-xs text-muted-foreground">{f.date}</p>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">{f.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-4 space-y-2">
                {reviewHistory.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{r.period}</p>
                      <p className="text-xs text-muted-foreground">{r.reviewer} • {r.date}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">{r.rating}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pip">
            <Card>
              <CardContent className="p-8 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-success/10 mx-auto flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-success" /></div>
                <p className="text-sm font-semibold">No active PIP</p>
                <p className="text-xs text-muted-foreground">You're not currently on a Performance Improvement Plan.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
