import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  LifeBuoy,
  Plus,
  Star,
  Ticket as TicketIcon,
} from "lucide-react";
import { useState } from "react";

type TicketStatus = "Open" | "In Progress" | "Awaiting You" | "Closed";

interface TicketUpdate {
  from: string;
  text: string;
  time: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: TicketStatus;
  created: string;
  updated: string;
  description: string;
  updates: TicketUpdate[];
  feedback?: { rating: number; remark: string };
}

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-info/10 text-info border-info/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Awaiting You": "bg-warning/10 text-warning border-warning/20",
  Closed: "bg-success/10 text-success border-success/20",
};

const categories = ["Billing", "Tax & Filing", "Documents", "Portal Access", "General Enquiry"];

const initialTickets: Ticket[] = [
  {
    id: "TKT-2041",
    subject: "Invoice INV-1094 shows the wrong VAT rate",
    category: "Billing",
    priority: "High",
    status: "In Progress",
    created: "Aug 4, 2026",
    updated: "Aug 5, 2026",
    description: "The VAT on my latest invoice is calculated at 20% instead of the agreed 7.5%.",
    updates: [
      { from: "Support", text: "Thanks for flagging — we've escalated this to billing for a credit note.", time: "Aug 4, 15:10" },
      { from: "Support", text: "Credit note is being prepared and will be issued within 48 hours.", time: "Aug 5, 09:22" },
    ],
  },
  {
    id: "TKT-2033",
    subject: "Cannot download my 2024 filing receipt",
    category: "Documents",
    priority: "Medium",
    status: "Awaiting You",
    created: "Jul 29, 2026",
    updated: "Aug 1, 2026",
    description: "The download button on the documents page does nothing for the filing receipt.",
    updates: [
      { from: "Support", text: "Could you confirm which browser you are using so we can reproduce this?", time: "Aug 1, 11:05" },
    ],
  },
  {
    id: "TKT-1988",
    subject: "Add a second authorised user to our account",
    category: "Portal Access",
    priority: "Low",
    status: "Closed",
    created: "Jul 2, 2026",
    updated: "Jul 5, 2026",
    description: "Please grant portal access to our finance manager.",
    updates: [
      { from: "Support", text: "Access has been granted and an invite email sent.", time: "Jul 5, 10:40" },
    ],
  },
];

const articles = [
  {
    id: "kb1",
    title: "How to prepare records for your annual tax filing",
    category: "Tax & Filing",
    readTime: "5 min read",
    body: [
      "Start with a complete trial balance for the period, then reconcile bank balances and confirm that all supplier invoices are captured.",
      "Upload the reconciled pack to your project workspace under the Financial category so your engagement team can begin work immediately.",
    ],
  },
  {
    id: "kb2",
    title: "Understanding your invoice and payment options",
    category: "Billing",
    readTime: "3 min read",
    body: [
      "Invoices are issued at the start of each engagement phase and are payable within 14 days.",
      "You can settle by card, bank transfer or mobile money from the Payments page. Receipts appear in your documents within minutes.",
    ],
  },
  {
    id: "kb3",
    title: "Keeping your beneficial ownership register up to date",
    category: "Compliance",
    readTime: "4 min read",
    body: [
      "Any change in ownership above the 25% threshold must be reported within 14 days of the change.",
      "Raise a service desk ticket under Compliance if you need the register refreshed outside the annual cycle.",
    ],
  },
];

export default function ServiceDesk() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "General Enquiry", priority: "Medium", description: "" });
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Ticket | null>(null);
  const [rating, setRating] = useState(0);
  const [remark, setRemark] = useState("");
  const [article, setArticle] = useState<(typeof articles)[number] | null>(null);

  const open = tickets.filter((t) => t.status !== "Closed");
  const closed = tickets.filter((t) => t.status === "Closed");

  const submitTicket = () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const ticket: Ticket = {
      id: `TKT-${2050 + tickets.length}`,
      subject: form.subject.trim(),
      category: form.category,
      priority: form.priority as Ticket["priority"],
      status: "Open",
      created: now,
      updated: now,
      description: form.description.trim(),
      updates: [],
    };
    setTickets((t) => [ticket, ...t]);
    setNewOpen(false);
    setForm({ subject: "", category: "General Enquiry", priority: "Medium", description: "" });
    toast({ title: "Ticket raised", description: `${ticket.id} has been submitted to the service desk.` });
  };

  const submitFeedback = () => {
    if (!feedbackFor || rating === 0) return;
    setTickets((ts) =>
      ts.map((t) => (t.id === feedbackFor.id ? { ...t, feedback: { rating, remark: remark.trim() } } : t)),
    );
    setFeedbackFor(null);
    setRating(0);
    setRemark("");
    toast({ title: "Thank you", description: "Your satisfaction feedback has been recorded." });
  };

  const TicketCard = ({ t }: { t: Ticket }) => (
    <Card className="animate-fade-in">
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.id} · {t.category} · {t.priority} priority
            </p>
            <h3 className="font-heading font-bold text-foreground">{t.subject}</h3>
            <p className="text-xs text-muted-foreground">
              Raised {t.created} · Last update {t.updated}
            </p>
          </div>
          <Badge variant="outline" className={statusStyles[t.status]}>
            {t.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setDetail(t)}>
            Track ticket
          </Button>
          {t.status === "Closed" && !t.feedback && (
            <Button size="sm" onClick={() => setFeedbackFor(t)}>
              <Star className="mr-1.5 h-3.5 w-3.5" /> Rate resolution
            </Button>
          )}
          {t.feedback && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < t.feedback!.rating ? "fill-warning text-warning" : "text-muted"}`}
                />
              ))}
              <span className="ml-1">Feedback submitted</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PortalLayout title="Service Desk" subtitle="Raise tickets, track progress and browse help articles">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Open tickets" value={String(open.length)} icon={TicketIcon} variant="primary" />
          <StatCard title="Awaiting you" value={String(tickets.filter((t) => t.status === "Awaiting You").length)} icon={Clock} variant="warning" />
          <StatCard title="Resolved" value={String(closed.length)} icon={CheckCircle2} variant="success" />
          <StatCard title="Help articles" value={String(articles.length)} icon={BookOpen} />
        </div>

        <div className="flex justify-end">
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Raise a ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Raise a new ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject *</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Briefly describe the issue"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Medium", "High"].map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description *</Label>
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Give us as much detail as you can"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitTicket} disabled={!form.subject.trim() || !form.description.trim()}>
                  Submit ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
            <TabsTrigger value="kb">Knowledge base</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-4 space-y-3">
            {open.length === 0 && (
              <Card>
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  <LifeBuoy className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  No open tickets — you're all caught up.
                </CardContent>
              </Card>
            )}
            {open.map((t) => (
              <TicketCard key={t.id} t={t} />
            ))}
          </TabsContent>

          <TabsContent value="closed" className="mt-4 space-y-3">
            {closed.map((t) => (
              <TicketCard key={t.id} t={t} />
            ))}
          </TabsContent>

          <TabsContent value="kb" className="mt-4 grid gap-4 md:grid-cols-2">
            {articles.map((a) => (
              <Card key={a.id} className="animate-fade-in">
                <CardContent className="p-5 space-y-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {a.category}
                  </Badge>
                  <h3 className="font-heading font-bold text-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.readTime}</p>
                  <Button size="sm" variant="outline" onClick={() => setArticle(a)}>
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Read article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket tracking */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{detail?.subject}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className={statusStyles[detail.status]}>
                  {detail.status}
                </Badge>
                <span>
                  {detail.id} · {detail.category} · {detail.priority} priority
                </span>
              </div>
              <p className="text-sm text-foreground">{detail.description}</p>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ticket timeline</p>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground">Ticket raised</p>
                    <p className="text-xs text-muted-foreground">{detail.created}</p>
                  </div>
                </div>
                {detail.updates.map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{u.from}:</span> {u.text}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.time}</p>
                    </div>
                  </div>
                ))}
                {detail.status === "Closed" && (
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">Ticket closed</p>
                      <p className="text-xs text-muted-foreground">{detail.updated}</p>
                    </div>
                  </div>
                )}
              </div>
              {detail.feedback && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your feedback</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < detail.feedback!.rating ? "fill-warning text-warning" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    {detail.feedback.remark && (
                      <p className="text-sm text-muted-foreground">{detail.feedback.remark}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Satisfaction feedback */}
      <Dialog open={!!feedbackFor} onOpenChange={(o) => !o && setFeedbackFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">How satisfied were you?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {feedbackFor?.id} — {feedbackFor?.subject}
          </p>
          <div className="flex items-center justify-center gap-2 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
                <Star
                  className={`h-8 w-8 transition-colors ${
                    i < rating ? "fill-warning text-warning" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Remark (optional)</Label>
            <Textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Tell us more…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackFor(null)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={rating === 0}>
              Submit feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Knowledge base article */}
      <Dialog open={!!article} onOpenChange={(o) => !o && setArticle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{article?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {article?.category} · {article?.readTime}
          </p>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {article?.body.map((p, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
