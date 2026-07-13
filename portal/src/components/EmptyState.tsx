import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-56 place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto max-w-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

export function EmptyStateAction({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button size="sm" {...props}>
      {children}
    </Button>
  );
}
