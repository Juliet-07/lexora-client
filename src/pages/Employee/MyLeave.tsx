import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LeaveStatus = "pending" | "approved" | "rejected";

interface LeaveRequest {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  rejectionReason?: string;
}

const balances = [
  { type: "Annual", used: 6, total: 20 },
  { type: "Sick", used: 1, total: 10 },
  { type: "Compassionate", used: 0, total: 3 },
  { type: "Maternity/Paternity", used: 0, total: 14 },
];

const initialRequests: LeaveRequest[] = [
  { id: "1", type: "Annual", from: "2026-06-12", to: "2026-06-14", days: 3, reason: "Family event", status: "approved", reviewedBy: "Jane HR" },
  { id: "2", type: "Sick", from: "2026-05-03", to: "2026-05-03", days: 1, reason: "Flu", status: "approved", reviewedBy: "Jane HR" },
  { id: "3", type: "Annual", from: "2026-07-20", to: "2026-07-25", days: 5, reason: "Vacation", status: "pending" },
  { id: "4", type: "Compassionate", from: "2026-04-15", to: "2026-04-16", days: 2, reason: "Personal", status: "rejected", rejectionReason: "Insufficient notice — please submit 7 days in advance." },
];

const teamCalendar = [
  { name: "Alice K.", type: "Annual", from: "2026-06-15", to: "2026-06-20" },
  { name: "Tom M.", type: "Sick", from: "2026-06-10", to: "2026-06-11" },
  { name: "Priya R.", type: "Annual", from: "2026-06-22", to: "2026-06-30" },
];

const statusStyle: Record<LeaveStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyLeave() {
  const [requests, setRequests] = useState(initialRequests);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Annual", from: "", to: "", reason: "" });

  const handleSubmit = () => {
    if (!form.from || !form.to) {
      toast({ title: "Missing dates", description: "Please select start and end dates.", variant: "destructive" });
      return;
    }
    const days = Math.max(1, Math.ceil((new Date(form.to).getTime() - new Date(form.from).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const newReq: LeaveRequest = { id: Date.now().toString(), ...form, days, status: "pending" };
    setRequests([newReq, ...requests]);
    setOpen(false);
    setForm({ type: "Annual", from: "", to: "", reason: "" });
    toast({ title: "Leave request submitted", description: `${days} day(s) — awaiting manager approval.` });
  };

  return (
    <PortalLayout title="My Leave" subtitle="Balances, requests & team calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Balances</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Apply for Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {balances.map((b) => <SelectItem key={b.type} value={b.type}>{b.type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>From</Label><Input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
                  <div><Label>To</Label><Input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
                </div>
                <div><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason..." /></div>
                {form.type === "Sick" && (
                  <div>
                    <Label>Medical certificate</Label>
                    <Input type="file" />
                    <p className="text-xs text-muted-foreground mt-1">Required for sick leave &gt; 2 days</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <Card key={b.type}>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase">{b.type}</p>
                <p className="text-2xl font-heading font-bold">{b.total - b.used}<span className="text-sm text-muted-foreground"> / {b.total}</span></p>
                <Progress value={(b.used / b.total) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{b.used} used</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="team">Team Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader><CardTitle className="text-base">Leave Requests</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><CalendarDays className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{r.type} Leave</p>
                        <Badge variant="outline" className={statusStyle[r.status]}>{r.status}</Badge>
                        <span className="text-xs text-muted-foreground">{r.days} day{r.days > 1 ? "s" : ""}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.from} → {r.to}</p>
                      {r.reason && <p className="text-xs mt-1">{r.reason}</p>}
                      {r.rejectionReason && <p className="text-xs text-destructive mt-1">Reason: {r.rejectionReason}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Team Leave Calendar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {teamCalendar.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{t.name.split(" ").map(n => n[0]).join("")}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.from} → {t.to}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
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
