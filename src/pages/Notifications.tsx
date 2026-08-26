import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Inbox,
  Loader2,
} from "lucide-react";
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type ClientNotification,
  type ClientNotificationType,
} from "@/lib/notifications-api";

const typeStyles: Record<ClientNotificationType, string> = {
  Document: "bg-primary/10 text-primary",
  Invoice: "bg-warning/10 text-warning",
  Payment: "bg-success/10 text-success",
  Ticket: "bg-info/10 text-info",
  Compliance: "bg-destructive/10 text-destructive",
  Onboarding: "bg-info/10 text-info",
  Newsletter: "bg-secondary/10 text-secondary",
  General: "bg-muted text-muted-foreground",
};
const typeIcon: Record<ClientNotificationType, typeof Bell> = {
  Document: FileText,
  Invoice: CreditCard,
  Payment: CheckCircle2,
  Ticket: Inbox,
  Compliance: ShieldAlert,
  Onboarding: AlertTriangle,
  Newsletter: Inbox,
  General: Bell,
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["client-notifications"],
    queryFn: fetchMyNotifications,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["client-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  const readMut = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  });
  const markAllMut = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  });

  const handleClick = (n: ClientNotification) => {
    if (!n.read) readMut.mutate(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <PortalLayout title="Notifications" subtitle={`${unreadCount} unread`}>
      <div className="max-w-3xl mx-auto">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">
                All Notifications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs"
                disabled={!unreadCount || markAllMut.isPending}
                onClick={() => markAllMut.mutate()}
              >
                Mark all as read
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length ? (
              <div className="divide-y">
                {notifications.map((notif) => {
                  const Icon = typeIcon[notif.type] ?? Bell;
                  return (
                    <button
                      key={notif._id}
                      onClick={() => handleClick(notif)}
                      className={`flex w-full items-start gap-4 p-4 text-left transition-colors ${
                        !notif.read ? "bg-accent/30" : "hover:bg-accent/20"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${typeStyles[notif.type] ?? typeStyles.General}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        {notif.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notif.description}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                You have no notifications yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
