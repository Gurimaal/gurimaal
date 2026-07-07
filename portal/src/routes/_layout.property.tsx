import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  Coffee,
  Dumbbell,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Wifi,
} from "lucide-react";

import authHero from "@/assets/auth-hero.jpg";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { propertyApi, type PropertyResponse } from "@/api/propertyApi";

export const Route = createFileRoute("/_layout/property")({
  head: () => ({ meta: [{ title: "My Property · Gurimaal" }] }),
  component: PropertyPage,
});

const amenities = [
  { label: "High-Speed WiFi", icon: Wifi },
  { label: "Parking Space", icon: Car },
  { label: "Fitness Center", icon: Dumbbell },
  { label: "Common Lounge", icon: Coffee },
];

const manager = {
  initials: "CC",
  name: "Cabdiraxmaan Cali",
  role: "Building Manager",
  company: "Gurimaal Properties Somalia",
  phone: "+252 61 555 0100",
  email: "manager@gurimaal.so",
  emergency: "+252 61 999 0000",
};

function PropertyPage() {
  const propertyQuery = useQuery({
    queryKey: ["my-property"],
    queryFn: propertyApi.getMyProperty,
  });

  const property = propertyQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Property"
        description="Details about the unit you currently live in."
        actions={
          <Button
            asChild
            variant="outline"
            className="h-12 gap-3 rounded-xl border-primary px-6 text-base font-bold text-primary"
          >
            <a href={`tel:${manager.phone}`}>
              <Phone className="h-5 w-5" />
              Contact Building
            </a>
          </Button>
        }
      />

      {propertyQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {propertyQuery.error.message}
        </p>
      ) : null}

      {propertyQuery.isLoading ? (
        <Card className="card-elevated p-6 text-sm text-muted-foreground">
          Loading property details...
        </Card>
      ) : !property ? (
        <Card className="card-elevated p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">No active property found</p>
          <p className="text-xs text-muted-foreground">
            Your property details will appear after an active contract is linked.
          </p>
        </Card>
      ) : (
        <PropertyContent property={property} />
      )}
    </div>
  );
}

function PropertyContent({ property }: { property: PropertyResponse }) {
  const unitNumber = property.unit?.unit_no || property.unit?.name || "-";
  const floor = property.floor?.floor_name || formatOrdinal(property.floor?.floor_number);
  const bedrooms = property.unit?.bedrooms || 0;
  const bathrooms = Math.max(1, Math.min(3, bedrooms - 1 || 1));
  const propertyName =
    property.building?.building_name || property.project?.project_name || "Residence";
  const address = [property.project?.address, property.project?.city].filter(Boolean).join(", ");
  const status =
    property.unit?.status === "Occupied" ? "Active" : property.unit?.status || "Active";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,0.95fr)]">
      <div className="space-y-8">
        <Card className="card-elevated overflow-hidden">
          <div className="relative min-h-56 overflow-hidden sm:min-h-72">
            <img
              src={authHero}
              alt={propertyName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/58" />
            <div className="relative flex min-h-56 flex-col justify-end p-5 text-white sm:min-h-72 sm:p-8">
              <span className="mb-6 w-fit rounded-full bg-secondary-soft px-4 py-2 text-sm font-black text-secondary">
                {status} Tenant
              </span>
              <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                {propertyName}
              </h2>
              <p className="mt-4 flex items-center gap-2 text-base font-semibold text-white/78">
                <MapPin className="h-5 w-5" />
                {address || "Address not set"}
              </p>
            </div>
          </div>

          <CardContent className="p-5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <FactTile value={unitNumber} label="Unit Number" />
              <FactTile value={floor || "-"} label="Floor" />
              <FactTile value={`${bedrooms} Beds`} label="Bedrooms" />
              <FactTile value={`${bathrooms} Bath`} label="Bathrooms" />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <InfoTile icon={CalendarDays} label="Move-in Date" value="November 1, 2023" />
              <InfoTile
                icon={UserRound}
                label="Property Type"
                value={property.unit?.unit_type || "Residential Apartment"}
              />
              <InfoTile
                icon={MapPin}
                label="Full Address"
                value={address || `${propertyName}, Unit ${unitNumber}`}
              />
              <InfoTile icon={Building2} label="Building Manager" value={manager.company} />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="p-5 pb-2 sm:p-8 sm:pb-2">
            <CardTitle className="text-xl font-black">Building Amenities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {amenities.map((amenity) => (
              <div key={amenity.label} className="rounded-xl bg-muted/50 p-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
                  <amenity.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-bold text-muted-foreground">{amenity.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="card-elevated">
          <CardHeader className="p-5 pb-3 sm:p-8 sm:pb-3">
            <CardTitle className="text-xl font-black">Property Manager</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5 pt-2 sm:p-8 sm:pt-2">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-xl font-black text-secondary-foreground">
                {manager.initials}
              </div>
              <div>
                <p className="text-lg font-black">{manager.name}</p>
                <p className="text-base text-muted-foreground">{manager.role}</p>
              </div>
            </div>
            <ContactRow icon={Phone} value={manager.phone} />
            <ContactRow icon={Mail} value={manager.email} />
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 shadow-[var(--shadow-card)]">
          <CardContent className="p-5 sm:p-8">
            <h3 className="flex items-center gap-3 text-xl font-black text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contact
            </h3>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              For urgent maintenance or security issues, contact the 24/7 emergency line.
            </p>
            <Button
              asChild
              className="mt-6 h-14 w-full gap-3 rounded-xl bg-destructive text-base font-black hover:bg-destructive/90"
            >
              <a href={`tel:${manager.emergency}`}>
                <Phone className="h-5 w-5" />
                {manager.emergency} (Emergency)
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="p-5 pb-3 sm:p-8 sm:pb-3">
            <CardTitle className="text-xl font-black">Unit Status</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 sm:p-8 sm:pt-2">
            <StatusRow label="Tenant Status" value={status} tone="success" />
            <StatusRow label="Payment Status" value="Good Standing" tone="success" />
            <StatusRow label="Open Requests" value="2 Active" tone="warning" />
            <StatusRow label="Last Inspection" value="Mar 15, 2024" tone="success" last />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function FactTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-6 text-center">
      <p className="font-display text-2xl font-black text-primary">{value}</p>
      <p className="mt-2 text-base font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-base font-black">{value}</p>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-4 text-base font-medium">
      <Icon className="h-5 w-5 text-primary" />
      <span>{value}</span>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone: "success" | "warning";
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 text-base ${last ? "" : "border-b"}`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          tone === "success" ? "font-black text-secondary" : "font-black text-accent-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function formatOrdinal(value?: number) {
  if (!value) return "";
  const suffix = value === 1 ? "st" : value === 2 ? "nd" : value === 3 ? "rd" : "th";
  return `${value}${suffix} Floor`;
}
