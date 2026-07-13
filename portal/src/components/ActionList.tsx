import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export type ActionListItem = {
  label: string;
  description?: string;
  icon: LucideIcon;
  to?: ComponentProps<typeof Link>["to"];
  onClick?: () => void;
  trailing?: ReactNode;
};

export function ActionList({ items, className }: { items: ActionListItem[]; className?: string }) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-border",
        className,
      )}
    >
      {items.map((item) => (
        <ActionRow key={item.label} item={item} />
      ))}
    </div>
  );
}

function ActionRow({ item }: { item: ActionListItem }) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <item.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-foreground">{item.label}</span>
        {item.description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
        ) : null}
      </span>
      {item.trailing ?? (
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
    </>
  );

  const className =
    "flex w-full items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={className}>
      {content}
    </button>
  );
}
