import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Wrench,
  Menu,
  FileText,
  Zap,
  CalendarCheck,
  FolderOpen,
  Bell,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const primaryNav = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Property", url: "/property", icon: Building2 },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Repairs", url: "/maintenance", icon: Wrench },
];

const secondaryNav = [
  { title: "My Property", url: "/property", icon: Building2 },
  { title: "My Contract", url: "/contract", icon: FileText },
  { title: "Billing & Payments", url: "/billing", icon: CreditCard },
  { title: "Utility Bills", url: "/utilities", icon: Zap },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Requests", url: "/requests", icon: CalendarCheck },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

function useActive() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (url: string) => (url === "/" ? path === "/" : path.startsWith(url));
}

export function MobileBottomNav() {
  const isActive = useActive();
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {primaryNav.map((item) => {
          const active = isActive(item.url);
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-primary-soft",
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="leading-none">{item.title}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                aria-label="Open more menu"
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="grid h-7 w-14 place-items-center rounded-full">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="leading-none">More</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85dvh] rounded-t-3xl">
              <DrawerHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary-soft text-primary font-semibold">
                      AH
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <DrawerTitle className="truncate text-base">
                      Ahmed Hassan
                    </DrawerTitle>
                    <DrawerDescription className="truncate text-xs">
                      Unit 12B · Skyline Tower
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>
              <div
                className="overflow-y-auto overscroll-contain px-4 pb-6"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                <ul className="grid grid-cols-3 gap-3" role="list">
                  {secondaryNav.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <li key={item.title}>
                        <Link
                          to={item.url}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-24 flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            active
                              ? "border-primary/30 bg-primary-soft text-primary"
                              : "border-border bg-card hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-10 w-10 place-items-center rounded-xl",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            )}
                          >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="text-xs font-medium leading-tight">
                            {item.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </DrawerContent>
          </Drawer>
        </li>
      </ul>
    </nav>
  );
}
