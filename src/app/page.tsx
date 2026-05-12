"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Cake,
  Calendar,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Loader2,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { listUpcomingEvents, type ChurchEvent } from "@/lib/events";
import { listTasks, updateTaskStatus, type Task } from "@/lib/tasks";
import { listJongeren, type Jongere } from "@/lib/jongeren";
import { currentUser, verseOfTheDay } from "@/lib/mock-data";
import { cn, emojiFor, greeting, nextTaskStatus } from "@/lib/utils";

function formatTaskDate(dueIso: string) {
  const due = new Date(dueIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return { label: "Vandaag", urgent: true };
  if (diff === 1) return { label: "Morgen", urgent: false };
  if (diff < 0) return { label: `${Math.abs(diff)}d te laat`, urgent: true };
  return {
    label: due.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
    urgent: false,
  };
}

const priorityLabel = { high: "Hoog", medium: "Middel", low: "Laag" } as const;
const priorityClass = {
  high: "bg-danger-soft text-danger",
  medium: "bg-warning-soft text-amber-700",
  low: "bg-primary-soft text-primary",
} as const;

export default function HomePage() {
  const [events, setEvents] = useState<ChurchEvent[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [jongeren, setJongeren] = useState<Jongere[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [ev, ts, js] = await Promise.all([
        listUpcomingEvents(2),
        listTasks(),
        listJongeren(),
      ]);
      setEvents(ev);
      setTasks(ts);
      setJongeren(js);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon dashboard data niet laden.");
      setEvents([]);
      setTasks([]);
      setJongeren([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleTask(t: Task) {
    const next = nextTaskStatus(t.status);
    setTasks((prev) => prev?.map((x) => (x.id === t.id ? { ...x, status: next } : x)) ?? null);
    try {
      await updateTaskStatus(t.id, next);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  const today = new Date();
  const verse = verseOfTheDay(today);
  const greet = greeting(today);
  const firstName = currentUser.name.split(" ")[0];

  const visibleTasks = (tasks ?? []).slice(0, 5);
  const openTasks = tasks?.filter((t) => t.status !== "done").length ?? 0;
  const totalJongeren = jongeren?.length ?? 0;

  const birthdaysThisWeek =
    jongeren?.filter((y) => {
      if (!y.birthday) return false;
      const [, m, d] = y.birthday.split("-").map(Number);
      const next = new Date(today.getFullYear(), m - 1, d);
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
      return days <= 7;
    }).length ?? 0;

  const isLoading = events === null || tasks === null || jongeren === null;

  return (
    <>
      <Topbar />

      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        {/* Hero */}
        <Card className="bg-hero-gradient text-white border-0 overflow-hidden relative shadow-lg shadow-primary/20">
          <svg
            className="absolute inset-y-0 right-1/3 h-full opacity-[0.08] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <path d="M45 15 L55 15 L55 45 L85 45 L85 55 L55 55 L55 95 L45 95 L45 55 L15 55 L15 45 L45 45 Z" fill="white" />
          </svg>
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

          <div className="relative p-5 lg:p-7 flex flex-col lg:flex-row gap-5 lg:gap-8 lg:items-center">
            <div className="lg:flex-1 min-w-0">
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-balance">
                {greet}, {firstName}! {emojiFor(greet)}
              </h2>
              <p className="text-white/80 text-sm lg:text-base mt-1.5">
                Hier is wat er vandaag speelt.
              </p>
            </div>

            <div className="relative lg:max-w-sm">
              <div className="absolute -top-1 -left-1 lg:-top-2 lg:-left-2 h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <BookIcon className="h-4 w-4 text-white" />
              </div>
              <div className="pl-10 lg:pl-12 pr-1">
                <p className="text-sm lg:text-[15px] leading-relaxed text-white/95 italic">
                  &ldquo;{verse.text}&rdquo;
                </p>
                <p className="text-xs lg:text-sm text-white/70 mt-2 font-medium">— {verse.reference}</p>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Komende Events */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight text-base">Komende Events</h3>
              </div>
              <Link
                href="/events"
                className="text-sm font-medium text-primary inline-flex items-center gap-0.5 hover:gap-1.5 transition-all"
              >
                Bekijk alles
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {events === null ? (
              <div className="px-5 pb-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Laden…
              </div>
            ) : events.length === 0 ? (
              <div className="px-5 pb-5">
                <p className="text-sm text-muted-foreground">
                  Geen aankomende events.{" "}
                  <Link href="/events" className="text-primary font-medium">
                    Maak je eerste event aan
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((ev) => {
                  const date = new Date(ev.date);
                  const endDate = ev.endDate ? new Date(ev.endDate) : null;
                  return (
                    <Link
                      key={ev.id}
                      href={`/events/${ev.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div
                        className="relative h-16 w-16 lg:h-20 lg:w-20 rounded-2xl shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: ev.cover,
                          backgroundImage:
                            "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)",
                        }}
                      >
                        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_30%_70%,white_1px,transparent_2px)] [background-size:6px_6px]" />
                        <svg
                          className="absolute inset-0 m-auto h-7 w-7 opacity-70 text-white"
                          viewBox="0 0 100 100"
                          aria-hidden
                        >
                          <path d="M45 15 L55 15 L55 45 L85 45 L85 55 L55 55 L55 95 L45 95 L45 55 L15 55 L15 45 L45 45 Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[11px] font-semibold mb-1.5">
                          {typeLabel(ev.type)}
                        </div>
                        <div className="font-semibold tracking-tight text-[15px] truncate">{ev.title}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] lg:text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-primary/70" />
                            {date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "short" })}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary/70" />
                            {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                            {endDate &&
                              ` - ${endDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                          {ev.location && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-primary/70" />
                              <span className="truncate">{ev.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-1">
                        <div className="text-2xl lg:text-3xl font-bold text-primary leading-none tracking-tight">
                          {date.getDate()}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                          {date.toLocaleDateString("nl-NL", { month: "short" })}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* To Do's */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight text-base">To Do&apos;s</h3>
              </div>
              <Link
                href="/taken"
                className="text-sm font-medium text-primary inline-flex items-center gap-0.5 hover:gap-1.5 transition-all"
              >
                Bekijk alles
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {tasks === null ? (
              <div className="px-5 pb-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Laden…
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="px-5 pb-5">
                <p className="text-sm text-muted-foreground">
                  Geen open taken.{" "}
                  <Link href="/taken" className="text-primary font-medium">
                    Maak een taak aan
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visibleTasks.map((t) => {
                  const isDone = t.status === "done";
                  const due = formatTaskDate(t.dueDate);
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                      <button
                        onClick={() => handleToggleTask(t)}
                        className={cn(
                          "shrink-0 h-5 w-5 rounded-full inline-flex items-center justify-center transition-colors",
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : "border-[1.5px] border-border-strong hover:border-primary"
                        )}
                        aria-label="Toggle taak"
                      >
                        {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>
                      <span
                        className={cn(
                          "flex-1 min-w-0 text-sm font-medium truncate",
                          isDone && "line-through text-muted-foreground"
                        )}
                      >
                        {t.title}
                      </span>
                      {isDone ? (
                        <span className="text-sm font-semibold text-green-600">Voltooid</span>
                      ) : (
                        <>
                          <span
                            className={cn(
                              "text-xs font-medium shrink-0",
                              due.urgent ? "text-danger" : "text-muted-foreground"
                            )}
                          >
                            {due.label}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              priorityClass[t.priority]
                            )}
                          >
                            {priorityLabel[t.priority]}
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Stats grid */}
        <div className="rounded-3xl bg-primary-soft p-4 lg:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Link href="/sheets" className="block hover:opacity-80 transition-opacity">
              <StatTile icon={Users} value={isLoading ? "—" : totalJongeren} label="Jongeren" />
            </Link>
            <Link href="/events" className="block hover:opacity-80 transition-opacity">
              <StatTile icon={Ticket} value={isLoading ? "—" : events?.length ?? 0} label="Events" />
            </Link>
            <Link href="/verjaardagen" className="block hover:opacity-80 transition-opacity">
              <StatTile icon={Cake} value={isLoading ? "—" : birthdaysThisWeek} label="Verjaardagen" />
            </Link>
            <Link href="/taken" className="block hover:opacity-80 transition-opacity">
              <StatTile icon={ClipboardCheck} value={isLoading ? "—" : openTasks} label="Taken open" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 py-3">
      <Icon className="h-6 w-6 text-primary/60" strokeWidth={2} />
      <div className="text-2xl lg:text-3xl font-bold text-foreground leading-none tracking-tight">
        {value}
      </div>
      <div className="text-xs lg:text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4h11a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z" />
      <path d="M9 8h5" />
      <path d="M9 12h3" />
      <path d="M17 6h2a1 1 0 0 1 1 1v13" />
    </svg>
  );
}

function typeLabel(type: string) {
  switch (type) {
    case "service":
      return "Jeugdavond";
    case "social":
      return "Sociaal";
    case "study":
      return "Bijbelstudie";
    case "outreach":
      return "Outreach";
    default:
      return type;
  }
}
