import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MailOpen, CalendarDays } from "lucide-react";
import { useState } from "react";

interface Newsletter {
  id: string;
  title: string;
  category: string;
  date: string;
  preview: string;
  body: string[];
}

const newsletters: Newsletter[] = [
  {
    id: "n1",
    title: "Q2 Tax Update: What changed this quarter",
    category: "Tax",
    date: "Aug 3, 2026",
    preview: "New filing thresholds, revised penalty regime and what it means for your business.",
    body: [
      "The revenue authority has published revised filing thresholds effective from the start of Q3. Businesses below the new turnover threshold may now file quarterly rather than monthly.",
      "The penalty regime for late submissions has also been restructured — fixed penalties are reduced, but interest on outstanding amounts now accrues daily.",
      "Action for you: review your filing calendar with your account manager to confirm whether your entity qualifies for the quarterly cycle.",
    ],
  },
  {
    id: "n2",
    title: "Beneficial ownership registers: annual refresh",
    category: "Compliance",
    date: "Jul 15, 2026",
    preview: "Annual confirmation of beneficial ownership details is now due for all registered entities.",
    body: [
      "All registered entities must confirm their beneficial ownership register annually, even where no changes have occurred.",
      "We will pre-populate your register from our records and share it for confirmation through your project workspace.",
    ],
  },
  {
    id: "n3",
    title: "Firm update: new advisory team and office hours",
    category: "Firm News",
    date: "Jun 28, 2026",
    preview: "Meet the new advisory team members and our extended client support hours.",
    body: [
      "We are pleased to welcome three new advisors to our corporate services team.",
      "Client support hours are extended to 8am–7pm on weekdays. Tickets raised through the service desk are triaged within four working hours.",
    ],
  },
];

const categoryStyles: Record<string, string> = {
  Tax: "bg-primary/10 text-primary border-primary/20",
  Compliance: "bg-warning/10 text-warning border-warning/20",
  "Firm News": "bg-info/10 text-info border-info/20",
};

export default function Newsletters() {
  const [open, setOpen] = useState<Newsletter | null>(null);
  const [read, setRead] = useState<string[]>(["n3"]);

  const openLetter = (n: Newsletter) => {
    setOpen(n);
    setRead((r) => (r.includes(n.id) ? r : [...r, n.id]));
  };

  return (
    <PortalLayout title="Newsletters" subtitle="Updates and insights shared by your firm">
      <div className="space-y-3">
        {newsletters.map((n) => {
          const isRead = read.includes(n.id);
          return (
            <Card key={n.id} className="animate-fade-in">
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={categoryStyles[n.category]}>
                      {n.category}
                    </Badge>
                    {!isRead && <span className="text-[10px] font-semibold uppercase text-primary">New</span>}
                  </div>
                  <h3 className={`font-heading ${isRead ? "font-medium" : "font-bold"} text-foreground`}>{n.title}</h3>
                  <p className="text-xs text-muted-foreground">{n.preview}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" /> {n.date}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => openLetter(n)}>
                  Read
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{open?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {open?.category} · {open?.date}
          </p>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {open?.body.map((p, i) => (
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
