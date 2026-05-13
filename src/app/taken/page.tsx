"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Hand,
  Loader2,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewTaskButton } from "@/components/forms/new-task-form";
import { Button } from "@/components/ui/button";
import {
  claimTask,
  deleteTask,
  listTasks,
  updateTaskStatus,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";
import { leaderById } from "@/lib/mock-data";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn, formatRelativeDays, nextTaskStatus } from "@/lib/utils";

type Filter = "all" | "mine" | "open";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Te doen" },
  { key: "in_progress", label: "Bezig" },
  { key: "done", label: "Gedaan" },
];

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;
const priorityLabel = { high: "Hoog", medium: "Normaal", low: "Laag" };

export default function TakenPage() {
  const currentUser = useCurrentUser();
  const [items, setItems] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listTasks();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon taken niet laden.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(task: Task) {
    const next = nextTaskStatus(task.status);
    setItems((prev) => prev?.map((t) => (t.id === task.id ? { ...t, status: next } : t)) ?? null);
    try {
      await updateTaskStatus(task.id, next);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleClaim(task: Task) {
    setItems(
      (prev) =>
        prev?.map((t) =>
          t.id === task.id
            ? { ...t, assigneeId: currentUser.id, claimedAt: new Date().toISOString() }
            : t
        ) ?? null
    );
    try {
      await claimTask(task.id, currentUser.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Verwijder taak "${task.title}"?`)) return;
    setItems((prev) => prev?.filter((t) => t.id !== task.id) ?? null);
    try {
      await deleteTask(task.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  const loading = items === null;
  const filtered = (items ?? []).filter((t) => {
    if (filter === "mine") return t.assigneeId === currentUser.id;
    if (filter === "open") return t.isOpen && !t.assigneeId;
    return true;
  });

  const counts = {
    all: items?.length ?? 0,
    mine: items?.filter((t) => t.assigneeId === currentUser.id).length ?? 0,
    open: items?.filter((t) => t.isOpen && !t.assigneeId).length ?? 0,
  };

  const subtitleFor: Record<Filter, string> = {
    all: "Alles wat het team voor elkaar moet krijgen",
    mine: "Wat jij hebt opgepakt of toegewezen kreeg",
    open: "Open voor iedereen — pak er een op",
  };

  return (
    <>
      <Topbar title="Werkzaamheden" subtitle={subtitleFor[filter]} />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl w-full mx-auto">
        {/* Filter tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex rounded-full bg-muted p-1 text-sm font-medium">
            <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
              Alle <span className="opacity-60 ml-1">{counts.all}</span>
            </FilterTab>
            <FilterTab active={filter === "mine"} onClick={() => setFilter("mine")}>
              Mijn To Do&apos;s <span className="opacity-60 ml-1">{counts.mine}</span>
            </FilterTab>
            <FilterTab active={filter === "open"} onClick={() => setFilter("open")}>
              Open <span className="opacity-60 ml-1">{counts.open}</span>
            </FilterTab>
          </div>
          <NewTaskButton onCreated={load} />
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Taken laden…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">
                {filter === "mine"
                  ? "Geen taken voor jou"
                  : filter === "open"
                  ? "Geen open taken"
                  : "Nog geen taken"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                {filter === "mine"
                  ? "Wat jij opgepakt of toegewezen krijgt verschijnt hier."
                  : filter === "open"
                  ? "Wijs een nieuwe taak aan als 'open voor iedereen' — dan ziet iedereen hem hier."
                  : "Begin met je eerste taak. Wijs hem toe of laat hem open voor de groep."}
              </p>
              <div className="mt-5">
                <NewTaskButton onCreated={load} />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const list = filtered.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <Badge variant="muted">{list.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {list.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onToggle={handleToggle}
                        onClaim={handleClaim}
                        onDelete={handleDelete}
                      />
                    ))}
                    {list.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6 border-2 border-dashed border-border rounded-2xl">
                        Niets in &ldquo;{col.label}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function TaskCard({
  task: t,
  onToggle,
  onClaim,
  onDelete,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  onClaim: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const lead = t.assigneeId ? leaderById(t.assigneeId) : null;
  const isDone = t.status === "done";
  const inProgress = t.status === "in_progress";
  const isOpenForPickup = t.isOpen && !t.assigneeId;

  return (
    <Card
      className={cn(
        isDone && "opacity-70",
        isOpenForPickup && "border-primary/30 bg-primary-soft/30"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <button
            onClick={() => onToggle(t)}
            className="mt-0.5 shrink-0"
            aria-label="Toggle status"
          >
            {isDone ? (
              <CheckCircle2 className="h-4 w-4 text-green-700" />
            ) : inProgress ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary-soft" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "text-sm font-medium leading-snug",
                isDone && "line-through text-muted-foreground"
              )}
            >
              {t.title}
            </div>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(t)}
            className="shrink-0 text-muted-foreground hover:text-danger transition-colors p-0.5"
            aria-label="Verwijder"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 pl-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            {lead ? (
              <>
                <Avatar name={lead.name} color={lead.color} size={20} />
                <span className="text-xs text-muted-foreground">{lead.name.split(" ")[0]}</span>
                {t.claimedAt && (
                  <span className="text-[10px] text-muted-foreground">(opgepakt)</span>
                )}
              </>
            ) : (
              <Badge variant="accent" className="text-[10px]">
                Open
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={priorityVariant[t.priority]} className="text-[10px]">
              {priorityLabel[t.priority]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeDays(new Date(t.dueDate))}
            </span>
          </div>
        </div>
        {t.eventId && (
          <div className="pl-6">
            <Link
              href={`/events/${t.eventId}`}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary font-semibold hover:underline"
            >
              <CalendarDays className="h-3 w-3" />
              Event-taak
            </Link>
          </div>
        )}
        {!t.eventId && t.category && (
          <div className="pl-6">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {t.category}
            </span>
          </div>
        )}
        {isOpenForPickup && (
          <div className="pl-6">
            <Button size="sm" onClick={() => onClaim(t)} className="w-full">
              <Hand className="h-3.5 w-3.5" />
              Pak deze taak op
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
