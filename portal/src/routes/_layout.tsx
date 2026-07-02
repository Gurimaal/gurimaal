import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export const Route = createFileRoute("/_layout")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <Link to="/" className="flex items-center gap-2 md:hidden">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
                G
              </div>
              <span className="font-display text-base font-bold">Gurimaal</span>
            </Link>
            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices, requests…"
                className="h-9 rounded-lg border-border bg-muted/40 pl-9"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to="/notifications" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                </Link>
              </Button>
              <Link to="/profile" className="ml-1">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary-soft text-primary font-semibold">
                    AH
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8">
            <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
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
