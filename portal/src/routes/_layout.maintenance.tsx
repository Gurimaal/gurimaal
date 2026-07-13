import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useRef, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  ImageIcon,
  Phone,
  Plus,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { maintenanceApi, type MaintenanceRequest } from "@/api/maintenanceApi";
import { propertyApi } from "@/api/propertyApi";

export const Route = createFileRoute("/_layout/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · Gurimaal" }] }),
  component: MaintenancePage,
});

type MaintenanceStatus = "open" | "in-progress" | "resolved" | "closed";
type MaintenanceErrors = Partial<Record<"title" | "description" | "location" | "photos", string>>;

const columns: {
  key: MaintenanceStatus;
  label: string;
  dot: string;
}[] = [
  { key: "open", label: "Open", dot: "bg-primary" },
  { key: "in-progress", label: "In Progress", dot: "bg-accent" },
  { key: "resolved", label: "Resolved", dot: "bg-secondary" },
  { key: "closed", label: "Closed", dot: "bg-muted-foreground" },
];

function MaintenancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<MaintenanceErrors>({});
  const [form, setForm] = useState({
    category: "Plumbing",
    priority: "Low",
    title: "",
    description: "",
    location: "",
    contactTime: "Morning (8am - 12pm)",
  });

  const requestsQuery = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: () => maintenanceApi.listRequests(50),
  });
  const propertyQuery = useQuery({
    queryKey: ["my-property"],
    queryFn: propertyApi.getMyProperty,
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const request = await maintenanceApi.createRequest({
        unit: propertyQuery.data?.unit?.name,
        category: form.category,
        priority: form.priority,
        description: [
          form.title,
          form.description,
          form.location ? `Location: ${form.location}` : "",
          form.contactTime ? `Preferred contact time: ${form.contactTime}` : "",
          photos.length ? `Attached photos: ${photos.map((photo) => photo.name).join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });

      if (photos.length) {
        await Promise.all(
          photos.map((photo) => maintenanceApi.uploadAttachment(request.name, photo)),
        );
      }

      return request;
    },
    onSuccess: () => {
      setForm({
        category: "Plumbing",
        priority: "Low",
        title: "",
        description: "",
        location: "",
        contactTime: "Morning (8am - 12pm)",
      });
      setPhotos([]);
      setFormErrors({});
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
    },
  });

  const requests = requestsQuery.data ?? [];

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMaintenanceForm(form, photos);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    createRequest.mutate();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Maintenance"
        description="Report issues and track ongoing repairs."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-12 gap-3 rounded-xl px-5 text-sm font-bold sm:px-6 sm:text-base"
                aria-label="Report new issue"
              >
                <Plus className="h-5 w-5" />
                Report New Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-y-auto p-0 sm:w-full">
              <DialogHeader className="border-b p-5 pb-4 sm:p-8 sm:pb-6">
                <DialogTitle className="text-xl font-black sm:text-2xl">
                  Report New Issue
                </DialogTitle>
                <p className="text-base text-muted-foreground">
                  Describe the maintenance issue in your unit
                </p>
              </DialogHeader>
              <form onSubmit={submitRequest} className="space-y-6 p-5 sm:space-y-7 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldSelect
                    label="Category"
                    value={form.category}
                    onValueChange={(category) => setForm((current) => ({ ...current, category }))}
                    options={["Plumbing", "Electrical", "HVAC", "Structural", "Other"]}
                  />
                  <FieldSelect
                    label="Priority"
                    value={form.priority}
                    onValueChange={(priority) => setForm((current) => ({ ...current, priority }))}
                    options={["Low", "Medium", "High", "Emergency"]}
                  />
                </div>

                <FieldInput
                  label="Issue Title"
                  value={form.title}
                  error={formErrors.title}
                  onChange={(title) => {
                    setForm((current) => ({ ...current, title }));
                    setFormErrors((current) => ({ ...current, title: undefined }));
                  }}
                  placeholder="e.g. Leaking pipe under kitchen sink"
                />

                <div className="grid gap-2">
                  <Label className="text-sm font-black">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={6}
                    placeholder="Describe the issue in detail - when it started, how severe it is..."
                    aria-invalid={Boolean(formErrors.description)}
                    className="rounded-xl text-sm"
                  />
                  {formErrors.description ? (
                    <p className="text-xs font-semibold text-destructive">
                      {formErrors.description}
                    </p>
                  ) : null}
                </div>

                <FieldInput
                  label="Location / Area"
                  value={form.location}
                  error={formErrors.location}
                  onChange={(location) => {
                    setForm((current) => ({ ...current, location }));
                    setFormErrors((current) => ({ ...current, location: undefined }));
                  }}
                  placeholder="e.g. Bathroom, Kitchen, Bedroom"
                />

                <PhotoUploadField
                  photos={photos}
                  error={formErrors.photos}
                  onPhotosChange={(nextPhotos) => {
                    setPhotos(nextPhotos);
                    setFormErrors((current) => ({ ...current, photos: undefined }));
                  }}
                  onError={(message) =>
                    setFormErrors((current) => ({ ...current, photos: message }))
                  }
                />

                <FieldSelect
                  label="Preferred Contact Time"
                  value={form.contactTime}
                  onValueChange={(contactTime) =>
                    setForm((current) => ({ ...current, contactTime }))
                  }
                  options={[
                    "Morning (8am - 12pm)",
                    "Afternoon (12pm - 5pm)",
                    "Evening (5pm - 8pm)",
                  ]}
                />

                {createRequest.error ? (
                  <p className="text-sm text-destructive">{createRequest.error.message}</p>
                ) : null}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-xl px-8 text-base"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 gap-3 rounded-xl px-8 text-base font-bold"
                    disabled={!propertyQuery.data?.unit?.name || createRequest.isPending}
                  >
                    <Plus className="h-5 w-5" />
                    {createRequest.isPending ? "Submitting..." : "Submit Issue"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {requestsQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {requestsQuery.error.message}
        </p>
      ) : null}

      <section className="grid gap-8 xl:grid-cols-4">
        {columns.map((column) => {
          const items = requests.filter(
            (request) => normalizeStatus(request.status) === column.key,
          );
          return (
            <div key={column.key} className="space-y-5">
              <div className="flex items-center gap-3">
                <span className={`h-3.5 w-3.5 rounded-full ${column.dot}`} />
                <h2 className="text-lg font-black">{column.label}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-black text-muted-foreground">
                  {items.length}
                </span>
              </div>

              <div className="space-y-5">
                {requestsQuery.isLoading ? (
                  <EmptyColumn label="Loading requests..." />
                ) : items.length === 0 ? (
                  <EmptyColumn />
                ) : (
                  items.map((request) => <MaintenanceCard key={request.name} request={request} />)
                )}
              </div>
            </div>
          );
        })}
      </section>

      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/14 sm:h-16 sm:w-16">
              <AlertTriangle className="h-6 w-6 text-accent sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="text-xl font-black sm:text-2xl">Need something urgent?</h3>
              <p className="mt-2 text-base font-medium text-white/65">
                Reach out to the building's 24/7 maintenance line for emergencies.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="secondary"
            className="h-12 gap-3 rounded-xl px-6 text-sm font-black sm:h-14 sm:px-8 sm:text-base"
          >
            <a href="tel:+252619990000">
              <Phone className="h-5 w-5" />
              Contact Team
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceCard({ request }: { request: MaintenanceRequest }) {
  const urgent = request.priority === "Urgent" || request.priority === "Emergency";
  const title = getRequestTitle(request);

  return (
    <article
      className={`rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 ${
        urgent ? "border-destructive/35 ring-2 ring-destructive/20" : "border-border"
      }`}
    >
      {urgent ? (
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-destructive/8 px-4 py-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-black uppercase">Urgent</span>
        </div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="font-mono text-sm font-black text-muted-foreground">{request.name}</span>
        <PriorityPill priority={request.priority || "Medium"} />
      </div>
      <h3 className="mt-5 text-lg font-black sm:mt-6 sm:text-xl">{title}</h3>
      <span className="mt-3 inline-flex rounded-full bg-muted px-4 py-1.5 text-sm font-black text-muted-foreground">
        {request.category || "Other"}
      </span>
      {request.attachments?.length ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-2 text-sm font-bold text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          {request.attachments.length} photo{request.attachments.length === 1 ? "" : "s"} attached
        </div>
      ) : null}
      <p className="mt-5 line-clamp-3 text-base leading-7 text-muted-foreground">
        {getRequestDescription(request)}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {request.assigned_to ? (
            <>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground">
                  {getInitials(request.assigned_to)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{request.assigned_to}</span>
            </>
          ) : (
            <span className="truncate">Unassigned</span>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Clock3 className="h-4 w-4" />
          {formatWhen(request.reported_date || request.resolved_date)}
        </span>
      </div>
    </article>
  );
}

function PhotoUploadField({
  photos,
  error,
  onPhotosChange,
  onError,
}: {
  photos: File[];
  error?: string;
  onPhotosChange: (photos: File[]) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files);
    const rejected = selected.find(
      (file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024,
    );
    if (rejected) {
      onError("Only PNG/JPG images up to 10MB are allowed.");
      return;
    }

    onPhotosChange([...photos, ...selected]);
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, photoIndex) => photoIndex !== index));
  }

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-black">Upload Photos (optional)</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        className="hidden"
        onChange={(event) => addPhotos(event.target.files)}
      />
      <button
        type="button"
        aria-invalid={Boolean(error)}
        className="rounded-xl border-2 border-dashed border-border p-5 text-center transition hover:border-primary hover:bg-primary-soft/40 sm:p-8"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addPhotos(event.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Click or drag photos here</p>
        <p className="mt-2 text-sm text-muted-foreground">PNG, JPG up to 10MB each</p>
      </button>
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}

      {photos.length ? (
        <div className="mt-3 grid gap-3">
          {photos.map((photo, index) => (
            <div
              key={`${photo.name}-${photo.lastModified}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{photo.name}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatFileSize(photo.size)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${photo.name}`}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => removePhoto(index)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-black">{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="h-11 rounded-xl text-sm sm:h-12"
      />
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-black">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 rounded-xl text-sm sm:h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const normalized = priority.toLowerCase();
  const className =
    normalized.includes("urgent") || normalized.includes("emergency") || normalized.includes("high")
      ? "bg-destructive/10 text-destructive"
      : normalized.includes("low")
        ? "bg-muted text-muted-foreground"
        : "bg-accent-soft text-accent-foreground";

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-black sm:px-4 sm:text-sm ${className}`}>
      {priority}
    </span>
  );
}

function normalizeStatus(status?: string): MaintenanceStatus {
  const value = status?.toLowerCase().replace(/\s+/g, "-");
  if (value === "in-progress" || value === "assigned") return "in-progress";
  if (value === "resolved" || value === "completed") return "resolved";
  if (value === "closed") return "closed";
  return "open";
}

function getRequestTitle(request: MaintenanceRequest) {
  return request.description?.split("\n")[0] || request.category || "Maintenance request";
}

function getRequestDescription(request: MaintenanceRequest) {
  const parts = request.description?.split("\n").filter(Boolean) || [];
  return parts.slice(1).join(" ") || request.description || "No description provided.";
}

function formatWhen(value?: string) {
  if (!value) return "Today";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(value: string) {
  return value
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function EmptyColumn({ label = "Nothing here." }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateMaintenanceForm(
  form: {
    title: string;
    description: string;
    location: string;
  },
  photos: File[],
): MaintenanceErrors {
  const errors: MaintenanceErrors = {};
  if (form.title.trim().length < 3) {
    errors.title = "Enter a short issue title.";
  }
  if (form.description.trim().length < 10) {
    errors.description = "Describe the issue with at least 10 characters.";
  }
  if (form.location.trim().length < 2) {
    errors.location = "Enter the room or area.";
  }
  if (photos.some((photo) => !photo.type.startsWith("image/") || photo.size > 10 * 1024 * 1024)) {
    errors.photos = "Only PNG/JPG images up to 10MB are allowed.";
  }

  return errors;
}
