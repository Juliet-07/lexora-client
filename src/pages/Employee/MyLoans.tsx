import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
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
import { Banknote, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const activeLoans = [
  { id: "L1", type: "Personal Loan", principal: 2000000, balance: 850000, monthlyRepayment: 95000, nextDue: "2026-06-28", termMonths: 24, paid: 12 },
];

const initialApplications = [
  { id: "A1", type: "Salary Advance", amount: 300000, status: "approved" as const, submitted: "2026-04-15" },
  { id: "A2", type: "Personal Loan", amount: 500000, status: "pending" as const, submitted: "2026-06-01" },
];

const repayments = [
  { id: "R1", date: "2026-05-28", amount: 95000, type: "Personal Loan" },
  { id: "R2", date: "2026-04-28", amount: 95000, type: "Personal Loan" },
  { id: "R3", date: "2026-03-28", amount: 95000, type: "Personal Loan" },
];

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const statusStyle = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyLoans() {
  const [apps, setApps] = useState(initialApplications);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Personal Loan", amount: "", term: "12", reason: "" });

  const submit = () => {
    if (!form.amount) {
      toast({ title: "Amount required", variant: "destructive" });
      return;
    }
    setApps([{ id: Date.now().toString(), type: form.type, amount: Number(form.amount), status: "pending", submitted: new Date().toISOString().slice(0, 10) }, ...apps]);
    setOpen(false);
    setForm({ type: "Personal Loan", amount: "", term: "12", reason: "" });
    toast({ title: "Application submitted", description: "HR will review your request shortly." });
  };

  return (
    <PortalLayout title="My Loans" subtitle="Balances, applications & repayments">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-muted-foreground">Active Loans</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Application</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apply for Loan / Advance</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                      <SelectItem value="Salary Advance">Salary Advance</SelectItem>
                      <SelectItem value="Emergency Loan">Emergency Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount (NGN)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                  <div><Label>Term (months)</Label><Input type="number" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} /></div>
                </div>
                <div><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {activeLoans.map((l) => (
          <Card key={l.id}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{l.type}</p>
                  <p className="text-xs text-muted-foreground">Next due: {l.nextDue}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Principal</p><p className="font-semibold">{fmt(l.principal)}</p></div>
                <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="font-semibold">{fmt(l.balance)}</p></div>
                <div><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">{fmt(l.monthlyRepayment)}</p></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Repayment progress</span><span>{l.paid} / {l.termMonths} months</span></div>
                <Progress value={(l.paid / l.termMonths) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}

        <Tabs defaultValue="apps">
          <TabsList>
            <TabsTrigger value="apps">Applications</TabsTrigger>
            <TabsTrigger value="history">Repayment History</TabsTrigger>
          </TabsList>

          <TabsContent value="apps">
            <Card>
              <CardContent className="p-4 space-y-2">
                {apps.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Banknote className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.type}</p>
                      <p className="text-xs text-muted-foreground">{fmt(a.amount)} • Submitted {a.submitted}</p>
                    </div>
                    <Badge variant="outline" className={statusStyle[a.status]}>{a.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-4 space-y-2">
                {repayments.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{r.type}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                    <p className="text-sm font-semibold">{fmt(r.amount)}</p>
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
