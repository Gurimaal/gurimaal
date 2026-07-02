import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

import authHero from "@/assets/auth-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Gurimaal" },
      { name: "description", content: "Sign in to your Gurimaal tenant portal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock auth — replace with Lovable Cloud when ready
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/" });
    }, 700);
  }

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      {/* Visual side */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={authHero}
          alt="Modern residential tower at sunset"
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.28 0.09 258 / 0.72) 0%, oklch(0.18 0.06 260 / 0.85) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/splash" className="flex items-center gap-2 text-white/80 hover:text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <span className="font-display text-lg font-black">G</span>
            </div>
            <span className="font-display text-lg font-bold">Gurimaal</span>
          </Link>

          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Welcome home
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
              Everything you need for tenancy —{" "}
              <span className="text-accent">in one place.</span>
            </h2>
            <p className="mt-4 text-white/70">
              Pay rent, track utilities, request maintenance and view your contract.
              Designed to feel effortless on any device.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#F4B400", "#2E8B57", "#1E4D8C"].map((c) => (
                  <div
                    key={c}
                    className="h-8 w-8 rounded-full border-2 border-white/40"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/70">
                Trusted by 2,400+ residents across 18 buildings
              </p>
            </div>
          </div>

          <p className="text-xs text-white/50">© 2026 Gurimaal · All rights reserved</p>
        </div>
      </aside>

      {/* Form side */}
      <section className="relative flex min-h-dvh flex-col px-5 py-8 sm:px-8">
        {/* Mobile header */}
        <div className="flex items-center justify-between lg:hidden">
          <Link
            to="/splash"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link to="/splash" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              G
            </div>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {/* Mode switcher */}
          <div className="inline-flex self-start rounded-full border border-border bg-muted/50 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue to your tenant portal."
              : "Set up your Gurimaal tenant profile in a minute."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ahmed Hassan"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@residents.com"
                  className="h-11 rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  id="remember"
                />
                <span className="text-sm text-foreground">Remember me for 30 days</span>
              </label>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="group mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
            >
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              {!loading && (
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-xl" type="button">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" type="button">
              <AppleIcon className="mr-2 h-4 w-4" />
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to Gurimaal's{" "}
            <a className="font-medium text-foreground hover:underline" href="#">
              Terms
            </a>{" "}
            &{" "}
            <a className="font-medium text-foreground hover:underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.7 14.7 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.24 3.02-.82.83-2.05 1.47-3.11 1.39-.13-1.1.44-2.24 1.2-3 .84-.86 2.28-1.5 3.15-1.41zM20.5 17.25c-.55 1.27-.82 1.84-1.53 2.96-1 1.55-2.4 3.48-4.14 3.5-1.55.01-1.95-1.01-4.05-1-2.1.01-2.55 1.02-4.1 1.01-1.74-.02-3.06-1.77-4.06-3.32C.28 16.9-.28 11.83 1.9 9.13c1.16-1.44 2.98-2.34 4.7-2.34 1.75 0 2.85 1 4.29 1 1.4 0 2.26-1 4.29-1 1.53 0 3.15.84 4.3 2.29-3.78 2.07-3.17 7.47 1.02 8.17z" />
    </svg>
  );
}
