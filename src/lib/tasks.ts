"use server";

import { sql } from "@/lib/db";

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId: string | null;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  eventId: string | null;
  isOpen: boolean;
  claimedAt: string | null;
};

function toIsoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}
function toIso(d: unknown): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return null;
}

type TaskRow = {
  id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  due_date: Date | string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  event_id: string | null;
  is_open: boolean;
  claimed_at: Date | string | null;
};

function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    assigneeId: r.assignee_id,
    dueDate: toIsoDate(r.due_date),
    priority: r.priority,
    status: r.status,
    category: r.category,
    eventId: r.event_id,
    isOpen: r.is_open,
    claimedAt: toIso(r.claimed_at),
  };
}

const SELECT_TASK = `
  SELECT id, title, description, assignee_id, due_date, priority, status,
         category, event_id, is_open, claimed_at
  FROM tasks
`;

export async function listTasks(): Promise<Task[]> {
  const rows = (await sql`
    SELECT id, title, description, assignee_id, due_date, priority, status,
           category, event_id, is_open, claimed_at
    FROM tasks
    ORDER BY due_date ASC
  `) as TaskRow[];
  return rows.map(mapTask);
}

/** Tasks assigned to or claimed by a specific user. */
export async function listMyTasks(userId: string): Promise<Task[]> {
  const rows = (await sql`
    SELECT id, title, description, assignee_id, due_date, priority, status,
           category, event_id, is_open, claimed_at
    FROM tasks
    WHERE assignee_id = ${userId}
    ORDER BY status ASC, due_date ASC
  `) as TaskRow[];
  return rows.map(mapTask);
}

/** Tasks that are open for anyone to claim. */
export async function listOpenTasks(): Promise<Task[]> {
  const rows = (await sql`
    SELECT id, title, description, assignee_id, due_date, priority, status,
           category, event_id, is_open, claimed_at
    FROM tasks
    WHERE is_open = true AND assignee_id IS NULL
    ORDER BY due_date ASC
  `) as TaskRow[];
  return rows.map(mapTask);
}

/** Tasks linked to a specific event. */
export async function listEventTasks(eventId: string): Promise<Task[]> {
  const rows = (await sql`
    SELECT id, title, description, assignee_id, due_date, priority, status,
           category, event_id, is_open, claimed_at
    FROM tasks
    WHERE event_id = ${eventId}
    ORDER BY status ASC, due_date ASC
  `) as TaskRow[];
  return rows.map(mapTask);
}

export type NewTaskInput = {
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueDate: string;
  priority: Priority;
  category?: string;
  eventId?: string | null;
  isOpen?: boolean;
};

export async function createTask(input: NewTaskInput): Promise<string> {
  const isOpen = input.isOpen ?? false;
  const assignee = isOpen ? null : input.assigneeId ?? null;
  const rows = (await sql`
    INSERT INTO tasks (title, description, assignee_id, due_date, priority,
                       category, event_id, is_open)
    VALUES (${input.title.trim()}, ${input.description?.trim() ?? ""},
            ${assignee}, ${input.dueDate}, ${input.priority},
            ${input.category?.trim() || "Algemeen"}, ${input.eventId ?? null}, ${isOpen})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await sql`UPDATE tasks SET status = ${status} WHERE id = ${id}`;
}

/** A user voluntarily claims an open task. */
export async function claimTask(taskId: string, userId: string): Promise<void> {
  await sql`
    UPDATE tasks
    SET assignee_id = ${userId}, claimed_at = NOW()
    WHERE id = ${taskId} AND assignee_id IS NULL
  `;
}

/** Release a previously-claimed open task back to the pool. */
export async function unclaimTask(taskId: string): Promise<void> {
  await sql`
    UPDATE tasks
    SET assignee_id = NULL, claimed_at = NULL
    WHERE id = ${taskId} AND is_open = true
  `;
}

export async function deleteTask(id: string): Promise<void> {
  await sql`DELETE FROM tasks WHERE id = ${id}`;
}
