import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ImageIcon, Plus, User, Wrench } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_layout/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · Gurimaal" }] }),
  component: MaintenancePage,
});

type Request = {
  id: string;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  tech?: { name: string; initials: string };
  updated: string;
  images: number;
};

const requests: Request[] = [
  { id: "MR-2201", title: "AC not cooling in living room", category: "HVAC", priority: "high", status: "in-progress", tech: { name: "Omar K.", initials: "OK" }, updated: "2h ago", images: 3 },
  { id: "MR-2198", title: "Leak under kitchen sink", category: "Plumbing", priority: "high", status: "open", updated: "1d ago", images: 2 },
  { id: "MR-2190", title: "Bedroom light flickering", category: "Electrical", priority: "medium", status: "in-progress", tech: { name: "Priya S.", initials: "PS" }, updated: "3d ago", images: 1 },
  { id: "MR-2185", title: "Door handle loose", category: "Carpentry", priority: "low", status: "resolved", tech: { name: "Marco L.", initials: "ML" }, updated: "1w ago", images: 0 },
  { id: "MR-2180", title: "Balcony tile crack", category: "General", priority: "low", status: "resolved", tech: { name: "Marco L.", initials: "ML" }, updated: "2w ago", images: 4 },
];

const columns: { key: Request["status"]; label: string; tone: string }[] = [
  { key: "open", label: "Open", tone: "text-accent-foreground" },
  { key: "in-progress", label: "In progress", tone: "text-primary" },
  { key: "resolved", label: "Resolved", tone: "text-secondary" },
];

function MaintenancePage() {
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Report issues and track ongoing repairs."
        actions={
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" /> Report new issue
          </Button>
        }
      />

      {/* Kanban */}
      <section className="grid gap-5 lg:grid-cols-3">
        {columns.map((col) => {
          const items = requests.filter((r) => r.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-display text-sm font-bold ${col.tone}`}>
                  {col.label}
                  <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {items.length}
                  </span>
                </h3>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <EmptyColumn />
                ) : (
                  items.map((r) => (
                    <Link
                      key={r.id}
                      to="/requests"
                      className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
                        <StatusBadge status={r.priority} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold">{r.title}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Wrench className="h-3.5 w-3.5" /> {r.category}
                        {r.images > 0 && (
                          <>
                            <span>·</span>
                            <ImageIcon className="h-3.5 w-3.5" /> {r.images}
                          </>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border pt-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {r.tech ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary-soft text-primary text-[10px] font-bold">
                                  {r.tech.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-xs">{r.tech.name}</span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="h-3.5 w-3.5" /> Unassigned
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{r.updated}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      <Card className="card-elevated">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h3 className="font-display text-lg font-bold">Need something urgent?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reach out to the building's 24/7 maintenance line for emergencies.
            </p>
          </div>
          <Button variant="secondary" className="justify-self-start gap-2">
            Contact team <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function EmptyColumn() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-xs text-muted-foreground">
      Nothing here.
    </div>
  );
}
