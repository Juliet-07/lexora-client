import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Bell,
  User,
  CheckSquare,
  AlertTriangle,
  LogOut,
  CalendarDays,
  Wallet,
  Banknote,
  Clock,
  Target,
  GraduationCap,
  Inbox,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser, isEmployee } from "@/hooks/useCurrentUser";

const clientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Onboarding", url: "/onboarding", icon: CheckSquare },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const employeeItems = [
  { title: "My Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/employee/profile", icon: User },
  { title: "My Leave", url: "/employee/leave", icon: CalendarDays },
  { title: "My Payslips", url: "/employee/payslips", icon: Wallet },
  { title: "My Loans", url: "/employee/loans", icon: Banknote },
  { title: "My Time", url: "/employee/time", icon: Clock },
  { title: "My Performance", url: "/employee/performance", icon: Target },
  { title: "My Training", url: "/employee/training", icon: GraduationCap },
  { title: "My Documents", url: "/documents", icon: FileText },
  { title: "My Requests", url: "/employee/requests", icon: Inbox },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function PortalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const employee = isEmployee(user);
  const mainItems = employee ? employeeItems : clientItems;

  return (
    <Sidebar collapsible="icon" className="gradient-sidebar border-r-0">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-3 py-4 mb-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-sidebar-primary-foreground">
                {employee ? "EP" : "CP"}
              </span>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <p className="text-sm font-heading font-bold text-sidebar-primary-foreground">
                  {employee ? "Employee Portal" : "Client Portal"}
                </p>
                <p className="text-xs text-sidebar-foreground/60">Welcome back</p>
              </div>
            )}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {employee ? "My Workspace" : "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all"
                      activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 mr-2 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 border-t border-sidebar-border mt-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-primary" />
            </div>
            <div className="animate-fade-in">
              <p className="text-xs font-medium text-sidebar-primary-foreground">
                {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : ""}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50">{user?.email}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
