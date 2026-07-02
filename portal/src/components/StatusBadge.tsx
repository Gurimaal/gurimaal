import { cn } from "@/lib/utils";

type Status =
  | "paid"
  | "pending"
  | "overdue"
  | "upcoming"
  | "active"
  | "in-progress"
  | "resolved"
  | "open"
  | "high"
  | "medium"
  | "low";

const map: Record<Status, string> = {
  paid: "bg-secondary-soft text-secondary",
  pending: "bg-accent-soft text-accent-foreground",
  overdue: "bg-destructive/10 text-destructive",
  upcoming: "bg-primary-soft text-primary",
  active: "bg-secondary-soft text-secondary",
  "in-progress": "bg-primary-soft text-primary",
  resolved: "bg-secondary-soft text-secondary",
  open: "bg-accent-soft text-accent-foreground",
  high: "bg-destructive/10 text-destructive",
  medium: "bg-accent-soft text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        map[status],
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? status.replace("-", " ")}
    </span>
  );
}
