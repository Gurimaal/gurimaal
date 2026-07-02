import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Re-mounts children on route change so the CSS enter animation replays.
 * Uses `animate-fade-in` (already defined in the design system).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
