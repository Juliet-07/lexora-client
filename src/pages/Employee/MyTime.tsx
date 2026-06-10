import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Clock, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DayEntry {
  date: string;
  clockIn?: string;
  clockOut?: string;
  hours: number;
  overtime: number;
  status: "draft" | "submitted" | "approved";
}

const currentPeriod: DayEntry[] = [
  { date: "Mon Jun 8", clockIn: "08:32", clockOut: "17:45", hours: 8.5, overtime: 1, status: "draft" },
  { date: "Tue Jun 9", clockIn: "08:28", clockOut: "17:30", hours: 8.5, overtime: 0.5, status: "draft" },
  { date: "Wed Jun 10", clockIn: "08:40", hours: 0, overtime: 0, status: "draft" },
  { date: "Thu Jun 11", hours: 0, overtime: 0, status: "draft" },
  { date: "Fri Jun 12", hours: 0, overtime: 0, status: "draft" },
];

const priorPeriods = [
  { period: "Jun 1 – Jun 5", hours: 42.5, overtime: 2.5, status: "approved" as const },
  { period: "May 25 – May 29", hours: 40, overtime: 0, status: "approved" as const },
  { period: "May 18 – May 22", hours: 41, overtime: 1, status: "approved" as const },
];

export default function MyTime() {
  const [clockedIn, setClockedIn] = useState(false);
  const [since, setSince] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = since ? Math.floor((now.getTime() - since.getTime()) / 1000) : 0;
  const fmtElapsed = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const totalHours = currentPeriod.reduce((s, d) => s + d.hours, 0);
  const totalOT = currentPeriod.reduce((s, d) => s + d.overtime, 0);

  const handleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
      setSince(null);
      toast({ title: "Clocked out", description: `Worked ${fmtElapsed}` });
    } else {
      setClockedIn(true);
      setSince(new Date());
      toast({ title: "Clocked in", description: "Have a productive day!" });
    }
  };

  return (
    <PortalLayout title="My Time" subtitle="Clock in/out, timesheets & overtime">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center ${clockedIn ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">You are currently</p>
                <p className="text-xl font-heading font-bold">{clockedIn ? "Clocked in" : "Clocked out"}</p>
                {clockedIn && <p className="text-sm text-success font-mono">{fmtElapsed}</p>}
              </div>
            </div>
            <Button size="lg" onClick={handleClock} className={clockedIn ? "bg-destructive hover:bg-destructive/90" : ""}>
              {clockedIn ? <><Pause className="h-4 w-4 mr-2" />Clock Out</> : <><Play className="h-4 w-4 mr-2" />Clock In</>}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current Period</TabsTrigger>
            <TabsTrigger value="history">Prior Periods</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Week of Jun 8 – Jun 12</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{totalHours}h regular • {totalOT}h overtime</p>
                </div>
                <Button size="sm" onClick={() => toast({ title: "Timesheet submitted", description: "Awaiting manager approval." })}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />Submit
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentPeriod.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-24 text-sm font-medium">{d.date}</div>
                    <div className="flex-1 text-xs text-muted-foreground">
                      {d.clockIn ? `${d.clockIn} → ${d.clockOut ?? "—"}` : "No entry"}
                    </div>
                    <div className="text-sm font-semibold">{d.hours}h</div>
                    {d.overtime > 0 && <Badge variant="outline" className="text-[10px]">+{d.overtime}h OT</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-4 space-y-2">
                {priorPeriods.map((p) => (
                  <div key={p.period} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.period}</p>
                      <p className="text-xs text-muted-foreground">{p.hours}h regular • {p.overtime}h overtime</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">{p.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
