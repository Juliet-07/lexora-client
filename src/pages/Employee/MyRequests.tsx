import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Inbox, ShieldAlert, Plus, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Status = "submitted" | "in_review" | "resolved" | "closed";

interface Request {
  id: string;
  type: string;
  subject: string;
  submitted: string;
  status: Status;
  confidential?: boolean;
}

const initialRequests: Request[] = [
  { id: "R1", type: "Letter Request", subject: "Visa application letter", submitted: "2026-05-22", status: "resolved" },
  { id: "R2", type: "Employment Verification", subject: "Bank loan verification", submitted: "2026-06-02", status: "in_review" },
  { id: "R3", type: "Grievance", subject: "Confidential — workplace concern", submitted: "2026-05-15", status: "in_review", confidential: true },
];

const statusStyle: Record<Status, string> = {
  submitted: "bg-muted text-muted-foreground border-border",
  in_review: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function MyRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [openGen, setOpenGen] = useState(false);
  const [openGri, setOpenGri] = useState(false);
  const [gen, setGen] = useState({ type: "Letter Request", subject: "", details: "" });
  const [gri, setGri] = useState({ subject: "", details: "", anonymous: false });

  const submitGen = () => {
    if (!gen.subject.trim()) return;
    setRequests([{ id: Date.now().toString(), type: gen.type, subject: gen.subject, submitted: new Date().toISOString().slice(0, 10), status: "submitted" }, ...requests]);
    setOpenGen(false);
    setGen({ type: "Letter Request", subject: "", details: "" });
    toast({ title: "Request submitted", description: "HR will respond within 5 business days." });
  };

  const submitGri = () => {
    if (!gri.subject.trim()) return;
    setRequests([{ id: Date.now().toString(), type: "Grievance", subject: gri.anonymous ? "Anonymous grievance" : gri.subject, submitted: new Date().toISOString().slice(0, 10), status: "submitted", confidential: true }, ...requests]);
    setOpenGri(false);
    setGri({ subject: "", details: "", anonymous: false });
    toast({ title: "Grievance submitted", description: "Routed confidentially to HR Head." });
  };

  return (
    <PortalLayout title="My Requests" subtitle="Grievances & HR requests">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Inbox className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">General HR Request</p>
                <p className="text-xs text-muted-foreground mb-3">Letters, verifications, references and more.</p>
                <Dialog open={openGen} onOpenChange={setOpenGen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Request</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>New HR Request</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Request type</Label>
                        <Select value={gen.type} onValueChange={(v) => setGen({ ...gen, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Letter Request">Letter Request</SelectItem>
                            <SelectItem value="Employment Verification">Employment Verification</SelectItem>
                            <SelectItem value="Reference Request">Reference Request</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Subject</Label><Input value={gen.subject} onChange={(e) => setGen({ ...gen, subject: e.target.value })} /></div>
                      <div><Label>Details</Label><Textarea rows={5} value={gen.details} onChange={(e) => setGen({ ...gen, details: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenGen(false)}>Cancel</Button>
                      <Button onClick={submitGen}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center"><ShieldAlert className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center gap-2">Submit Grievance <Lock className="h-3 w-3 text-muted-foreground" /></p>
                <p className="text-xs text-muted-foreground mb-3">Confidentially routed directly to HR Head.</p>
                <Dialog open={openGri} onOpenChange={setOpenGri}>
                  <DialogTrigger asChild><Button size="sm" variant="destructive"><ShieldAlert className="h-3.5 w-3.5 mr-1.5" />Raise Grievance</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Confidential Grievance</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground flex gap-2">
                        <Lock className="h-3 w-3 mt-0.5 shrink-0" />
                        This will be routed only to the HR Head. Your line manager will not be notified.
                      </div>
                      <div><Label>Subject</Label><Input value={gri.subject} onChange={(e) => setGri({ ...gri, subject: e.target.value })} /></div>
                      <div><Label>Details</Label><Textarea rows={6} value={gri.details} onChange={(e) => setGri({ ...gri, details: e.target.value })} /></div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="anon" checked={gri.anonymous} onCheckedChange={(c) => setGri({ ...gri, anonymous: c === true })} />
                        <Label htmlFor="anon" className="text-sm">Submit anonymously</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenGri(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={submitGri}>Submit Confidentially</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          {["all", "open", "resolved"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader><CardTitle className="text-base">Request History</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {requests
                    .filter((r) => tab === "all" || (tab === "open" ? r.status !== "resolved" && r.status !== "closed" : r.status === "resolved"))
                    .map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          {r.confidential ? <Lock className="h-4 w-4" /> : <Inbox className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate">{r.subject}</p>
                            {r.confidential && <Badge variant="outline" className="text-[10px]">Confidential</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{r.type} • {r.submitted}</p>
                        </div>
                        <Badge variant="outline" className={statusStyle[r.status]}>{r.status.replace("_", " ")}</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PortalLayout>
  );
}
