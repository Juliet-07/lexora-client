import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Send,
} from "lucide-react";
import {
  fetchMyTickets,
  fetchMyTicket,
  raiseTicket,
  replyToTicket,
  rateTicket,
  statusLabel,
  statusStyles,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  fetchKbArticles,
  recordKbView,
  voteKbArticle,
  type Ticket,
  type TicketPriority,
  type KbArticle,
} from "@/lib/service-desk-api";

export default function ServiceDesk() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["clientTickets"],
    queryFn: fetchMyTickets,
  });
  const { data: articles = [] } = useQuery({
    queryKey: ["clientKbArticles"],
    queryFn: fetchKbArticles,
  });

  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: TICKET_CATEGORIES[0],
    priority: "Medium" as TicketPriority,
    description: "",
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [feedbackFor, setFeedbackFor] = useState<Ticket | null>(null);
  const [rating, setRating] = useState(0);
  const [remark, setRemark] = useState("");
  const [article, setArticle] = useState<(typeof articles)[number] | null>(
    null,
  );

  const { data: detail } = useQuery({
    queryKey: ["clientTicket", detailId],
    queryFn: () => fetchMyTicket(detailId as string),
    enabled: !!detailId,
  });

  const open = tickets.filter((t) => t.status !== "Closed");
  const closed = tickets.filter((t) => t.status === "Closed");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["clientTickets"] });
  const onErr = (title: string) => (err: any) =>
    toast({
      title,
      description: err?.response?.data?.message,
      variant: "destructive",
    });

  const raiseMut = useMutation({
    mutationFn: () => raiseTicket({ ...form, clientName: "You" }),
    onSuccess: (t) => {
      invalidate();
      setNewOpen(false);
      setForm({
        subject: "",
        category: TICKET_CATEGORIES[0],
        priority: "Medium",
        description: "",
      });
      toast({
        title: "Ticket raised",
        description: `${t.ref} has been submitted to the service desk.`,
      });
    },
    onError: onErr("Failed to raise ticket"),
  });

  const replyMut = useMutation({
    mutationFn: () => replyToTicket(detailId as string, "You", reply.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientTicket", detailId] });
      invalidate();
      setReply("");
    },
    onError: onErr("Failed to send reply"),
  });

  const rateMut = useMutation({
    mutationFn: () => rateTicket(feedbackFor!._id, rating, remark.trim()),
    onSuccess: () => {
      invalidate();
      setFeedbackFor(null);
      setRating(0);
      setRemark("");
      toast({
        title: "Thank you",
        description: "Your satisfaction feedback has been recorded.",
      });
    },
    onError: onErr("Failed to submit feedback"),
  });

  const TicketCard = ({ t }: { t: Ticket }) => (
    <Card className="animate-fade-in">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.ref} · {t.category} · {t.priority} priority
            </p>
            <h3 className="font-heading font-bold text-foreground">
              {t.subject}
            </h3>
            <p className="text-xs text-muted-foreground">
              Raised {t.createdAt.slice(0, 10)} · Last update{" "}
              {t.updatedAt.slice(0, 10)}
            </p>
          </div>
          <Badge variant="outline" className={statusStyles[t.status]}>
            {statusLabel[t.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDetailId(t._id)}
          >
            Track ticket
          </Button>
          {t.status === "Closed" && !t.rating && (
            <Button size="sm" onClick={() => setFeedbackFor(t)}>
              <Star className="mr-1.5 h-3.5 w-3.5" /> Rate resolution
            </Button>
          )}
          {t.rating && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < t.rating! ? "fill-warning text-warning" : "text-muted"}`}
                />
              ))}
              <span className="ml-1">Feedback submitted</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <PortalLayout
        title="Service Desk"
        subtitle="Raise tickets, track progress and browse help articles"
      >
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading your tickets…
        </p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="Service Desk"
      subtitle="Raise tickets, track progress and browse help articles"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Open tickets"
            value={String(open.length)}
            icon={TicketIcon}
            variant="primary"
          />
          <StatCard
            title="Awaiting you"
            value={String(
              tickets.filter((t) => t.status === "Pending Client").length,
            )}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Resolved"
            value={String(closed.length)}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Help articles"
            value={String(articles.length)}
            icon={BookOpen}
          />
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
                <DialogTitle className="font-heading">
                  Raise a new ticket
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject *</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="Briefly describe the issue"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) =>
                        setForm({ ...form, priority: v as TicketPriority })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_PRIORITIES.map((p) => (
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
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Give us as much detail as you can"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => raiseMut.mutate()}
                  disabled={
                    raiseMut.isPending ||
                    !form.subject.trim() ||
                    !form.description.trim()
                  }
                >
                  {raiseMut.isPending ? "Submitting…" : "Submit ticket"}
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
                  <LifeBuoy className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  No open tickets — you're all caught up.
                </CardContent>
              </Card>
            )}
            {open.map((t) => (
              <TicketCard key={t._id} t={t} />
            ))}
          </TabsContent>

          <TabsContent value="closed" className="mt-4 space-y-3">
            {closed.map((t) => (
              <TicketCard key={t._id} t={t} />
            ))}
          </TabsContent>

          <TabsContent value="kb" className="mt-4 grid gap-4 md:grid-cols-2">
            {articles.map((a) => (
              <Card key={a._id} className="animate-fade-in">
                <CardContent className="space-y-2 p-5">
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/10 text-primary"
                  >
                    {a.category}
                  </Badge>
                  <h3 className="font-heading font-bold text-foreground">
                    {a.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {a.views} views
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      recordKbView(a._id);
                      setArticle(a);
                    }}
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Read article
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!articles.length && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No articles published yet.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket tracking */}
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {detail?.subject}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className={statusStyles[detail.status]}
                >
                  {statusLabel[detail.status]}
                </Badge>
                <span>
                  {detail.ref} · {detail.category} · {detail.priority} priority
                </span>
              </div>
              <p className="text-sm text-foreground">{detail.description}</p>
              <Separator />
              <div className="max-h-64 space-y-3 overflow-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Conversation
                </p>
                {!detail.notes.length && (
                  <p className="text-sm text-muted-foreground">
                    No replies yet.
                  </p>
                )}
                {detail.notes.map((n) => (
                  <div key={n._id} className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{n.author}:</span>{" "}
                        {n.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {detail.status !== "Closed" && (
                <div className="flex items-center gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    className="h-9 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => replyMut.mutate()}
                    disabled={!reply.trim() || replyMut.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {detail.rating && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your feedback
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < detail.rating! ? "fill-warning text-warning" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    {detail.ratingComment && (
                      <p className="text-sm text-muted-foreground">
                        {detail.ratingComment}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Satisfaction feedback */}
      <Dialog
        open={!!feedbackFor}
        onOpenChange={(o) => !o && setFeedbackFor(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              How satisfied were you?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {feedbackFor?.ref} — {feedbackFor?.subject}
          </p>
          <div className="flex items-center justify-center gap-2 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                aria-label={`${i + 1} stars`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Remark (optional)</Label>
            <Textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Tell us more…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => rateMut.mutate()}
              disabled={rating === 0 || rateMut.isPending}
            >
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
          <p className="text-xs text-muted-foreground">{article?.category}</p>
          <div
            className="prose prose-sm max-h-[60vh] max-w-none overflow-auto text-sm leading-relaxed text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: article?.body ?? "" }}
          />
          {article && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const updated = await voteKbArticle(article._id, true);
                  setArticle(updated);
                  queryClient.invalidateQueries({
                    queryKey: ["clientKbArticles"],
                  });
                }}
              >
                Helpful ({article.helpful})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const updated = await voteKbArticle(article._id, false);
                  setArticle(updated);
                  queryClient.invalidateQueries({
                    queryKey: ["clientKbArticles"],
                  });
                }}
              >
                Not helpful ({article.notHelpful})
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
