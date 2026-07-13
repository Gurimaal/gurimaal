import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Mail, Search } from "lucide-react";

import logo from "@/assets/logo.jpg.png";
import { authApi } from "@/api/authApi";
import { notificationsApi } from "@/api/notificationsApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  clearStoredSession,
  getSessionDisplayName,
  getSessionInitials,
  getSessionSubtitle,
  getStoredSession,
} from "@/lib/auth";

export function AppHeader() {
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
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-3 sm:h-18 sm:px-5">
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>

        <Link to="/" className="flex min-w-0 items-center gap-2 md:hidden">
          <div className="brand-logo-shell h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-sm">
            <img
              src={logo}
              alt="Gurimaal"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="truncate font-display text-sm font-bold">Gurimaal</span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="h-10 rounded-xl bg-muted/45 pl-9 pr-14 focus-visible:border-primary/40"
              aria-label="Search"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground lg:inline-flex">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Messages"
          >
            <Link to="/notifications">
              <Mail className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Link
            to="/profile"
            className="ml-1 hidden items-center gap-2 rounded-xl p-1 pr-2 hover:bg-muted sm:flex"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {getSessionInitials(session)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 leading-tight lg:block">
              <span className="block truncate text-sm font-semibold text-foreground">
                {getSessionDisplayName(session)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {getSessionSubtitle(session)}
              </span>
            </span>
          </Link>
          <Link to="/profile" className="sm:hidden">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {getSessionInitials(session)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button type="button" variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
