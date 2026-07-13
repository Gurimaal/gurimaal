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
  Phone,
} from "lucide-react";

import logo from "@/assets/logo.jpg.png";
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
import { getSessionDisplayName, getSessionInitials, getStoredSession } from "@/lib/auth";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Property", url: "/property", icon: Building2 },
  { title: "My Contract", url: "/contract", icon: FileText },
  { title: "Billing & Payments", url: "/billing", icon: CreditCard },
  { title: "Payments", url: "/payments", icon: CreditCard },
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
  const displayName = getSessionDisplayName(session);
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar
      collapsible="icon"
      className="h-svh overflow-hidden border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="h-20 border-b border-sidebar-border bg-sidebar">
        <Link to="/" className="group flex h-full items-center gap-3 px-4">
          <div className="brand-logo-shell relative grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm">
            <img
              src={logo}
              alt="Gurimaal"
              width={40}
              height={40}
              className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-base font-extrabold uppercase tracking-normal text-sidebar-foreground">
              Gurimaal
            </div>
            <div className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Tenancy Portal
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel className="px-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3 pt-2">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="relative h-9 rounded-xl px-3 text-[13px] font-bold text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[var(--shadow-button)]"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-1.5 border-t border-sidebar-border bg-sidebar p-2.5">
        <a
          href="tel:+252612345678"
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-secondary/35 bg-secondary-soft px-3 text-xs font-extrabold text-primary shadow-sm transition hover:border-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 group-data-[collapsible=icon]:hidden"
          aria-label="Contact property manager"
        >
          <Phone className="h-3.5 w-3.5" />
          Contact Manager
        </a>
        <Link
          to="/profile"
          className="inline-flex h-10 w-full items-center gap-2 rounded-xl border border-sidebar-border bg-card px-2.5 shadow-[var(--shadow-card)] transition hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          aria-label="Open tenant profile"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-primary text-[11px] font-extrabold text-primary-foreground">
              {getSessionInitials(session)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-xs font-extrabold text-foreground">{displayName}</div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
