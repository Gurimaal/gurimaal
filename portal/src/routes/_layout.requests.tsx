import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, ImageIcon, Paperclip, Send, Wrench } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_layout/requests")({
  head: () => ({ meta: [{ title: "Request details · Gurimaal" }] }),
  component: RequestDetail,
});

const thread = [
  {
    who: "tenant",
    name: "Ahmed Hassan",
    initials: "AH",
    time: "Jun 29, 09:12",
    body: "Hi, the AC in the living room is blowing warm air since yesterday evening. Temperature is set to 22°C.",
    photos: 2,
  },
  {
    who: "staff",
    name: "Sarah Malik · Manager",
    initials: "SM",
    time: "Jun 29, 10:04",
    body: "Thanks Ahmed, logged the ticket. Assigning Omar from HVAC today, he'll reach out to schedule.",
  },
  {
    who: "staff",
    name: "Omar K. · Technician",
    initials: "OK",
    time: "Jun 30, 14:32",
    body: "Visited at 2pm — confirmed low refrigerant. Ordering parts, ETA tomorrow morning. Will refit by noon.",
    photos: 1,
  },
  {
    who: "tenant",
    name: "Ahmed Hassan",
    initials: "AH",
    time: "Jun 30, 15:00",
    body: "Sounds good, thank you!",
  },
];

const steps = [
  { label: "Reported", done: true },
  { label: "Assigned", done: true },
  { label: "In progress", done: true, active: true },
  { label: "Resolved", done: false },
];

function RequestDetail() {
  return (
    <>
      <PageHeader
        title="Request MR-2201"
        description="AC not cooling in living room · HVAC"
        actions={
          <>
            <StatusBadge status="in-progress" />
            <StatusBadge status="high">High priority</StatusBadge>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thread.map((m, i) => {
              const mine = m.who === "tenant";
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback
                      className={
                        mine
                          ? "bg-primary text-primary-foreground text-xs font-bold"
                          : "bg-secondary-soft text-secondary text-xs font-bold"
                      }
                    >
                      {m.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[80%] ${mine ? "text-right" : ""}`}>
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {mine ? (
                        <>
                          <span>{m.time}</span>
                          <span className="font-semibold text-foreground">{m.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-foreground">{m.name}</span>
                          <span>{m.time}</span>
                        </>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.body}
                      {m.photos ? (
                        <div className={`mt-3 grid gap-2 ${m.photos > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                          {Array.from({ length: m.photos }).map((_, j) => (
                            <div
                              key={j}
                              className="grid aspect-video place-items-center rounded-lg bg-black/10 text-muted-foreground"
                            >
                              <ImageIcon className="h-6 w-6 opacity-60" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-2xl border border-border bg-muted/40 p-2">
              <Button size="icon" variant="ghost">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Write a reply…"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button size="icon" variant="ghost">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" className="gap-1">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={70} className="h-2" />
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full ${
                        s.done
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </span>
                    <span className={`text-sm ${s.active ? "font-semibold" : ""}`}>{s.label}</span>
                    {s.active && (
                      <span className="ml-auto text-xs text-primary">Current</span>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Assigned technician</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary-soft text-primary font-bold">OK</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">Omar K.</p>
                  <p className="truncate text-xs text-muted-foreground">HVAC · Certified</p>
                </div>
                <Wrench className="ml-auto h-5 w-5 text-muted-foreground" />
              </div>
              <Button variant="outline" className="mt-4 w-full">Call technician</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
