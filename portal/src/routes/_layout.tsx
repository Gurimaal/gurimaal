import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PageTransition } from "@/components/PageTransition";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/_layout")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/splash" });
    }
  },
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <SidebarProvider>
      <div className="portal-shell flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-x-hidden px-3 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8 md:pb-8">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
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
