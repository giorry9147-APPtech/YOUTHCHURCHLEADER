"use server";

import { sql } from "@/lib/db";

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
};

function toIsoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

type TaskRow = {
  id: string;
  title: string;
  description: string;
  assignee_id: string;
  due_date: Date | string;
  priority: Priority;
  status: TaskStatus;
  category: string;
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
  };
}

export async function listTasks(): Promise<Task[]> {
  const rows = (await sql`
    SELECT id, title, description, assignee_id, due_date, priority, status, category
    FROM tasks ORDER BY due_date ASC
  `) as TaskRow[];
  return rows.map(mapTask);
}

export type NewTaskInput = {
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  priority: Priority;
  category?: string;
};

export async function createTask(input: NewTaskInput): Promise<string> {
  const rows = (await sql`
    INSERT INTO tasks (title, description, assignee_id, due_date, priority, category)
    VALUES (${input.title.trim()}, ${input.description?.trim() ?? ""},
            ${input.assigneeId}, ${input.dueDate}, ${input.priority},
            ${input.category?.trim() || "Algemeen"})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await sql`UPDATE tasks SET status = ${status} WHERE id = ${id}`;
}

export async function deleteTask(id: string): Promise<void> {
  await sql`DELETE FROM tasks WHERE id = ${id}`;
}

