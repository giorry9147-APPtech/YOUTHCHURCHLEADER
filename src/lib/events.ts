import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type EventType = "service" | "social" | "study" | "outreach";

export type ChurchEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string | null;
  location: string;
  description: string;
  capacity: number;
  signups: number;
  type: EventType;
  cover: string;
  createdAt?: string;
};

const COVERS: Record<EventType, string> = {
  service: "#4c1d95",
  study: "#6d28d9",
  social: "#a855f7",
  outreach: "#7c3aed",
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

export async function listEvents(): Promise<ChurchEvent[]> {
  const snap = await getDocs(query(collection(getDb(), "events"), orderBy("date", "asc")));
  return snap.docs.map((d) => fromDoc<ChurchEvent>(d));
}

export async function listUpcomingEvents(limit?: number): Promise<ChurchEvent[]> {
  const all = await listEvents();
  const now = Date.now();
  const future = all.filter((e) => new Date(e.date).getTime() >= now - 86_400_000); // include today
  return typeof limit === "number" ? future.slice(0, limit) : future;
}

export async function getEvent(id: string): Promise<ChurchEvent | null> {
  const snap = await getDoc(doc(getDb(), "events", id));
  if (!snap.exists()) return null;
  return fromDoc<ChurchEvent>(snap);
}

export type NewEventInput = {
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description?: string;
  capacity: number;
  type: EventType;
};

export async function createEvent(input: NewEventInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), "events"), {
    title: input.title.trim(),
    date: input.date,
    endDate: input.endDate || null,
    location: input.location.trim(),
    description: input.description?.trim() ?? "",
    capacity: input.capacity,
    signups: 0,
    type: input.type,
    cover: COVERS[input.type],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "events", id));
}

export async function updateEvent(id: string, patch: Partial<ChurchEvent>): Promise<void> {
  const { id: _omit, ...rest } = patch;
  await updateDoc(doc(getDb(), "events", id), rest);
}

// Public signup via QR — no auth, increments signups
export async function rsvpToEvent(eventId: string, name: string): Promise<void> {
  await addDoc(collection(getDb(), "events", eventId, "signups"), {
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(getDb(), "events", eventId), { signups: increment(1) });
}

export async function listEventSignups(eventId: string): Promise<{ id: string; name: string; createdAt?: string }[]> {
  const snap = await getDocs(
    query(collection(getDb(), "events", eventId, "signups"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => fromDoc<{ id: string; name: string; createdAt?: string }>(d));
}
