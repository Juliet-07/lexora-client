import { PortalLayout } from "@/components/PortalLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  Wallet,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const recentNotifications = [
  { text: "Your leave request (Jun 12 – Jun 14) was approved", time: "2h ago" },
  { text: "May payslip is now available", time: "1d ago" },
  { text: "New e-learning module assigned: Data Privacy", time: "2d ago" },
];

const upcomingLeave = [
  { name: "Annual Leave", balance: 14, used: 6, total: 20 },
  { name: "Sick Leave", balance: 9, used: 1, total: 10 },
  { name: "Compassionate", balance: 3, used: 0, total: 3 },
];

export default function EmployeeDashboard() {
  const { data: user } = useCurrentUser();
  const firstName = user?.firstName ?? "there";

  return (
    <PortalLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Here's what's happening with your employment today"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Leave Balance"
            value="14"
            subtitle="Annual days remaining"
            icon={CalendarDays}
            variant="primary"
          />
          <StatCard
            title="Next Payslip"
            value="Jun 28"
            subtitle="Auto-generated"
            icon={Wallet}
            variant="success"
          />
          <StatCard
            title="Training Due"
            value="2"
            subtitle="1 overdue"
            icon={GraduationCap}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clock in/out + leave balances */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Time & Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground">You are currently</p>
                <p className="text-lg font-heading font-bold text-foreground mb-3">Clocked out</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gradient-primary">
                    <Play className="h-3.5 w-3.5 mr-1.5" /> Clock In
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" disabled>
                    <Pause className="h-3.5 w-3.5 mr-1.5" /> Clock Out
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Leave balances
                </p>
                {upcomingLeave.map((l) => (
                  <div key={l.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{l.name}</span>
                      <span className="text-muted-foreground">
                        {l.balance} / {l.total} days
                      </span>
                    </div>
                    <Progress value={(l.used / l.total) * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent notifications */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Inbox className="h-4 w-4" /> Recent Notifications
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentNotifications.map((n) => (
                  <div key={n.text} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{n.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
