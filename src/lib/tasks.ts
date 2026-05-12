import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

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
  createdAt?: string;
};

function fromDoc<T>(snap: { id: string; data: () => DocumentData }): T {
  const data = snap.data();
  const converted: DocumentData = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: unknown }).toDate === "function") {
      converted[k] = (v as { toDate: () => Date }).toDate().toISOString();
    } else {
      converted[k] = v;
    }
  }
  return { id: snap.id, ...converted } as T;
}

export async function listTasks(): Promise<Task[]> {
  const snap = await getDocs(
    query(collection(getDb(), "tasks"), orderBy("dueDate", "asc"))
  );
  return snap.docs.map((d) => fromDoc<Task>(d));
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
  const ref = await addDoc(collection(getDb(), "tasks"), {
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
    priority: input.priority,
    status: "todo" as TaskStatus,
    category: input.category?.trim() || "Algemeen",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(getDb(), "tasks", id), { status });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "tasks", id));
}

// Cycle: todo -> in_progress -> done -> todo
export function nextStatus(s: TaskStatus): TaskStatus {
  if (s === "todo") return "in_progress";
  if (s === "in_progress") return "done";
  return "todo";
}
