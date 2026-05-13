import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
const sql = neon(process.env.POSTGRES_URL);

console.log("Creating users table + seeding leader accounts...");

await sql.query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'leader',
    color TEXT NOT NULL DEFAULT '#7c3aed',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
console.log("  ✓ users table ready");

const users = [
  {
    id: "l1",
    email: "giorgio@youthchurchleader.nl",
    name: "Giorgio Simson",
    role: "Hoofdleider",
    color: "#7c3aed",
    password: "Vlinder-Hart-72",
  },
  {
    id: "l2",
    email: "jeliy@youthchurchleader.nl",
    name: "Jeliy Gomes",
    role: "Leider",
    color: "#a855f7",
    password: "Anker-Licht-46",
  },
  {
    id: "l3",
    email: "tersio@youthchurchleader.nl",
    name: "Tersio Demming",
    role: "Leider",
    color: "#c026d3",
    password: "Vuur-Vrede-93",
  },
];

for (const u of users) {
  const hashed = await hash(u.password, 12);
  await sql`
    INSERT INTO users (id, email, password_hash, name, role, color)
    VALUES (${u.id}, ${u.email}, ${hashed}, ${u.name}, ${u.role}, ${u.color})
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          color = EXCLUDED.color,
          updated_at = NOW()
  `;
  console.log(`  ✓ ${u.name} (${u.email})`);
}

console.log("\nLogin credentials (share securely):");
console.log("  ┌─────────────────────────────────────────┬────────────────────┐");
for (const u of users) {
  console.log(`  │ ${u.email.padEnd(40)}│ ${u.password.padEnd(18)} │`);
}
console.log("  └─────────────────────────────────────────┴────────────────────┘");

console.log("\n✓ User seeding complete.");
process.exit(0);
