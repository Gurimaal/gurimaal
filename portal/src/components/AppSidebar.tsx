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

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Property", url: "/property", icon: Building2 },
  { title: "My Contract", url: "/contract", icon: FileText },
  { title: "Billing & Payments", url: "/billing", icon: CreditCard },
  { title: "Utility Bills", url: "/utilities", icon: Zap },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Requests", url: "/requests", icon: CalendarCheck },
  { title: "Documents", url: "/documents", icon: FolderOpen },
];

const bottomNav = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
            G
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-base font-bold text-sidebar-foreground">
              Gurimaal
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              Tenant Portal
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary-soft text-primary font-semibold">
              AH
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">Ahmed Hassan</div>
            <div className="truncate text-xs text-muted-foreground">
              Unit 12B · Skyline Tower
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
