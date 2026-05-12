"use server";

import { sql } from "@/lib/db";

export type Reaction = { emoji: string; count: number };

export type Message = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  reactions: Reaction[];
  comments: number;
  pinned: boolean;
};

function toIso(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return "";
}

type MessageRow = {
  id: string;
  author_id: string;
  content: string;
  reactions: Reaction[];
  comments: number;
  pinned: boolean;
  created_at: Date | string;
};

function mapMessage(r: MessageRow): Message {
  return {
    id: r.id,
    authorId: r.author_id,
    content: r.content,
    reactions: Array.isArray(r.reactions) ? r.reactions : [],
    comments: r.comments,
    pinned: r.pinned,
    createdAt: toIso(r.created_at),
  };
}

export async function listMessages(): Promise<Message[]> {
  const rows = (await sql`
    SELECT id, author_id, content, reactions, comments, pinned, created_at
    FROM messages ORDER BY created_at DESC
  `) as MessageRow[];
  return rows.map(mapMessage);
}

export type NewMessageInput = {
  authorId: string;
  content: string;
  pinned?: boolean;
};

export async function createMessage(input: NewMessageInput): Promise<string> {
  const rows = (await sql`
    INSERT INTO messages (author_id, content, pinned)
    VALUES (${input.authorId}, ${input.content.trim()}, ${!!input.pinned})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function deleteMessage(id: string): Promise<void> {
  await sql`DELETE FROM messages WHERE id = ${id}`;
}

export async function togglePinMessage(id: string, pinned: boolean): Promise<void> {
  await sql`UPDATE messages SET pinned = ${pinned} WHERE id = ${id}`;
}
