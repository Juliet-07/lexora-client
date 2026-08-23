import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Bell,
  FileSignature,
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
  Users,
  BarChart3,
  LifeBuoy,
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
import {
  useCurrentUser,
  isEmployee,
  PortalType,
  getPortalType,
} from "@/hooks/useCurrentUser";

const kycClientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Onboarding", url: "/onboarding", icon: CheckSquare },
  { title: "Projects", url: "/projects", icon: Target },
  { title: "Contracts", url: "/contracts", icon: FileSignature },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Newsletters", url: "/newsletters", icon: Inbox },
  { title: "Service Desk", url: "/service-desk", icon: LifeBuoy },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "My Profile", url: "/profile", icon: User },
];

const boardItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "HR Overview", url: "/board/hr", icon: Users },
  { title: "Payroll", url: "/board/payroll", icon: BarChart3 },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const clientClientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const portalMeta: Record<
  PortalType,
  { label: string; initials: string; groupLabel: string }
> = {
  employee: {
    label: "Employee Portal",
    initials: "EP",
    groupLabel: "My Workspace",
  },
  board: { label: "Board Portal", initials: "BP", groupLabel: "Board View" },
  client_client: {
    label: "Client Portal",
    initials: "CP",
    groupLabel: "My Portal",
  },
  kyc_client: {
    label: "Client Portal",
    initials: "CP",
    groupLabel: "Main Menu",
  },
  unknown: { label: "Client Portal", initials: "CP", groupLabel: "Main Menu" },
};

function getNavItems(portalType: PortalType) {
  switch (portalType) {
    case "board":
      return boardItems;
    case "client_client":
      return clientClientItems;
    case "kyc_client":
    default:
      return kycClientItems;
  }
}

export function PortalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const portalType = getPortalType(user);
  const meta = portalMeta[portalType];
  const navItems = getNavItems(portalType);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="gradient-sidebar border-r-0">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-3 py-4 mb-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-sidebar-primary-foreground">
                {meta.initials}
              </span>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <p className="text-sm font-heading font-bold text-sidebar-primary-foreground">
                  {meta.label}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  Welcome back
                </p>
              </div>
            )}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {meta.groupLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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
                {user
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : ""}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
