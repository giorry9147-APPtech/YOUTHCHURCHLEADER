"use server";

import { sql } from "@/lib/db";

export type AttendanceRecord = {
  eventId: string;
  jongereId: string;
};

export type JongereAttendanceStat = {
  jongereId: string;
  name: string;
  avatar: string;
  attended: number;
  totalEvents: number;
};

function toIso(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return "";
}

export async function listAttendance(eventId: string): Promise<string[]> {
  const rows = (await sql`
    SELECT jongere_id FROM attendance WHERE event_id = ${eventId}
  `) as { jongere_id: string }[];
  return rows.map((r) => r.jongere_id);
}

export async function setAttendance(
  eventId: string,
  jongereId: string,
  present: boolean
): Promise<void> {
  if (present) {
    await sql`
      INSERT INTO attendance (event_id, jongere_id)
      VALUES (${eventId}, ${jongereId})
      ON CONFLICT (event_id, jongere_id) DO NOTHING
    `;
  } else {
    await sql`
      DELETE FROM attendance WHERE event_id = ${eventId} AND jongere_id = ${jongereId}
    `;
  }
}

/**
 * Aggregate attendance per jongere over the most recent N past events.
 * Returns one row per jongere with attended/total counts.
 */
export async function attendanceStats(
  recentEventLimit = 5
): Promise<JongereAttendanceStat[]> {
  // Find the N most recent past events
  const events = (await sql`
    SELECT id FROM events
    WHERE date < NOW()
    ORDER BY date DESC
    LIMIT ${recentEventLimit}
  `) as { id: string }[];

  if (events.length === 0) {
    // No past events; show youths with 0/0
    const j = (await sql`SELECT id, name, avatar FROM jongeren ORDER BY name`) as
      { id: string; name: string; avatar: string }[];
    return j.map((row) => ({
      jongereId: row.id,
      name: row.name,
      avatar: row.avatar,
      attended: 0,
      totalEvents: 0,
    }));
  }

  const eventIds = events.map((e) => e.id);
  const totalEvents = eventIds.length;

  const rows = (await sql`
    SELECT j.id AS jongere_id, j.name, j.avatar,
           COUNT(a.id) AS attended
    FROM jongeren j
    LEFT JOIN attendance a
      ON a.jongere_id = j.id AND a.event_id = ANY(${eventIds})
    GROUP BY j.id, j.name, j.avatar
    ORDER BY attended DESC, j.name ASC
  `) as { jongere_id: string; name: string; avatar: string; attended: string | number }[];

  return rows.map((row) => ({
    jongereId: row.jongere_id,
    name: row.name,
    avatar: row.avatar,
    attended: Number(row.attended),
    totalEvents,
  }));
}

/** All past events with attendance count, sorted newest first */
export async function listEventAttendance(): Promise<
  { id: string; title: string; date: string; signups: number; attended: number; cover: string; coverImage: string | null }[]
> {
  const rows = (await sql`
    SELECT e.id, e.title, e.date, e.signups, e.cover, e.cover_image,
           COUNT(a.id) AS attended
    FROM events e
    LEFT JOIN attendance a ON a.event_id = e.id
    WHERE e.date < NOW()
    GROUP BY e.id
    ORDER BY e.date DESC
  `) as Array<{
    id: string;
    title: string;
    date: Date | string;
    signups: number;
    cover: string;
    cover_image: string | null;
    attended: string | number;
  }>;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: toIso(r.date),
    signups: r.signups,
    attended: Number(r.attended),
    cover: r.cover,
    coverImage: r.cover_image,
  }));
}

/** Recent events that haven't started yet (or are ongoing) — for marking attendance */
export async function listEventsForAttendance(): Promise<
  { id: string; title: string; date: string; cover: string; coverImage: string | null }[]
> {
  const rows = (await sql`
    SELECT id, title, date, cover, cover_image
    FROM events
    ORDER BY date DESC
    LIMIT 20
  `) as Array<{
    id: string;
    title: string;
    date: Date | string;
    cover: string;
    cover_image: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: toIso(r.date),
    cover: r.cover,
    coverImage: r.cover_image,
  }));
}
