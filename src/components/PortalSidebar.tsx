import {
  LayoutDashboard,
  CreditCard,
  Bell,
  FileSignature,
  User,
  CheckSquare,
  AlertTriangle,
  LogOut,
  Target,
  Inbox,
  LifeBuoy,
  Scale,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Onboarding", url: "/onboarding", icon: CheckSquare },
  { title: "Projects", url: "/projects", icon: Target },
  { title: "Cases", url: "/cases", icon: Scale },
  { title: "Contracts", url: "/contracts", icon: FileSignature },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Newsletters", url: "/newsletters", icon: Inbox },
  { title: "Service Desk", url: "/service-desk", icon: LifeBuoy },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "My Profile", url: "/profile", icon: User },
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

  return (
    <Sidebar collapsible="icon" className="gradient-sidebar border-r-0">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center px-3 py-4 mb-2">
            {collapsed ? (
              <img
                src="/lexora-mark-light.png"
                alt="Lexora Africa"
                width={272}
                height={354}
                className="h-8 w-auto shrink-0"
              />
            ) : (
              <img
                src="/lexora-logo-light.png"
                alt="Lexora Africa — Governance, Risk, Compliance, Beyond"
                width={1149}
                height={408}
                className="h-9 w-auto max-w-full shrink-0 animate-fade-in"
              />
            )}
          </div>
        </SidebarGroup>

        <SidebarGroup>
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
