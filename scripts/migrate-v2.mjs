import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
const sql = neon(process.env.POSTGRES_URL);

const statements = [
  // Event cover image
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image TEXT`,

  // Tasks: link to event, allow nullable assignee, add is_open + claimed_at
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ`,
  `ALTER TABLE tasks ALTER COLUMN assignee_id DROP NOT NULL`,

  // Attendance
  `CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    jongere_id UUID NOT NULL REFERENCES jongeren(id) ON DELETE CASCADE,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, jongere_id)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_jongere ON attendance(jongere_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id)`,
];

console.log("Running migration v2...");
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

console.log("\n✓ Migration v2 complete.");
process.exit(0);
