"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Copy,
  Hand,
  Loader2,
  Lock,
  MapPin,
  Share2,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewTaskButton } from "@/components/forms/new-task-form";
import { deleteEvent, getEvent, listEventSignups, type ChurchEvent } from "@/lib/events";
import { listJongeren, type Jongere } from "@/lib/jongeren";
import {
  listAttendance,
  setAttendance,
} from "@/lib/attendance";
import {
  claimTask,
  deleteTask,
  listEventTasks,
  unclaimTask,
  updateTaskStatus,
  type Task,
} from "@/lib/tasks";
import { currentUser, leaderById } from "@/lib/mock-data";
import { cn, formatRelativeDays, nextTaskStatus } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  service: "Jeugdavond",
  social: "Sociaal",
  study: "Bijbelstudie",
  outreach: "Outreach",
};

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;
const priorityLabel = { high: "Hoog", medium: "Normaal", low: "Laag" };

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [ev, setEv] = useState<ChurchEvent | null | undefined>(undefined);
  const [signups, setSignups] = useState<{ id: string; name: string }[]>([]);
  const [jongeren, setJongeren] = useState<Jongere[]>([]);
  const [present, setPresent] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [e, s, js, att, ts] = await Promise.all([
        getEvent(id),
        listEventSignups(id),
        listJongeren(),
        listAttendance(id),
        listEventTasks(id),
      ]);
      setEv(e);
      setSignups(s);
      setJongeren(js);
      setPresent(new Set(att));
      setTasks(ts);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon data niet laden.");
      setEv(null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePresence(jongereId: string) {
    if (!ev) return;
    const isPresent = present.has(jongereId);
    const next = new Set(present);
    if (isPresent) next.delete(jongereId);
    else next.add(jongereId);
    setPresent(next);
    try {
      await setAttendance(ev.id, jongereId, !isPresent);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleClaim(task: Task) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, assigneeId: currentUser.id, claimedAt: new Date().toISOString() } : t
      )
    );
    try {
      await claimTask(task.id, currentUser.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleUnclaim(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, assigneeId: null } : t)));
    try {
      await unclaimTask(task.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleToggleTaskStatus(task: Task) {
    const next = nextTaskStatus(task.status);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    try {
      await updateTaskStatus(task.id, next);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm(`Verwijder taak "${task.title}"?`)) return;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await deleteTask(task.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  if (ev === undefined) {
    return (
      <>
        <Topbar title="Event" />
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm">Event wordt geladen…</p>
        </div>
      </>
    );
  }

  if (ev === null && !error) notFound();

  if (!ev) {
    return (
      <>
        <Topbar title="Event" />
        <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-4">
          <BackLink />
          {error && (
            <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
              <strong>Oeps:</strong> {error}
            </div>
          )}
        </div>
      </>
    );
  }

  const date = new Date(ev.date);
  const signupUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${ev.id}/signup`
      : `https://youthchurchleader.vercel.app/events/${ev.id}/signup`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: ev!.title,
          text: `Meld je aan voor ${ev!.title}`,
          url: signupUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      }
    } else {
      handleCopy();
    }
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit event wilt verwijderen?")) return;
    setDeleting(true);
    try {
      await deleteEvent(ev!.id);
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Verwijderen mislukt");
      setDeleting(false);
    }
  }

  return (
    <>
      <Topbar title={ev.title} subtitle={typeLabel[ev.type] ?? ev.type} />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        <BackLink />

        {/* Cover */}
        <Card className="overflow-hidden border-0">
          <div
            className="h-48 md:h-72 relative"
            style={
              ev.coverImage
                ? undefined
                : {
                    backgroundColor: ev.cover,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.40) 100%)",
                  }
            }
          >
            {ev.coverImage && (
              <Image
                src={ev.coverImage}
                alt={ev.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
            {!ev.coverImage && (
              <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
            )}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 drop-shadow-lg">
              <Badge variant="muted" className="bg-white/20 backdrop-blur text-white border-0">
                {typeLabel[ev.type] ?? ev.type}
              </Badge>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight max-w-2xl">
                {ev.title}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-95 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                  {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} uur
                </span>
                {ev.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {ev.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {/* About */}
            {ev.description && (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold tracking-tight">Over dit event</h3>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {ev.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attendance */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Aanwezigheid markeren
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {present.size} van {jongeren.length} jongeren aanwezig
                  </p>
                </div>
                {present.size > 0 && (
                  <Badge variant="accent">{present.size} ✓</Badge>
                )}
              </div>
              <CardContent className="pt-3">
                {jongeren.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nog geen jongeren toegevoegd.{" "}
                    <Link href="/sheets" className="text-primary font-medium">
                      Voeg er een toe
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {jongeren.map((j) => {
                      const isPresent = present.has(j.id);
                      return (
                        <button
                          key={j.id}
                          onClick={() => togglePresence(j.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                            isPresent
                              ? "border-primary bg-primary-soft"
                              : "border-border bg-card hover:border-primary/40"
                          )}
                        >
                          <Avatar name={j.name} color={j.avatar} size={36} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{j.name}</div>
                            <div className="text-xs text-muted-foreground">{j.age} jaar</div>
                          </div>
                          <span
                            className={cn(
                              "h-6 w-6 rounded-full inline-flex items-center justify-center text-white shrink-0",
                              isPresent ? "bg-primary" : "border-2 border-border-strong bg-card"
                            )}
                          >
                            {isPresent && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event ToDo's */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    To Do&apos;s voor dit event
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tasks.length} {tasks.length === 1 ? "taak" : "taken"} · {tasks.filter((t) => t.isOpen && !t.assigneeId).length} open
                  </p>
                </div>
                <NewTaskButton eventId={ev.id} onCreated={load} size="sm" triggerLabel="Toevoegen" />
              </div>
              <CardContent className="pt-3 space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nog geen to do&apos;s. Voeg er een toe — wijs hem toe of laat hem open.
                  </p>
                ) : (
                  tasks.map((t) => (
                    <EventTaskRow
                      key={t.id}
                      task={t}
                      onClaim={handleClaim}
                      onUnclaim={handleUnclaim}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* QR signups */}
            {signups.length > 0 && (
              <Card>
                <div className="px-5 pt-5">
                  <h3 className="font-semibold tracking-tight">QR-aanmeldingen</h3>
                  <p className="text-sm text-muted-foreground">{signups.length} aangemeld via QR</p>
                </div>
                <CardContent className="pt-3">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {signups.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center text-primary text-sm font-semibold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{s.name}</div>
                        </div>
                        <Badge variant="success">Aangemeld</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="ghost" onClick={handleDelete} disabled={deleting} className="text-danger">
              <Trash2 className="h-4 w-4" />
              {deleting ? "Verwijderen…" : "Event verwijderen"}
            </Button>
          </div>

          {/* Right: QR + stats */}
          <div className="space-y-5 lg:space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-semibold tracking-tight">QR-aanmelden</h3>
                  <p className="text-xs text-muted-foreground">Laat scannen om zich aan te melden</p>
                </div>

                <div className="rounded-2xl bg-white p-5 flex justify-center border border-border">
                  <QRCodeSVG
                    value={signupUrl}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#1c1917"
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 text-xs font-mono break-all text-center text-muted-foreground">
                  {signupUrl}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Gekopieerd!" : "Kopieer"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-3.5 w-3.5" />
                    Deel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Statistieken
                </div>
                <Stat label="Capaciteit" value={ev.capacity} />
                <Stat label="Aangemeld" value={ev.signups} />
                <Stat label="Plekken open" value={Math.max(0, ev.capacity - ev.signups)} />
                <Stat label="Aanwezig" value={present.size} />
                <Stat
                  label="Bezetting"
                  value={ev.capacity > 0 ? `${Math.round((ev.signups / ev.capacity) * 100)}%` : "0%"}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/events"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Terug naar events
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EventTaskRow({
  task,
  onClaim,
  onUnclaim,
  onToggleStatus,
  onDelete,
}: {
  task: Task;
  onClaim: (t: Task) => void;
  onUnclaim: (t: Task) => void;
  onToggleStatus: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const isDone = task.status === "done";
  const inProgress = task.status === "in_progress";
  const assignee = task.assigneeId ? leaderById(task.assigneeId) : null;
  const isMine = task.assigneeId === currentUser.id;
  const isOpenForPickup = task.isOpen && !task.assigneeId;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        isDone
          ? "border-border bg-muted/40 opacity-70"
          : isOpenForPickup
          ? "border-primary/30 bg-primary-soft/30"
          : "border-border bg-card"
      )}
    >
      <button
        onClick={() => onToggleStatus(task)}
        className="mt-0.5 shrink-0"
        aria-label="Toggle status"
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-700" />
        ) : inProgress ? (
          <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary-soft" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-sm font-medium leading-snug",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {assignee ? (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Avatar name={assignee.name} color={assignee.color} size={18} />
              <span className="font-medium">{assignee.name.split(" ")[0]}</span>
              {task.claimedAt && (
                <span className="text-muted-foreground">(opgepakt)</span>
              )}
            </span>
          ) : isOpenForPickup ? (
            <Badge variant="accent">Open — wie pakt op?</Badge>
          ) : null}
          <Badge variant={priorityVariant[task.priority]} className="text-[10px]">
            {priorityLabel[task.priority]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDays(new Date(task.dueDate))}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        {isOpenForPickup && (
          <Button size="sm" onClick={() => onClaim(task)}>
            <Hand className="h-3.5 w-3.5" />
            Pak op
          </Button>
        )}
        {isMine && task.isOpen && (
          <Button variant="outline" size="sm" onClick={() => onUnclaim(task)}>
            Laat los
          </Button>
        )}
        <button
          onClick={() => onDelete(task)}
          className="text-xs text-muted-foreground hover:text-danger transition-colors p-1.5"
          aria-label="Verwijder"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
