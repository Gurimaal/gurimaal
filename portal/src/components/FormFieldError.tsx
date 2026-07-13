import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function FormFieldError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p
      className={cn(
        "inline-flex items-start gap-1.5 text-xs font-semibold text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
