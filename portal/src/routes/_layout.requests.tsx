import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, MessageSquare, Paperclip, Search, Send, Wrench } from "lucide-react";

import { maintenanceApi, type MaintenanceRequest } from "@/api/maintenanceApi";
import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/requests")({
  head: () => ({ meta: [{ title: "Requests · Gurimaal" }] }),
  component: RequestsPage,
});

type RequestTab = "all" | "open" | "in-progress" | "resolved" | "closed";

const requestTabs: Array<{ value: RequestTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function normalizeStatus(status?: string): RequestTab {
  const value = status?.toLowerCase().replace(/\s+/g, "-");
  if (value === "closed") return "closed";
  if (value === "resolved" || value === "completed") return "resolved";
  if (value === "in-progress" || value === "assigned") return "in-progress";
  return "open";
}

function normalizePriority(priority?: string) {
  const value = priority?.toLowerCase();
  if (value === "urgent" || value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name?: string) {
  return (name ?? "User")
    .split(/[.@\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function requestTitle(request: MaintenanceRequest) {
  const description = request.description?.trim();
  if (!description) return request.name;
  const [firstLine] = description.split(/\n|\. /);
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

function requestSummary(request: MaintenanceRequest) {
  const description = request.description?.trim();
  if (!description) return "Your request has been received.";
  const title = requestTitle(request);
  const summary = description
    .replace(title, "")
    .replace(/^[\s.:-]+/, "")
    .trim();
  return summary || "Your request has been received. We will assign a technician shortly.";
}

function statusLabel(status: RequestTab) {
  if (status === "in-progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function RequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<RequestTab>("all");
  const [selectedRequestName, setSelectedRequestName] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      setLoading(true);
      setError(null);
      try {
        const result = await maintenanceApi.listRequests(50);
        if (mounted) setRequests(result);
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load requests.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRequests();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadRequestDetail() {
      if (!selectedRequestName) {
        setSelectedRequest(null);
        return;
      }

      setDetailLoading(true);
      setError(null);
      try {
        const detail = await maintenanceApi.requestDetail(selectedRequestName);
        if (mounted) setSelectedRequest(detail);
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load request detail.",
          );
        }
      } finally {
        if (mounted) setDetailLoading(false);
      }
    }

    loadRequestDetail();
    return () => {
      mounted = false;
    };
  }, [selectedRequestName]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status = normalizeStatus(request.status);
      const tabMatch = activeTab === "all" || activeTab === status;
      if (!tabMatch) return false;

      if (!term) return true;

      return [
        request.name,
        request.category,
        request.priority,
        request.status,
        request.description,
        request.assigned_to,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [activeTab, requests, search]);

  async function submitReply(event: FormEvent) {
    event.preventDefault();
    if (!selectedRequest || !reply.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const result = await maintenanceApi.addComment(selectedRequest.name, reply.trim());
      const updated = {
        ...selectedRequest,
        comments: [...(selectedRequest.comments ?? []), result.comment],
      };
      setSelectedRequest(updated);
      setRequests((current) =>
        current.map((request) =>
          request.name === updated.name ? { ...request, ...updated } : request,
        ),
      );
      setReply("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add reply.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <>
      <PageHeader title="Requests" description="Track maintenance conversations and progress." />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests..."
              className="h-12 rounded-xl border-border bg-muted/30 pl-12 text-base shadow-none sm:h-14"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as RequestTab)}
            className="mt-7"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="h-auto min-w-max gap-5 rounded-none bg-transparent p-0 text-base sm:gap-7">
                {requestTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent px-0 pb-4 text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-base"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {filteredRequests.length ? (
                <div className="divide-y divide-border">
                  {filteredRequests.map((request) => (
                    <RequestListRow
                      key={request.name}
                      request={request}
                      onSelect={() => setSelectedRequestName(request.name)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <Wrench className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 text-base font-bold">No requests found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Requests created from the maintenance page will appear here.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedRequestName)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestName(null);
            setReply("");
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-y-auto p-0 sm:w-full">
          <DialogHeader className="border-b p-5 pb-4 sm:p-7 sm:pb-5">
            <DialogTitle className="text-xl font-black sm:text-2xl">
              {selectedRequest ? requestTitle(selectedRequest) : "Request details"}
            </DialogTitle>
            {selectedRequest ? (
              <p className="text-sm text-muted-foreground">
                {selectedRequest.name} · {selectedRequest.category ?? "Maintenance"}
              </p>
            ) : null}
          </DialogHeader>

          {detailLoading ? (
            <div className="p-5 sm:p-7">
              <PageSkeleton />
            </div>
          ) : selectedRequest ? (
            <div className="grid gap-5 p-5 sm:gap-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-4">
                <div className="rounded-2xl bg-muted/50 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusPill status={normalizeStatus(selectedRequest.status)} />
                    <PriorityPill priority={normalizePriority(selectedRequest.priority)} />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {selectedRequest.description ?? requestSummary(selectedRequest)}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Conversation</h3>
                  {(selectedRequest.comments ?? []).length ? (
                    selectedRequest.comments?.map((comment) => (
                      <div key={comment.name} className="flex gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary-soft text-primary text-xs font-bold">
                            {initials(comment.owner)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {comment.owner ?? "User"}
                            </span>
                            <span>{formatDate(comment.creation)}</span>
                          </div>
                          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 text-sm font-bold">No conversation yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updates from the building team will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={submitReply}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded-2xl border border-border bg-muted/40 p-2 sm:gap-2"
                >
                  <Button size="icon" variant="ghost" type="button" aria-label="Attach file">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write a reply..."
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                  />
                  <Button size="icon" disabled={saving || !reply.trim()} aria-label="Send reply">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <RequestProgress request={selectedRequest} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RequestListRow({
  request,
  onSelect,
}: {
  request: MaintenanceRequest;
  onSelect: () => void;
}) {
  const status = normalizeStatus(request.status);
  const priority = normalizePriority(request.priority);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="grid w-full gap-4 px-1 py-5 text-left transition hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:py-6"
    >
      <div className="min-w-0 space-y-3">
        <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
          {requestTitle(request)}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-4 py-1 text-sm font-bold text-muted-foreground">
            {request.category ?? "Maintenance"}
          </span>
          <PriorityPill priority={priority} />
        </div>
        <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {requestSummary(request)}
        </p>
        <p className="text-sm font-semibold text-muted-foreground">
          {request.assigned_to ?? "Unassigned"}
        </p>
      </div>

      <div className="flex flex-row items-center justify-between gap-5 sm:flex-col sm:items-end">
        <StatusPill status={status} />
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatDate(request.reported_date ?? request.resolved_date)}
        </span>
      </div>
    </button>
  );
}

function RequestProgress({ request }: { request: MaintenanceRequest }) {
  const status = normalizeStatus(request.status);
  const progress =
    status === "resolved" || status === "closed" ? 100 : status === "in-progress" ? 70 : 30;
  const steps = [
    { label: "Reported", done: true, active: status === "open" },
    { label: "Assigned", done: status !== "open", active: status === "in-progress" },
    {
      label: "In progress",
      done: status === "in-progress" || status === "resolved" || status === "closed",
      active: status === "in-progress",
    },
    {
      label: "Resolved",
      done: status === "resolved" || status === "closed",
      active: status === "resolved" || status === "closed",
    },
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-bold">Progress</h3>
        <Progress value={progress} className="mt-4 h-2" />
        <ol className="mt-5 space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full",
                  step.done
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "text-sm text-muted-foreground",
                  step.active && "font-bold text-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-bold">Assigned technician</h3>
        {request.assigned_to ? (
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {initials(request.assigned_to)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-bold">{request.assigned_to}</p>
              <p className="truncate text-xs text-muted-foreground">Assigned in Frappe</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm font-semibold text-muted-foreground">
            Not assigned yet
          </p>
        )}
      </div>
    </aside>
  );
}

function StatusPill({ status }: { status: RequestTab }) {
  const styles: Record<RequestTab, string> = {
    all: "bg-muted text-muted-foreground",
    open: "bg-primary-soft text-primary",
    "in-progress": "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold sm:px-4 sm:text-sm",
        styles[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold sm:px-4 sm:text-sm",
        styles[priority] ?? styles.medium,
      )}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
