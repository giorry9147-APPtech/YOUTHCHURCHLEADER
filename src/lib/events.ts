"use server";

import { sql } from "@/lib/db";

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
};

const COVERS: Record<EventType, string> = {
  service: "#4c1d95",
  study: "#6d28d9",
  social: "#a855f7",
  outreach: "#7c3aed",
};

function toIso(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return "";
}

type EventRow = {
  id: string;
  title: string;
  date: Date | string;
  end_date: Date | string | null;
  location: string;
  description: string;
  capacity: number;
  signups: number;
  type: EventType;
  cover: string;
};

function mapEvent(r: EventRow): ChurchEvent {
  return {
    id: r.id,
    title: r.title,
    date: toIso(r.date),
    endDate: r.end_date ? toIso(r.end_date) : null,
    location: r.location,
    description: r.description,
    capacity: r.capacity,
    signups: r.signups,
    type: r.type,
    cover: r.cover,
  };
}

export async function listEvents(): Promise<ChurchEvent[]> {
  const rows = (await sql`
    SELECT id, title, date, end_date, location, description, capacity, signups, type, cover
    FROM events ORDER BY date ASC
  `) as EventRow[];
  return rows.map(mapEvent);
}

export async function listUpcomingEvents(limit?: number): Promise<ChurchEvent[]> {
  const cutoff = new Date(Date.now() - 86_400_000).toISOString();
  const rows = (await sql`
    SELECT id, title, date, end_date, location, description, capacity, signups, type, cover
    FROM events
    WHERE date >= ${cutoff}
    ORDER BY date ASC
    ${typeof limit === "number" ? sql`LIMIT ${limit}` : sql``}
  `) as EventRow[];
  return rows.map(mapEvent);
}

export async function getEvent(id: string): Promise<ChurchEvent | null> {
  const rows = (await sql`
    SELECT id, title, date, end_date, location, description, capacity, signups, type, cover
    FROM events WHERE id = ${id} LIMIT 1
  `) as EventRow[];
  return rows[0] ? mapEvent(rows[0]) : null;
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
  const cover = COVERS[input.type];
  const rows = (await sql`
    INSERT INTO events (title, date, end_date, location, description, capacity, type, cover)
    VALUES (${input.title.trim()}, ${input.date}, ${input.endDate ?? null},
            ${input.location.trim()}, ${input.description?.trim() ?? ""},
            ${input.capacity}, ${input.type}, ${cover})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function deleteEvent(id: string): Promise<void> {
  await sql`DELETE FROM events WHERE id = ${id}`;
}

export async function updateEvent(id: string, patch: Partial<ChurchEvent>): Promise<void> {
  if (patch.title !== undefined) {
    await sql`UPDATE events SET title = ${patch.title} WHERE id = ${id}`;
  }
  if (patch.location !== undefined) {
    await sql`UPDATE events SET location = ${patch.location} WHERE id = ${id}`;
  }
  if (patch.description !== undefined) {
    await sql`UPDATE events SET description = ${patch.description} WHERE id = ${id}`;
  }
  if (patch.capacity !== undefined) {
    await sql`UPDATE events SET capacity = ${patch.capacity} WHERE id = ${id}`;
  }
}

// Public signup via QR — no auth, increments signups
export async function rsvpToEvent(eventId: string, name: string): Promise<void> {
  await sql`
    INSERT INTO event_signups (event_id, name)
    VALUES (${eventId}, ${name.trim()})
  `;
  await sql`UPDATE events SET signups = signups + 1 WHERE id = ${eventId}`;
}

export async function listEventSignups(
  eventId: string
): Promise<{ id: string; name: string; createdAt: string }[]> {
  const rows = (await sql`
    SELECT id, name, created_at
    FROM event_signups
    WHERE event_id = ${eventId}
    ORDER BY created_at DESC
  `) as Array<{ id: string; name: string; created_at: Date | string }>;
  return rows.map((r) => ({ id: r.id, name: r.name, createdAt: toIso(r.created_at) }));
}
