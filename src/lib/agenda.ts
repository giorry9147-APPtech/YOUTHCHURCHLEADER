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

export type AgendaType = "meeting" | "service" | "social" | "personal";

export type AgendaItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  type: AgendaType;
  attendees: string[];
  location?: string;
  notes?: string;
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

export async function listAgenda(): Promise<AgendaItem[]> {
  // Single orderBy to avoid composite index requirement; sort by time client-side.
  const snap = await getDocs(query(collection(getDb(), "agenda"), orderBy("date", "asc")));
  const items = snap.docs.map((d) => fromDoc<AgendaItem>(d));
  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
}

export async function listAgendaInRange(startIso: string, endIso: string): Promise<AgendaItem[]> {
  const all = await listAgenda();
  return all.filter((a) => a.date >= startIso && a.date <= endIso);
}

export async function listUpcomingAgenda(limit = 4): Promise<AgendaItem[]> {
  const all = await listAgenda();
  const todayIso = new Date().toISOString().slice(0, 10);
  return all.filter((a) => a.date >= todayIso).slice(0, limit);
}

export type NewAgendaInput = {
  title: string;
  date: string;
  time: string;
  duration: number;
  type: AgendaType;
  attendees: string[];
  location?: string;
  notes?: string;
};

export async function createAgendaItem(input: NewAgendaInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), "agenda"), {
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    duration: input.duration,
    type: input.type,
    attendees: input.attendees,
    location: input.location?.trim() ?? "",
    notes: input.notes?.trim() ?? "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAgendaItem(id: string, patch: Partial<AgendaItem>): Promise<void> {
  const { id: _omit, ...rest } = patch;
  await updateDoc(doc(getDb(), "agenda", id), rest);
}

export async function deleteAgendaItem(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "agenda", id));
}
