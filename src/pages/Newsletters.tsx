import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  MailOpen,
  CalendarDays,
  CalendarClock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import {
  fetchMyNewsletters,
  fetchMyNewsletter,
  type Newsletter,
} from "@/lib/newsletters-api";

const typeStyles: Record<Newsletter["type"], string> = {
  Newsletter: "bg-primary/10 text-primary border-primary/20",
  "Event invite": "bg-info/10 text-info border-info/20",
};

// Real preview, derived from the real body — strips HTML and
// truncates, rather than a separately-authored summary field that
// doesn't exist on the backend.
const previewFrom = (html: string, max = 140) => {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export default function Newsletters() {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: newsletters = [], isLoading } = useQuery({
    queryKey: ["my-newsletters"],
    queryFn: fetchMyNewsletters,
  });

  const { data: openNewsletter } = useQuery({
    queryKey: ["my-newsletter", openId],
    queryFn: () => fetchMyNewsletter(openId!),
    enabled: !!openId,
  });

  const openLetter = (id: string) => {
    setOpenId(id);
    // Fetching the single newsletter marks it opened on the real
    // backend; refresh the list so the unread indicator updates
    // without waiting for a full page reload.
    queryClient.invalidateQueries({ queryKey: ["my-newsletters"] });
  };

  return (
    <PortalLayout
      title="Newsletters"
      subtitle="Updates and insights shared by your firm"
    >
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && !newsletters.length && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No newsletters yet. Updates your firm shares will appear here.
            </CardContent>
          </Card>
        )}
        {newsletters.map((n) => {
          const isRead = n.opened;
          return (
            <Card key={n._id} className="animate-fade-in">
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isRead
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isRead ? (
                    <MailOpen className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={typeStyles[n.type]}>
                      {n.type}
                    </Badge>
                    {!isRead && (
                      <span className="text-[10px] font-semibold uppercase text-primary">
                        New
                      </span>
                    )}
                  </div>
                  <h3
                    className={`font-heading ${isRead ? "font-medium" : "font-bold"} text-foreground`}
                  >
                    {n.subject || n.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {previewFrom(n.body)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />{" "}
                    {new Date(n.sentAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => openLetter(n._id)}
                >
                  Read
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {openNewsletter?.subject || openNewsletter?.name}
            </DialogTitle>
          </DialogHeader>
          {openNewsletter && (
            <>
              <p className="text-xs text-muted-foreground">
                {openNewsletter.type} ·{" "}
                {new Date(openNewsletter.sentAt).toLocaleDateString()}
              </p>
              {openNewsletter.event && (
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <p className="font-medium">{openNewsletter.event.title}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <CalendarClock className="h-3 w-3" />{" "}
                    {openNewsletter.event.dateTime}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />{" "}
                    {openNewsletter.event.location}
                  </p>
                  {openNewsletter.event.rsvp && (
                    <p className="text-xs text-primary">RSVP requested</p>
                  )}
                </div>
              )}
              <div
                className="space-y-3 max-h-[60vh] overflow-auto text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: openNewsletter.body }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
