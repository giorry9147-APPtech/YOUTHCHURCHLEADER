"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck, Loader2, Trash2 } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewTaskButton } from "@/components/forms/new-task-form";
import {
  deleteTask,
  listTasks,
  updateTaskStatus,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";
import { leaderById } from "@/lib/mock-data";
import { cn, formatRelativeDays, nextTaskStatus } from "@/lib/utils";

const columns: {
  key: TaskStatus;
  label: string;
}[] = [
  { key: "todo", label: "Te doen" },
  { key: "in_progress", label: "Bezig" },
  { key: "done", label: "Gedaan" },
];

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;

const priorityLabel = {
  high: "Hoog",
  medium: "Normaal",
  low: "Laag",
};

export default function TakenPage() {
  const [items, setItems] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    // Optimistic update
    setItems((prev) => prev?.map((t) => (t.id === task.id ? { ...t, status: next } : t)) ?? null);
    try {
      await updateTaskStatus(task.id, next);
    } catch (err) {
      console.error(err);
      load(); // rollback
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
  const open = items?.filter((t) => t.status !== "done").length ?? 0;
  const done = items?.filter((t) => t.status === "done").length ?? 0;

  return (
    <>
      <Topbar title="Werkzaamheden" subtitle="Alles wat het team voor elkaar moet krijgen" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {loading ? "Laden…" : `${open} open · ${done} voltooid`}
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

        {!loading && items && items.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">Nog geen taken</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                Begin met je eerste taak. Wijs hem toe aan jou of een collega-leider.
              </p>
              <div className="mt-5">
                <NewTaskButton onCreated={load} />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && items && items.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const list = items.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <Badge variant="muted">{list.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {list.map((t) => {
                      const lead = leaderById(t.assigneeId);
                      const isDone = t.status === "done";
                      const inProgress = t.status === "in_progress";
                      return (
                        <Card key={t.id} className={isDone ? "opacity-70" : ""}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => handleToggle(t)}
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
                                onClick={() => handleDelete(t)}
                                className="shrink-0 text-muted-foreground hover:text-danger transition-colors p-0.5"
                                aria-label="Verwijder"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-2 pl-6">
                              <div className="flex items-center gap-1.5">
                                <Avatar name={lead.name} color={lead.color} size={20} />
                                <span className="text-xs text-muted-foreground">
                                  {lead.name.split(" ")[0]}
                                </span>
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
                            {t.category && (
                              <div className="pl-6">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                  {t.category}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
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
