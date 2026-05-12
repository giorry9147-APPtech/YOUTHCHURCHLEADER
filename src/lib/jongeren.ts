"use server";

import { sql } from "@/lib/db";

export type Mood = "great" | "good" | "neutral" | "concerned";
export type PrayerStatus = "active" | "ongoing" | "answered";

export type Jongere = {
  id: string;
  name: string;
  age: number;
  birthday: string;
  joinedAt: string;
  tags: string[];
  struggles: string[];
  avatar: string;
  lastConversation: string | null;
  conversationCount: number;
};

export type Conversation = {
  id: string;
  date: string;
  summary: string;
  mood: Mood;
  leaderId: string;
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

function randomAvatar(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function toIsoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

function toIso(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return "";
}

type JongereRow = {
  id: string;
  name: string;
  age: number;
  birthday: Date | string;
  joined_at: Date | string;
  tags: string[];
  struggles: string[];
  avatar: string;
  last_conversation: Date | string | null;
  conversation_count: number;
};

function mapJongere(r: JongereRow): Jongere {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    birthday: toIsoDate(r.birthday),
    joinedAt: toIsoDate(r.joined_at),
    tags: r.tags ?? [],
    struggles: r.struggles ?? [],
    avatar: r.avatar,
    lastConversation: r.last_conversation ? toIsoDate(r.last_conversation) : null,
    conversationCount: r.conversation_count,
  };
}

// ---- Jongeren ----

export async function listJongeren(): Promise<Jongere[]> {
  const rows = (await sql`
    SELECT id, name, age, birthday, joined_at, tags, struggles, avatar,
           last_conversation, conversation_count
    FROM jongeren ORDER BY name ASC
  `) as JongereRow[];
  return rows.map(mapJongere);
}

export async function getJongere(id: string): Promise<Jongere | null> {
  const rows = (await sql`
    SELECT id, name, age, birthday, joined_at, tags, struggles, avatar,
           last_conversation, conversation_count
    FROM jongeren WHERE id = ${id} LIMIT 1
  `) as JongereRow[];
  return rows[0] ? mapJongere(rows[0]) : null;
}

export type NewJongereInput = {
  name: string;
  age: number;
  birthday: string;
  tags?: string[];
  struggles?: string[];
};

export async function createJongere(input: NewJongereInput): Promise<string> {
  const tags = input.tags ?? [];
  const struggles = input.struggles ?? [];
  const avatar = randomAvatar();
  const rows = (await sql`
    INSERT INTO jongeren (name, age, birthday, tags, struggles, avatar)
    VALUES (${input.name.trim()}, ${input.age}, ${input.birthday},
            ${tags}, ${struggles}, ${avatar})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function updateJongere(id: string, patch: Partial<Jongere>): Promise<void> {
  // Build dynamic update — simple cases for now
  if (patch.name !== undefined) {
    await sql`UPDATE jongeren SET name = ${patch.name}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (patch.age !== undefined) {
    await sql`UPDATE jongeren SET age = ${patch.age}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (patch.tags !== undefined) {
    await sql`UPDATE jongeren SET tags = ${patch.tags}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (patch.struggles !== undefined) {
    await sql`UPDATE jongeren SET struggles = ${patch.struggles}, updated_at = NOW() WHERE id = ${id}`;
  }
}

export async function deleteJongere(id: string): Promise<void> {
  await sql`DELETE FROM jongeren WHERE id = ${id}`;
}

// ---- Conversations ----

export async function listConversations(jongereId: string): Promise<Conversation[]> {
  const rows = (await sql`
    SELECT id, date, summary, mood, leader_id
    FROM conversations
    WHERE jongere_id = ${jongereId}
    ORDER BY date DESC, created_at DESC
  `) as Array<{ id: string; date: Date | string; summary: string; mood: Mood; leader_id: string }>;
  return rows.map((r) => ({
    id: r.id,
    date: toIsoDate(r.date),
    summary: r.summary,
    mood: r.mood,
    leaderId: r.leader_id,
  }));
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
  const rows = (await sql`
    INSERT INTO conversations (jongere_id, date, summary, mood, leader_id)
    VALUES (${jongereId}, ${input.date}, ${input.summary.trim()}, ${input.mood}, ${input.leaderId})
    RETURNING id
  `) as { id: string }[];

  // Update jongere's last_conversation + count
  await sql`
    UPDATE jongeren
    SET last_conversation = ${input.date},
        conversation_count = conversation_count + 1,
        updated_at = NOW()
    WHERE id = ${jongereId}
  `;

  return rows[0].id;
}

// ---- Prayer points ----

export async function listPrayerPoints(jongereId: string): Promise<PrayerPoint[]> {
  const rows = (await sql`
    SELECT id, text, status, created_at
    FROM prayer_points
    WHERE jongere_id = ${jongereId}
    ORDER BY created_at DESC
  `) as Array<{ id: string; text: string; status: PrayerStatus; created_at: Date | string }>;
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    status: r.status,
    createdAt: toIso(r.created_at),
  }));
}

export type NewPrayerInput = {
  text: string;
  status?: PrayerStatus;
};

export async function createPrayerPoint(
  jongereId: string,
  input: NewPrayerInput
): Promise<string> {
  const status = input.status ?? "active";
  const rows = (await sql`
    INSERT INTO prayer_points (jongere_id, text, status)
    VALUES (${jongereId}, ${input.text.trim()}, ${status})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function updatePrayerStatus(
  jongereId: string,
  prayerId: string,
  status: PrayerStatus
): Promise<void> {
  await sql`UPDATE prayer_points SET status = ${status} WHERE id = ${prayerId} AND jongere_id = ${jongereId}`;
}
