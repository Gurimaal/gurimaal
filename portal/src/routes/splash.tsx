import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import splashHero from "@/assets/splash-hero.jpg";
import { Button } from "@/components/ui/button";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => {
      navigate({ to: "/auth" });
    }, 3800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[oklch(0.12_0.03_260)] text-white">
      {/* Background image */}
      <img
        src={splashHero}
        alt=""
        width={1280}
        height={1600}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      {/* Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.05 260 / 0.55) 0%, oklch(0.12 0.05 260 / 0.75) 55%, oklch(0.1 0.04 260 / 0.95) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute -right-32 top-10 h-[360px] w-[360px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--secondary), transparent 60%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-between px-6 py-14">
        {/* Top badge */}
        <div
          className={`flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-700 ${
            mounted ? "opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Real Estate & Utility Portal
        </div>

        {/* Center brand */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`grid h-24 w-24 place-items-center rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 transition-all duration-700 ${
              mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--info))",
                color: "var(--primary-foreground)",
              }}
            >
              G
            </div>
          </div>
          <h1
            className={`mt-8 font-display text-5xl font-extrabold tracking-tight transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            Gurimaal
          </h1>
          <p
            className={`mt-3 max-w-xs text-balance text-sm leading-relaxed text-white/70 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "450ms" }}
          >
            Rent, utilities and maintenance — beautifully organised in one home.
          </p>

          {/* Feature chips */}
          <div
            className={`mt-8 flex flex-wrap justify-center gap-2 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            {[
              { icon: Building2, label: "My Property" },
              { icon: ShieldCheck, label: "Secure Pay" },
              { icon: Sparkles, label: "Smart Utilities" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur"
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div
          className={`flex w-full flex-col items-center gap-4 transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <Button
            asChild
            size="lg"
            className="group h-12 w-full rounded-2xl bg-white text-[color:var(--primary)] shadow-xl hover:bg-white/90"
          >
            <Link to="/auth">
              Get started
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
          <p className="text-[11px] text-white/50">
            v1.0 · Built for residents
          </p>
        </div>
      </div>
    </div>
  );
}
