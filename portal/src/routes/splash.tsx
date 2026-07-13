import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import splashImage from "@/assets/splashh.png";

const SPLASH_READY_KEY = "gurimaal.portal.splash.ready";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Welcome to Gurimaal" },
      {
        name: "description",
        content:
          "The modern tenant portal for rent, utilities, maintenance and everything home.",
      },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_READY_KEY, "1");
      navigate({ to: "/auth" });
    }, 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="grid h-dvh w-screen place-items-center overflow-hidden bg-[#061f4f]">
      <div className="relative h-full max-h-dvh w-full max-w-[min(100vw,56.3dvh)]">
        <img
          src={splashImage}
          alt="Gurimaal"
          width={941}
          height={1672}
          className="h-full w-full object-contain object-center"
        />
        <div className="absolute left-1/2 top-[84%] w-[min(70%,280px)] -translate-x-1/2">
          <p className="text-center font-display text-[11px] font-semibold tracking-wide text-white/90 sm:text-xs">
            Your Property, Better Managed
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
            <div className="splash-sync-line h-full w-full origin-left rounded-full bg-accent shadow-[0_0_16px_rgba(110,219,117,0.9)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
