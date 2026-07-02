import { createFileRoute } from "@tanstack/react-router";
import { Camera, IdCard, KeyRound, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_layout/profile")({
  head: () => ({ meta: [{ title: "Profile · Gurimaal" }] }),
  component: ProfilePage,
});

const prefs = [
  { key: "email_rent", label: "Rent reminders", desc: "Emails 5 days before rent is due." },
  { key: "email_util", label: "Utility bill alerts", desc: "Get notified when a new bill is ready." },
  { key: "email_maint", label: "Maintenance updates", desc: "Status changes for your requests." },
  { key: "sms_urgent", label: "SMS for urgent notices", desc: "Only for emergencies and overdue notices." },
];

function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your personal details and preferences."
        actions={<Button>Save changes</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl font-bold">
                  AH
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">Ahmed Hassan</h3>
            <p className="text-sm text-muted-foreground">Tenant · Skyline Tower 12B</p>

            <Separator className="my-5" />

            <div className="w-full space-y-3 text-left text-sm">
              <Info icon={Mail} label="ahmed.hassan@example.com" />
              <Info icon={Phone} label="+971 50 123 4567" />
              <Info icon={IdCard} label="ID · 784-••••-7734" />
              <Info icon={ShieldCheck} label="Verified tenant" tone="secondary" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Personal information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue="Ahmed Hassan" />
              <Field label="Phone" defaultValue="+971 50 123 4567" />
              <Field label="Email" defaultValue="ahmed.hassan@example.com" type="email" />
              <Field label="National ID" defaultValue="784-1988-1234567-8" />
              <Field label="Emergency contact name" defaultValue="Layla Hassan" />
              <Field label="Emergency phone" defaultValue="+971 55 987 6543" />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {prefs.map((p, i) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Security</CardTitle>
                <p className="text-xs text-muted-foreground">Manage your password</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Field label="Current password" type="password" placeholder="••••••••" />
              <Field label="New password" type="password" placeholder="••••••••" />
              <Field label="Confirm password" type="password" placeholder="••••••••" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <Input id={id} defaultValue={defaultValue} type={type} placeholder={placeholder} />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  tone = "muted",
}: {
  icon: typeof UserRound;
  label: string;
  tone?: "muted" | "secondary";
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-2.5">
      <Icon className={`h-4 w-4 ${tone === "secondary" ? "text-secondary" : "text-muted-foreground"}`} />
      <span className="truncate text-sm">{label}</span>
    </div>
  );
}
