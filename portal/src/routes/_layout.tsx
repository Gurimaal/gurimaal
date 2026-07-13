import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut } from "lucide-react";

import logo from "@/assets/logo.png";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authApi } from "@/api/authApi";
import { notificationsApi } from "@/api/notificationsApi";
import {
  clearStoredSession,
  getSessionInitials,
  getStoredSession,
  isAuthenticated,
} from "@/lib/auth";

export const Route = createFileRoute("/_layout")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/splash" });
    }
  },
  component: PortalLayout,
});

function PortalLayout() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const notificationsQuery = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationsApi.unreadCount,
  });
  const unreadCount = notificationsQuery.data?.count ?? 0;

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearStoredSession();
      navigate({ to: "/auth" });
    }
  }

  return (
    <SidebarProvider>
      <div className="portal-shell flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-card/92 px-3 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl sm:h-20 sm:gap-3 sm:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <Link to="/" className="flex items-center gap-2 md:hidden">
              <div className="brand-logo-shell h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl">
                <img
                  src={logo}
                  alt="Gurimaal"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display text-sm font-bold sm:text-base">Gurimaal</span>
            </Link>
            <div className="hidden flex-1 md:block" />
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to="/notifications" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-background">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <Link to="/profile" className="ml-1">
                <Avatar className="h-9 w-9 sm:h-12 sm:w-12">
                  <AvatarFallback className="bg-primary text-sm font-black text-primary-foreground shadow-sm sm:text-base">
                    {getSessionInitials(session)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden px-3 py-5 pb-28 sm:px-8 sm:py-8 md:pb-8">
            <div className="mx-auto w-full max-w-[1450px] space-y-6 sm:space-y-8">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
