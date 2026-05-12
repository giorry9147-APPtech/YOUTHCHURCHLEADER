import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
const sql = neon(process.env.POSTGRES_URL);

console.log("Seeding database...");

// Clear existing data (idempotent reseed)
console.log("Clearing tables...");
await sql`TRUNCATE event_signups, events, prayer_points, conversations, jongeren, agenda, tasks, messages RESTART IDENTITY CASCADE`;

// === JONGEREN ===
console.log("Inserting jongeren...");
const jongerenSeed = [
  {
    name: "Ana de Boer",
    age: 17,
    birthday: "2008-05-19",
    tags: ["geloof", "school"],
    struggles: ["Twijfels over haar geloof na een lastig gesprek op school", "Stress door eindexamens"],
    avatar: "#7c3aed",
    lastConversation: "2026-05-08",
    conversationCount: 3,
  },
  {
    name: "Lucas Bakker",
    age: 16,
    birthday: "2009-08-04",
    tags: ["identiteit", "familie"],
    struggles: ["Spanning thuis met ouders"],
    avatar: "#a855f7",
    lastConversation: "2026-05-05",
    conversationCount: 2,
  },
  {
    name: "Sara El Idrissi",
    age: 15,
    birthday: "2010-11-22",
    tags: ["vriendschap", "geloof"],
    struggles: ["Voelt zich soms buitengesloten in haar vriendengroep"],
    avatar: "#c026d3",
    lastConversation: null,
    conversationCount: 0,
  },
];

const jongerenIds = {};
for (const j of jongerenSeed) {
  const rows = await sql`
    INSERT INTO jongeren (name, age, birthday, tags, struggles, avatar, last_conversation, conversation_count)
    VALUES (${j.name}, ${j.age}, ${j.birthday}, ${j.tags}, ${j.struggles}, ${j.avatar},
            ${j.lastConversation}, ${j.conversationCount})
    RETURNING id
  `;
  jongerenIds[j.name] = rows[0].id;
  console.log(`  ✓ ${j.name}`);
}

// === CONVERSATIONS ===
console.log("Inserting conversations...");
const conversationsSeed = [
  { jongere: "Ana de Boer", date: "2026-05-08", summary: "Open gesprek over haar twijfels — heeft een vriendin gevonden om mee te bidden.", mood: "good", leaderId: "l1" },
  { jongere: "Ana de Boer", date: "2026-04-28", summary: "Worstelt met de druk van school. Samen Psalm 23 gelezen.", mood: "neutral", leaderId: "l1" },
  { jongere: "Ana de Boer", date: "2026-04-14", summary: "Vertelde over een spannend gesprek met klasgenoten — God gaf moed.", mood: "great", leaderId: "l2" },
  { jongere: "Lucas Bakker", date: "2026-05-05", summary: "Goed gesprek over zijn rol in het gezin. Voelt zich gehoord.", mood: "good", leaderId: "l3" },
  { jongere: "Lucas Bakker", date: "2026-04-20", summary: "Stil maar geopend toen we het over zijn vader hadden.", mood: "concerned", leaderId: "l1" },
];
for (const c of conversationsSeed) {
  await sql`
    INSERT INTO conversations (jongere_id, date, summary, mood, leader_id)
    VALUES (${jongerenIds[c.jongere]}, ${c.date}, ${c.summary}, ${c.mood}, ${c.leaderId})
  `;
}
console.log(`  ✓ ${conversationsSeed.length} gesprekken`);

// === PRAYER POINTS ===
console.log("Inserting gebedspunten...");
const prayersSeed = [
  { jongere: "Ana de Boer", text: "Rust en focus tijdens examens", status: "active" },
  { jongere: "Ana de Boer", text: "Doorbraak in haar twijfels", status: "ongoing" },
  { jongere: "Ana de Boer", text: "Vrijmoedigheid om over geloof te praten", status: "answered" },
  { jongere: "Lucas Bakker", text: "Wijsheid en rust in zijn gezin", status: "active" },
  { jongere: "Sara El Idrissi", text: "Goede vrienden die haar geloof versterken", status: "active" },
];
for (const p of prayersSeed) {
  await sql`
    INSERT INTO prayer_points (jongere_id, text, status)
    VALUES (${jongerenIds[p.jongere]}, ${p.text}, ${p.status})
  `;
}
console.log(`  ✓ ${prayersSeed.length} gebedspunten`);

// === EVENTS ===
console.log("Inserting events...");
const eventsSeed = [
  {
    title: "Jongerendienst — Vrijheid",
    date: "2026-05-15T19:30:00Z",
    endDate: "2026-05-15T22:00:00Z",
    location: "De Hoeksteen, Hoofdzaal",
    description: "Een avond over wat het betekent om vrij te zijn in Christus. Met worship, gebed en een korte preek.",
    capacity: 80,
    type: "service",
    cover: "#4c1d95",
  },
  {
    title: "Bowling Avond",
    date: "2026-05-22T19:00:00Z",
    endDate: "2026-05-22T22:30:00Z",
    location: "Bowling Centrum Centrum",
    description: "Ontspannen avond, eerste 20 jongeren €5 korting!",
    capacity: 40,
    type: "social",
    cover: "#a855f7",
  },
];
for (const e of eventsSeed) {
  await sql`
    INSERT INTO events (title, date, end_date, location, description, capacity, type, cover)
    VALUES (${e.title}, ${e.date}, ${e.endDate}, ${e.location}, ${e.description}, ${e.capacity}, ${e.type}, ${e.cover})
  `;
  console.log(`  ✓ ${e.title}`);
}

// === AGENDA ===
console.log("Inserting agenda items...");
const agendaSeed = [
  { title: "Leidersoverleg", date: "2026-05-13", time: "20:00", duration: 90, type: "meeting", attendees: ["l1", "l2", "l3"] },
  { title: "1-op-1 met Ana", date: "2026-05-14", time: "16:00", duration: 60, type: "personal", attendees: ["l1"] },
  { title: "Voorbereiding Jongerendienst", date: "2026-05-15", time: "17:30", duration: 90, type: "meeting", attendees: ["l1", "l2"] },
  { title: "Jongerendienst — Vrijheid", date: "2026-05-15", time: "19:30", duration: 150, type: "service", attendees: ["l1", "l2", "l3"] },
  { title: "Bowling Avond", date: "2026-05-22", time: "19:00", duration: 210, type: "social", attendees: ["l1", "l2", "l3"] },
];
for (const a of agendaSeed) {
  await sql`
    INSERT INTO agenda (title, date, time, duration, type, attendees)
    VALUES (${a.title}, ${a.date}, ${a.time}, ${a.duration}, ${a.type}, ${a.attendees})
  `;
}
console.log(`  ✓ ${agendaSeed.length} agenda items`);

// === TASKS ===
console.log("Inserting tasks...");
const tasksSeed = [
  { title: "Preek voorbereiden — Vrijheid", description: "Romeinen 6-8 als basis, max 25 minuten", assigneeId: "l1", dueDate: "2026-05-14", priority: "high", category: "Jongerendienst" },
  { title: "Worship setlist maken", assigneeId: "l2", dueDate: "2026-05-14", priority: "high", category: "Jongerendienst" },
  { title: "Stoelen klaarzetten", assigneeId: "l3", dueDate: "2026-05-15", priority: "medium", category: "Jongerendienst" },
  { title: "Bowling reservering bevestigen", assigneeId: "l1", dueDate: "2026-05-18", priority: "medium", category: "Activiteit" },
];
for (const t of tasksSeed) {
  await sql`
    INSERT INTO tasks (title, description, assignee_id, due_date, priority, category)
    VALUES (${t.title}, ${t.description ?? ""}, ${t.assigneeId}, ${t.dueDate}, ${t.priority}, ${t.category})
  `;
}
console.log(`  ✓ ${tasksSeed.length} taken`);

// === MESSAGES ===
console.log("Inserting messages...");
const messagesSeed = [
  {
    authorId: "l1",
    content: "Team, mooie meeting gisteren! Vergeet niet dat we vrijdag om 19:30 starten met de jongerendienst. Worship om 19:00 voor soundcheck.",
    pinned: true,
  },
  {
    authorId: "l2",
    content: "Heb met Sara gepraat — moeilijke week voor haar gehad. Laten we extra om haar denken in onze gebeden deze week. 🙏",
    pinned: false,
  },
];
for (const m of messagesSeed) {
  await sql`
    INSERT INTO messages (author_id, content, pinned)
    VALUES (${m.authorId}, ${m.content}, ${m.pinned})
  `;
}
console.log(`  ✓ ${messagesSeed.length} berichten`);

console.log("\n✓ Seed complete.");
console.log("\nSummary:");
const counts = await sql`
  SELECT
    (SELECT COUNT(*) FROM jongeren) AS jongeren,
    (SELECT COUNT(*) FROM conversations) AS conversations,
    (SELECT COUNT(*) FROM prayer_points) AS prayers,
    (SELECT COUNT(*) FROM events) AS events,
    (SELECT COUNT(*) FROM agenda) AS agenda,
    (SELECT COUNT(*) FROM tasks) AS tasks,
    (SELECT COUNT(*) FROM messages) AS messages
`;
console.log(JSON.stringify(counts[0], null, 2));

process.exit(0);
