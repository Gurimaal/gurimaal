import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";

import authHero from "@/assets/auth-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password · Gurimaal" },
      { name: "description", content: "Reset your Gurimaal tenant portal password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={authHero}
          alt=""
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.28 0.09 258 / 0.72) 0%, oklch(0.18 0.06 260 / 0.9) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/splash" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <span className="font-display text-lg font-black">G</span>
            </div>
            <span className="font-display text-lg font-bold">Gurimaal</span>
          </Link>
          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Password recovery
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
              Lost your keys? <span className="text-accent">We'll help you back in.</span>
            </h2>
            <p className="mt-4 text-white/70">
              Enter the email on your tenancy and we'll send a secure reset link.
            </p>
          </div>
          <p className="text-xs text-white/50">© 2026 Gurimaal · All rights reserved</p>
        </div>
      </aside>

      <section className="relative flex min-h-dvh flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between lg:hidden">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
            G
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {sent ? (
            <div className="animate-fade-in text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary-soft text-secondary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
                Check your inbox
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a password reset link to{" "}
                <span className="font-semibold text-foreground">
                  {email || "your email"}
                </span>
                . The link expires in 30 minutes.
              </p>
              <Button asChild size="lg" className="mt-8 h-12 w-full rounded-xl">
                <Link to="/auth">Back to sign in</Link>
              </Button>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Didn't receive it? Try a different email
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>

              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
                Forgot password?
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                No worries. Enter your email and we'll send you a secure reset link.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@residents.com"
                      className="h-11 rounded-xl pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="group h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
                >
                  {loading ? "Sending…" : "Send reset link"}
                  {!loading && (
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link
                  to="/auth"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
