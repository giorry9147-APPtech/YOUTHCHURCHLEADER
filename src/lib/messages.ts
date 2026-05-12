import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type Reaction = { emoji: string; count: number };

export type Message = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  reactions: Reaction[];
  comments: number;
  pinned?: boolean;
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
  // Sensible defaults for older docs
  if (!Array.isArray(converted.reactions)) converted.reactions = [];
  if (typeof converted.comments !== "number") converted.comments = 0;
  return { id: snap.id, ...converted } as T;
}

export async function listMessages(): Promise<Message[]> {
  const snap = await getDocs(query(collection(getDb(), "messages"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc<Message>(d));
}

export type NewMessageInput = {
  authorId: string;
  content: string;
  pinned?: boolean;
};

export async function createMessage(input: NewMessageInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), "messages"), {
    authorId: input.authorId,
    content: input.content.trim(),
    reactions: [],
    comments: 0,
    pinned: !!input.pinned,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "messages", id));
}

export async function togglePinMessage(id: string, pinned: boolean): Promise<void> {
  await updateDoc(doc(getDb(), "messages", id), { pinned });
}

// Reactions: simple count-based (no per-user tracking yet)
export async function reactToMessage(messageId: string, emoji: string): Promise<void> {
  const ref = doc(getDb(), "messages", messageId);
  // Use a subcollection counter to avoid race conditions — simpler: store reactions as map
  // Strategy: store reactions as object map for atomic increment
  await updateDoc(ref, { [`reactionCounts.${emoji}`]: increment(1), reactions: arrayUnion(emoji) });
}
