import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  FileText,
  CreditCard,
  Zap,
  Wrench,
  CalendarCheck,
  FolderOpen,
  Bell,
  User,
} from "lucide-react";

import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getSessionDisplayName,
  getSessionInitials,
  getSessionSubtitle,
  getStoredSession,
} from "@/lib/auth";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Property", url: "/property", icon: Building2 },
  { title: "My Contract", url: "/contract", icon: FileText },
  { title: "Billing & Payments", url: "/billing", icon: CreditCard },
  { title: "Payment History", url: "/payments", icon: CreditCard },
  { title: "Utility Bills", url: "/utilities", icon: Zap },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Requests", url: "/requests", icon: CalendarCheck },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const session = getStoredSession();
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-28 border-b border-sidebar-border">
        <Link to="/" className="group flex h-full items-center gap-3 px-4">
          <div className="brand-logo-shell relative grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-sm">
            <img
              src={logo}
              alt="Gurimaal"
              width={48}
              height={48}
              className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-white" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-lg font-black text-sidebar-foreground">Gurimaal</div>
            <div className="truncate text-xs font-medium text-muted-foreground">Tenancy Portal</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-8">
          <SidebarGroupLabel className="px-6 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4 px-5 pt-2">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="nav-link-glow relative h-14 rounded-2xl px-4 text-base font-bold text-sidebar-foreground transition-all duration-200 hover:bg-primary-soft hover:text-primary data-[active=true]:bg-primary-soft data-[active=true]:text-primary data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3 shadow-[var(--shadow-card)]">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {getSessionInitials(session)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">{getSessionDisplayName(session)}</div>
            <div className="truncate text-xs text-muted-foreground">
              {getSessionSubtitle(session)}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
