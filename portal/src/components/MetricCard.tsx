import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-soft text-primary",
  success: "bg-secondary-soft text-primary",
  warning: "bg-accent-soft text-accent-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
};

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
