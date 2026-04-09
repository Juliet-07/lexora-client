import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

const notifications = [
  { id: 1, title: "Document ready for signature", description: "Engagement Letter requires your e-signature", type: "action", time: "2 hours ago", read: false, icon: FileText },
  { id: 2, title: "Invoice #1042 generated", description: "A new invoice of $2,500.00 has been created", type: "billing", time: "5 hours ago", read: false, icon: CreditCard },
  { id: 3, title: "KYC reminder", description: "Please complete your KYC verification by Apr 15", type: "reminder", time: "1 day ago", read: true, icon: AlertTriangle },
  { id: 4, title: "Tax filing update", description: "Your tax return draft is now under review", type: "update", time: "2 days ago", read: true, icon: Clock },
  { id: 5, title: "Payment confirmed", description: "Payment of $1,800.00 for INV-1041 received", type: "success", time: "3 days ago", read: true, icon: CheckCircle2 },
  { id: 6, title: "Compliance deadline approaching", description: "Annual compliance filing due Jun 30, 2026", type: "reminder", time: "5 days ago", read: true, icon: AlertTriangle },
];

const typeStyles: Record<string, string> = {
  action: "bg-primary/10 text-primary",
  billing: "bg-warning/10 text-warning",
  reminder: "bg-destructive/10 text-destructive",
  update: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
};

export default function Notifications() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PortalLayout title="Notifications" subtitle={`${unreadCount} unread`}>
      <div className="max-w-3xl mx-auto">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">All Notifications</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">Mark all as read</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 transition-colors ${
                    !notif.read ? "bg-accent/30" : "hover:bg-accent/20"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${typeStyles[notif.type]}`}>
                    <notif.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
