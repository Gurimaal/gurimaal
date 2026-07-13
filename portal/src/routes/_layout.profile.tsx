import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, IdCard, KeyRound, Mail, Moon, Phone, ShieldCheck } from "lucide-react";

import { tenantApi, type TenantProfile } from "@/api/tenantApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { applyTheme, getStoredTheme, setStoredTheme } from "@/lib/theme";

export const Route = createFileRoute("/_layout/profile")({
  head: () => ({ meta: [{ title: "Profile · Gurimaal" }] }),
  component: ProfilePage,
});

const prefs = [
  { key: "email", label: "Email Notifications", desc: "Receive updates via email", checked: true },
  {
    key: "sms",
    label: "SMS Notifications",
    desc: "Receive SMS alerts for urgent updates",
    checked: false,
  },
  {
    key: "maintenance",
    label: "Maintenance Updates",
    desc: "Get notified when your maintenance status changes",
    checked: true,
  },
  {
    key: "billing",
    label: "Billing Reminders",
    desc: "Receive reminders before rent is due",
    checked: true,
  },
  {
    key: "contract",
    label: "Contract Reminders",
    desc: "Alerts about lease renewal and expiry",
    checked: true,
  },
  {
    key: "documents",
    label: "Document Updates",
    desc: "Notifications when documents are added to your file",
    checked: false,
  },
];

function ProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", mobile_no: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"email" | "mobile_no", string>>>(
    {},
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["tenant-profile"],
    queryFn: tenantApi.getProfile,
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      setForm({
        email: profile.email || "",
        mobile_no: profile.mobile_no || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const theme = getStoredTheme();
    setDarkMode(theme === "dark");
    applyTheme(theme);
  }, []);

  const updateProfile = useMutation({
    mutationFn: () =>
      tenantApi.updateProfile({
        email: form.email,
        mobile_no: form.mobile_no,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
    },
  });

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    updateProfile.mutate();
  }

  function toggleDarkMode(checked: boolean) {
    setDarkMode(checked);
    setStoredTheme(checked ? "dark" : "light");
  }

  const displayName = profile?.tenant_name || "Tenant";
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  return (
    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
      {profileQuery.error || updateProfile.error ? (
        <p className="xl:col-span-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {profileQuery.error?.message || updateProfile.error?.message}
        </p>
      ) : null}

      <aside className="space-y-5">
        <ProfileSummaryCard
          profile={profile}
          displayName={profileQuery.isLoading ? "Loading..." : displayName}
          initials={initials}
          photoUrl={photoUrl}
          onPhotoChange={setPhotoUrl}
          photoError={photoError}
          onPhotoError={setPhotoError}
        />
        <AccountSecurityCard />
      </aside>

      <div className="space-y-5">
        <form id="profile-form" onSubmit={submitProfile}>
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-extrabold text-foreground">Personal Information</h1>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-12 w-full rounded-xl px-6 font-bold sm:w-auto"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <div className="grid gap-x-5 gap-y-6 lg:grid-cols-2">
                <Field label="Full Name" value={displayName} disabled />
                <Field
                  label="Phone Number"
                  value={form.mobile_no}
                  error={fieldErrors.mobile_no}
                  onChange={(value) => {
                    setForm((current) => ({ ...current, mobile_no: value }));
                    setFieldErrors((current) => ({ ...current, mobile_no: undefined }));
                  }}
                />
                <Field
                  label="Email Address"
                  value={form.email}
                  type="email"
                  error={fieldErrors.email}
                  onChange={(value) => {
                    setForm((current) => ({ ...current, email: value }));
                    setFieldErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
                <Field
                  label="National ID"
                  value={maskNationalId(profile?.national_id)}
                  disabled
                  hint="read-only"
                />
                <Field label="Tenant ID" value={profile?.name || ""} disabled hint="read-only" />
                <Field
                  label="Customer Since"
                  value={profile?.customer || "Linked tenant"}
                  disabled
                  hint="read-only"
                />
              </div>
            </CardContent>
          </Card>
        </form>

        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <h2 className="text-xl font-extrabold text-foreground">Notification Preferences</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Choose how and when you receive updates.
            </p>

            <div className="mt-7 divide-y divide-border">
              <div className="flex items-start justify-between gap-4 py-4 sm:items-center">
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground sm:mt-0">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-foreground">Dark Mode</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use a darker theme across the tenant portal
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
              {prefs.map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-start justify-between gap-4 py-4 sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-base font-bold text-foreground">{pref.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch defaultChecked={pref.checked} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-red-200 bg-red-50/50 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-red-600">Danger Zone</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Request account deactivation or contact support if you need to close your tenant
              account.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-11 w-full rounded-lg border-red-400 text-red-600 hover:bg-red-100 sm:w-auto"
              onClick={() =>
                window.alert("Deactivation requests are routed to property management support.")
              }
            >
              Request Deactivation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSummaryCard({
  profile,
  displayName,
  initials,
  photoUrl,
  onPhotoChange,
  photoError,
  onPhotoError,
}: {
  profile?: TenantProfile;
  displayName: string;
  initials: string;
  photoUrl: string | null;
  onPhotoChange: (url: string) => void;
  photoError: string | null;
  onPhotoError: (message: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      onPhotoError("Choose an image under 5MB.");
      return;
    }
    onPhotoError(null);
    onPhotoChange(URL.createObjectURL(file));
  }

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardContent className="p-6 text-center">
        <div className="relative mx-auto h-24 w-24">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handlePhoto(event.target.files)}
          />
          <Avatar className="h-24 w-24">
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            aria-label="Change profile photo"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-extrabold text-foreground">{displayName}</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Tenant ID: {profile?.name || "Linked profile"}
        </p>
        {photoError ? (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
            {photoError}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-secondary">
          {profile?.status || "Active Tenant"}
        </span>

        <Separator className="my-6" />

        <div className="space-y-5 text-left">
          <ProfileFact label="Email" value={profile?.email || "No email"} />
          <ProfileFact label="Phone" value={profile?.mobile_no || "No phone"} />
          <ProfileFact
            label="National ID"
            value={maskNationalId(profile?.national_id) || "No national ID"}
          />
          <ProfileFact label="Unit" value={profile?.customer || "Linked tenant"} />
        </div>
      </CardContent>
    </Card>
  );
}

function AccountSecurityCard() {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-primary" />
          <h2 className="text-base font-extrabold text-foreground">Account Security</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-lg border-primary font-bold text-primary"
          onClick={() => window.alert("Password changes are handled from Frappe account settings.")}
        >
          Change Password
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 h-11 w-full rounded-lg text-muted-foreground"
          onClick={() =>
            window.alert("Two-factor authentication will be enabled from Frappe security settings.")
          }
        >
          Enable Two-Factor Auth
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  type = "text",
  hint,
  disabled,
  error,
  onChange,
}: {
  label: string;
  value?: string;
  type?: string;
  hint?: string;
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
        {hint ? (
          <span className="ml-1 text-xs font-semibold text-muted-foreground">({hint})</span>
        ) : null}
      </Label>
      <Input
        id={id}
        value={value ?? ""}
        type={type}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-lg bg-muted/30 font-medium disabled:opacity-100"
      />
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  const Icon =
    label === "Email"
      ? Mail
      : label === "Phone"
        ? Phone
        : label === "National ID"
          ? IdCard
          : ShieldCheck;

  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function maskNationalId(value?: string) {
  if (!value) return "";
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "T";
}

function validateProfile(form: { email: string; mobile_no: string }) {
  const errors: Partial<Record<"email" | "mobile_no", string>> = {};
  const email = form.email.trim();
  const mobileNo = form.mobile_no.trim();

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!mobileNo) {
    errors.mobile_no = "Phone number is required.";
  } else if (!/^[+\d][\d\s-]{6,18}$/.test(mobileNo)) {
    errors.mobile_no = "Enter a valid phone number.";
  }

  return errors;
}
