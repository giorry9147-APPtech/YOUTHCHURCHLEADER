import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type Mood = "great" | "good" | "neutral" | "concerned";
export type PrayerStatus = "active" | "ongoing" | "answered";

export type Jongere = {
  id: string;
  name: string;
  age: number;
  birthday: string; // YYYY-MM-DD
  joinedAt: string; // YYYY-MM-DD
  tags: string[];
  struggles: string[];
  avatar: string; // hex color
  lastConversation: string | null;
  conversationCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Conversation = {
  id: string;
  date: string;
  summary: string;
  mood: Mood;
  leaderId: string;
  createdAt?: string;
};

export type PrayerPoint = {
  id: string;
  text: string;
  status: PrayerStatus;
  createdAt: string;
};

const PALETTE = [
  "#7c3aed", "#a855f7", "#c026d3", "#db2777", "#e11d48",
  "#ea580c", "#d97706", "#16a34a", "#0d9488", "#0284c7",
  "#4f46e5", "#6d28d9",
];

export function randomAvatar(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function fromDoc<T>(snap: { id: string; data: () => DocumentData }): T {
  const data = snap.data();
  // Convert Firestore Timestamps to ISO strings where present
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

// ---- Jongeren ----

export async function listJongeren(): Promise<Jongere[]> {
  const snap = await getDocs(query(collection(getDb(), "jongeren"), orderBy("name")));
  return snap.docs.map((d) => fromDoc<Jongere>(d));
}

export async function getJongere(id: string): Promise<Jongere | null> {
  const ref = doc(getDb(), "jongeren", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromDoc<Jongere>(snap);
}

export type NewJongereInput = {
  name: string;
  age: number;
  birthday: string;
  tags?: string[];
  struggles?: string[];
};

export async function createJongere(input: NewJongereInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), "jongeren"), {
    name: input.name.trim(),
    age: input.age,
    birthday: input.birthday,
    joinedAt: new Date().toISOString().slice(0, 10),
    tags: input.tags ?? [],
    struggles: input.struggles ?? [],
    avatar: randomAvatar(),
    lastConversation: null,
    conversationCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateJongere(id: string, patch: Partial<Jongere>): Promise<void> {
  const { id: _omit, ...rest } = patch;
  await updateDoc(doc(getDb(), "jongeren", id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJongere(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "jongeren", id));
}

// ---- Conversations ----

export async function listConversations(jongereId: string): Promise<Conversation[]> {
  const snap = await getDocs(
    query(collection(getDb(), "jongeren", jongereId, "conversations"), orderBy("date", "desc"))
  );
  return snap.docs.map((d) => fromDoc<Conversation>(d));
}

export type NewConversationInput = {
  date: string;
  summary: string;
  mood: Mood;
  leaderId: string;
};

export async function createConversation(
  jongereId: string,
  input: NewConversationInput
): Promise<string> {
  const ref = await addDoc(collection(getDb(), "jongeren", jongereId, "conversations"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  // Update jongere's lastConversation + count
  const j = await getJongere(jongereId);
  await updateJongere(jongereId, {
    lastConversation: input.date,
    conversationCount: (j?.conversationCount ?? 0) + 1,
  });
  return ref.id;
}

// ---- Prayer points ----

export async function listPrayerPoints(jongereId: string): Promise<PrayerPoint[]> {
  const snap = await getDocs(
    query(collection(getDb(), "jongeren", jongereId, "prayerPoints"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => fromDoc<PrayerPoint>(d));
}

export type NewPrayerInput = {
  text: string;
  status?: PrayerStatus;
};

export async function createPrayerPoint(
  jongereId: string,
  input: NewPrayerInput
): Promise<string> {
  const ref = await addDoc(collection(getDb(), "jongeren", jongereId, "prayerPoints"), {
    text: input.text.trim(),
    status: input.status ?? "active",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePrayerStatus(
  jongereId: string,
  prayerId: string,
  status: PrayerStatus
): Promise<void> {
  await updateDoc(doc(getDb(), "jongeren", jongereId, "prayerPoints", prayerId), { status });
}
