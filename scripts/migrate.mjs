import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: POSTGRES_URL not set in .env.local");
  process.exit(1);
}

const sql = neon(url);

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,

  `CREATE TABLE IF NOT EXISTS jongeren (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    birthday DATE NOT NULL,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    tags TEXT[] NOT NULL DEFAULT '{}',
    struggles TEXT[] NOT NULL DEFAULT '{}',
    avatar TEXT NOT NULL DEFAULT '#7c3aed',
    last_conversation DATE,
    conversation_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jongere_id UUID NOT NULL REFERENCES jongeren(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    summary TEXT NOT NULL,
    mood TEXT NOT NULL DEFAULT 'good',
    leader_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_conversations_jongere ON conversations(jongere_id, date DESC)`,

  `CREATE TABLE IF NOT EXISTS prayer_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jongere_id UUID NOT NULL REFERENCES jongeren(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_prayer_points_jongere ON prayer_points(jongere_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    capacity INTEGER NOT NULL DEFAULT 40,
    signups INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    cover TEXT NOT NULL DEFAULT '#7c3aed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC)`,

  `CREATE TABLE IF NOT EXISTS event_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_event_signups_event ON event_signups(event_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    type TEXT NOT NULL,
    attendees TEXT[] NOT NULL DEFAULT '{}',
    location TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_agenda_date ON agenda(date ASC, time ASC)`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    assignee_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'todo',
    category TEXT NOT NULL DEFAULT 'Algemeen',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date ASC)`,

  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    reactions JSONB NOT NULL DEFAULT '[]'::jsonb,
    comments INTEGER NOT NULL DEFAULT 0,
    pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)`,
];

console.log("Running migration on", url.replace(/:[^:@]+@/, ":***@"));

// Drop any test tables from earlier debugging
await sql.query(`DROP TABLE IF EXISTS test_table, test_unsafe, test_q`);

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, " ").slice(0, 70);
  process.stdout.write(`  ${preview}…`);
  try {
    await sql.query(stmt);
    console.log(" ✓");
  } catch (err) {
    console.log(" ✗");
    console.error(err.message);
    process.exit(1);
  }
}

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("\nTables in database:");
tables.forEach((t) => console.log(`  - ${t.table_name}`));

console.log("\n✓ Migration complete.");
process.exit(0);
