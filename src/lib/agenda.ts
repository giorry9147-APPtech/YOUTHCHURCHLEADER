"use server";

import { sql } from "@/lib/db";

export type AgendaType = "meeting" | "service" | "social" | "personal";

export type AgendaItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: AgendaType;
  attendees: string[];
  location?: string;
  notes?: string;
};

function toIsoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

type AgendaRow = {
  id: string;
  title: string;
  date: Date | string;
  time: string;
  duration: number;
  type: AgendaType;
  attendees: string[];
  location: string;
  notes: string;
};

function mapAgenda(r: AgendaRow): AgendaItem {
  return {
    id: r.id,
    title: r.title,
    date: toIsoDate(r.date),
    time: r.time,
    duration: r.duration,
    type: r.type,
    attendees: r.attendees ?? [],
    location: r.location,
    notes: r.notes,
  };
}

export async function listAgenda(): Promise<AgendaItem[]> {
  const rows = (await sql`
    SELECT id, title, date, time, duration, type, attendees, location, notes
    FROM agenda ORDER BY date ASC, time ASC
  `) as AgendaRow[];
  return rows.map(mapAgenda);
}

export async function listUpcomingAgenda(limit = 4): Promise<AgendaItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = (await sql`
    SELECT id, title, date, time, duration, type, attendees, location, notes
    FROM agenda
    WHERE date >= ${today}
    ORDER BY date ASC, time ASC
    LIMIT ${limit}
  `) as AgendaRow[];
  return rows.map(mapAgenda);
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
  const rows = (await sql`
    INSERT INTO agenda (title, date, time, duration, type, attendees, location, notes)
    VALUES (${input.title.trim()}, ${input.date}, ${input.time}, ${input.duration},
            ${input.type}, ${input.attendees},
            ${input.location?.trim() ?? ""}, ${input.notes?.trim() ?? ""})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function deleteAgendaItem(id: string): Promise<void> {
  await sql`DELETE FROM agenda WHERE id = ${id}`;
}
