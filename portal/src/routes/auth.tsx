import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, UserRound } from "lucide-react";

import authHero from "@/assets/auth-hero.jpg";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/api/authApi";
import { isAuthenticated, storeSession } from "@/lib/auth";

const SPLASH_READY_KEY = "gurimaal.portal.splash.ready";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/" });
    }

    if (typeof window !== "undefined" && window.sessionStorage.getItem(SPLASH_READY_KEY) !== "1") {
      throw redirect({ to: "/splash" });
    }
  },
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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"login" | "password", string>>>({});
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nextErrors = validateSignIn(login, password);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError(getFieldValidationMessage(nextErrors));
      return;
    }

    setLoading(true);
    try {
      const session = await authApi.login(login, password);

      storeSession(session, remember);
      navigate({ to: "/" });
    } catch (loginError) {
      const message = getLoginErrorMessage(loginError);
      setError(message);
      setFieldErrors(getLoginFieldErrors(message));
    } finally {
      setLoading(false);
    }
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
            <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white/10 p-1 shadow-xl backdrop-blur-md ring-1 ring-white/20">
              <img
                src={logo}
                alt="Gurimaal"
                width={44}
                height={44}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-lg font-bold">Gurimaal</span>
          </Link>

          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Welcome home
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
              Everything you need for tenancy — <span className="text-accent">in one place.</span>
            </h2>
            <p className="mt-4 text-white/70">
              Pay rent, track utilities, request maintenance and view your contract. Designed to
              feel effortless on any device.
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
            <div className="brand-logo-shell h-10 w-10 overflow-hidden rounded-2xl shadow-sm">
              <img
                src={logo}
                alt="Gurimaal"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your tenant portal.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="login">Username or Email</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(event) => {
                    setLogin(event.target.value);
                    setError(null);
                    setFieldErrors((current) => ({ ...current, login: undefined }));
                  }}
                  autoComplete="username"
                  placeholder="username ama email"
                  aria-invalid={Boolean(fieldErrors.login)}
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                    setFieldErrors((current) => ({ ...current, password: undefined }));
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(fieldErrors.password)}
                  className="h-11 rounded-xl pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 pt-1">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                id="remember"
              />
              <span className="text-sm text-foreground">Remember me for 30 days</span>
            </label>

            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="group mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? "Please wait…" : "Sign in"}
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

          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              type="button"
              onClick={() =>
                window.alert("Google sign-in is not connected yet. Please use email and password.")
              }
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to Gurimaal's{" "}
            <Link className="font-medium text-foreground hover:underline" to="/splash">
              Terms
            </Link>{" "}
            &{" "}
            <Link className="font-medium text-foreground hover:underline" to="/splash">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function validateSignIn(login: string, password: string) {
  const errors: Partial<Record<"login" | "password", string>> = {};
  if (!login.trim()) {
    errors.login = "Gali username-ka ama email-ka.";
  } else if (login.trim().length < 2) {
    errors.login = "Username-ka ama email-ka waa khaldan yahay.";
  }
  if (!password) {
    errors.password = "Gali password-ka.";
  } else if (password.length < 8) {
    errors.password = "Password-ka waa khaldan yahay.";
  }

  return errors;
}

function getFieldValidationMessage(errors: Partial<Record<"login" | "password", string>>) {
  if (errors.login?.startsWith("Gali") && errors.password?.startsWith("Gali")) {
    return "Gali username/email-ka iyo password-ka.";
  }

  if (errors.login && errors.password) {
    return `${errors.login} ${errors.password}`;
  }

  return errors.login || errors.password || "Username/email ama password waa qalad.";
}

function getLoginErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";
  if (rawMessage.includes("Username-ka ama email-ka waa khaldan yahay")) {
    return "Username-ka ama email-ka waa khaldan yahay.";
  }
  if (rawMessage.includes("Password-ka waa khaldan yahay")) {
    return "Password-ka waa khaldan yahay.";
  }
  if (
    rawMessage.includes("AuthenticationError") ||
    rawMessage.toLowerCase().includes("invalid") ||
    rawMessage.toLowerCase().includes("password") ||
    rawMessage.toLowerCase().includes("login")
  ) {
    return "Username/email ama password waa qalad.";
  }

  return rawMessage || "Username/email ama password waa qalad.";
}

function getLoginFieldErrors(message: string): Partial<Record<"login" | "password", string>> {
  if (message.includes("Username-ka") || message.includes("email-ka")) return { login: message };
  if (message.includes("Password-ka")) return { password: message };
  return { login: message, password: message };
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
