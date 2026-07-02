import { createFileRoute } from "@tanstack/react-router";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  MapPin,
  Maximize2,
  ParkingCircle,
  Sparkles,
  Waves,
  Wifi,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/property")({
  head: () => ({ meta: [{ title: "My Property · Gurimaal" }] }),
  component: PropertyPage,
});

const facts = [
  { label: "Building", value: "Skyline Tower", icon: Building2 },
  { label: "Floor", value: "12th Floor", icon: Building2 },
  { label: "Unit", value: "12B", icon: Building2 },
  { label: "Bedrooms", value: "2", icon: BedDouble },
  { label: "Bathrooms", value: "2", icon: Bath },
  { label: "Area", value: "1,240 sqft", icon: Maximize2 },
  { label: "Move-in", value: "Mar 15, 2025", icon: CalendarDays },
  { label: "Parking", value: "Bay P-42", icon: ParkingCircle },
];

const amenities = [
  { label: "Rooftop pool", icon: Waves },
  { label: "24/7 security", icon: ShieldCheck },
  { label: "Fiber internet", icon: Wifi },
  { label: "Fitness center", icon: Dumbbell },
  { label: "Concierge", icon: Sparkles },
  { label: "Parking", icon: ParkingCircle },
];

function PropertyPage() {
  return (
    <>
      <PageHeader
        title="My Property"
        description="Details about the unit you currently live in."
        actions={<Button variant="outline">Contact building</Button>}
      />

      <Card className="card-elevated overflow-hidden">
        <div className="relative h-64 w-full sm:h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[oklch(0.4_0.09_240)] to-secondary" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5" />
                Downtown District · Riverside Ave
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                Skyline Tower · Unit 12B
              </h2>
            </div>
            <StatusBadge status="active">Occupied</StatusBadge>
          </div>
        </div>

        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                <p className="truncate text-sm font-semibold">{f.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Amenities</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenities.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm"
              >
                <a.icon className="h-4 w-4 text-secondary" />
                <span className="truncate">{a.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-elevated overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Location</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-64 w-full bg-muted">
              <div className="absolute inset-0 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                  <div className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-background/95 px-3 py-2 text-xs shadow">
                <p className="font-semibold">Skyline Tower</p>
                <p className="text-muted-foreground">Riverside Ave, Downtown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
