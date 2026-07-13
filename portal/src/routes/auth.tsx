import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, UserRound } from "lucide-react";

import loginHero from "@/assets/login.png";
import logo from "@/assets/logo.jpg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"login" | "password", string>>>({});
  const [login, setLogin] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

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
      const session = await authApi.login(login ?? "", password ?? "");

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
    <div className="min-h-dvh overflow-y-auto bg-primary sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:bg-background sm:p-5">
      <div className="grid min-h-dvh w-full overflow-hidden bg-transparent shadow-2xl ring-0 sm:min-h-0 sm:max-w-5xl sm:rounded-md sm:bg-card sm:ring-1 sm:ring-border lg:h-[min(620px,calc(100dvh-2.5rem))] lg:grid-cols-[0.86fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-white text-white lg:block lg:min-h-0">
          <img
            src={loginHero}
            alt="Modern residential tower"
            width={1280}
            height={1600}
            className="absolute inset-0 h-full w-full object-contain object-top sm:object-cover"
          />
          <div className="absolute inset-0 bg-primary/10" />

          <div className="relative z-10 flex h-full min-h-0 flex-col px-5 py-5 sm:px-8 sm:py-8">
            <Link to="/splash" className="block w-fit">
              <img
                src={logo}
                alt="Gurimaal"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            </Link>

            <div className="flex-1" />
          </div>
        </aside>

        <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-5 sm:px-8 lg:min-h-0 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,219,117,0.24),_transparent_42%),linear-gradient(180deg,_#062b6f_0%,_#061f4f_100%)] sm:hidden" />
          <div className="absolute -left-20 top-12 h-44 w-44 rounded-full bg-accent/15 blur-3xl sm:hidden" />
          <div className="absolute -right-24 bottom-16 h-56 w-56 rounded-full bg-white/10 blur-3xl sm:hidden" />
          <img
            src={logo}
            alt="Gurimaal"
            width={52}
            height={52}
            className="absolute top-10 h-13 w-13 rounded-full object-cover shadow-lg ring-1 ring-white/20 sm:hidden"
          />
          <Link
            to="/splash"
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 text-xs font-medium text-white/75 hover:text-white sm:text-muted-foreground sm:hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="relative z-10 mt-12 flex min-h-[340px] w-full max-w-[19.25rem] flex-col justify-center rounded-md bg-card px-5 py-6 shadow-2xl shadow-black/20 ring-1 ring-white/20 sm:mt-0 sm:min-h-[390px] sm:max-w-[21rem] sm:px-8 sm:py-8 sm:shadow-xl sm:ring-border">
            <h2 className="font-display text-lg font-semibold text-foreground">Login</h2>

            <form onSubmit={onSubmit} className="mt-5 space-y-3" autoComplete="off" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="login" className="sr-only">
                  Username or Email
                </Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login"
                    name="gurimaal-login"
                    type="text"
                    value={login ?? ""}
                    onChange={(event) => {
                      setLogin(event.target.value || null);
                      setError(null);
                      setFieldErrors((current) => ({ ...current, login: undefined }));
                    }}
                    autoComplete="off"
                    placeholder="username ama email"
                    aria-invalid={Boolean(fieldErrors.login)}
                    className="h-10 rounded-md pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="gurimaal-password"
                    type={showPassword ? "text" : "password"}
                    value={password ?? ""}
                    onChange={(event) => {
                      setPassword(event.target.value || null);
                      setError(null);
                      setFieldErrors((current) => ({ ...current, password: undefined }));
                    }}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={Boolean(fieldErrors.password)}
                    className="h-10 rounded-md pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-primary-soft hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 pt-0.5">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  id="remember"
                  className="h-3.5 w-3.5 rounded-[3px]"
                />
                <span className="text-xs text-foreground">Remember me</span>
              </label>

              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-[var(--shadow-button)] hover:bg-[var(--color-primary-hover)]"
              >
                {loading ? "Please wait..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-3 text-center">
              <Link
                to="/forgot-password"
                className="text-[11px] font-medium text-muted-foreground hover:text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <p className="mt-4 text-center text-[10px] leading-4 text-muted-foreground">
              By continuing you agree to our{" "}
              <Link className="font-medium text-primary hover:underline" to="/splash">
                Privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function validateSignIn(login: string | null, password: string | null) {
  const errors: Partial<Record<"login" | "password", string>> = {};
  if (!login?.trim()) {
    errors.login = "Gali username-ka ama email-ka.";
  } else if (login.trim().length < 2) {
    errors.login = "Username-ka ama email-ka waa khaldan yahay.";
  }
  if (!password) {
    errors.password = "Gali password-ka.";
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
  const message = cleanBackendError(rawMessage);
  if (message && !message.includes("AuthenticationError")) {
    return message;
  }
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

function cleanBackendError(message: string) {
  const clean = message
    .replace(/^frappe\.[\w.]+:\s*/i, "")
    .replace(/^frappe\.exceptions\.[\w.]+:\s*/i, "")
    .trim();

  return clean || message;
}

function getLoginFieldErrors(message: string): Partial<Record<"login" | "password", string>> {
  if (message.includes("Username-ka") || message.includes("email-ka")) return { login: message };
  if (message.includes("Password-ka")) return { password: message };
  return { login: message, password: message };
}
