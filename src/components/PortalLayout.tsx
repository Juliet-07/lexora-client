import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PortalSidebar } from "@/components/PortalSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "@/lib/notifications-api";

interface PortalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PortalLayout({ children, title, subtitle }: PortalLayoutProps) {
  // Real, live unread count — quietly refreshed in the background so
  // the dot stays current without needing to reopen the app.
  const { data: unread } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  });
  const hasUnread = (unread?.count ?? 0) > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              <div>
                <h1 className="text-lg font-heading font-bold text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground"
                asChild
              >
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
