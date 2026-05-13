export type Leader = {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
};

export type Youth = {
  id: string;
  name: string;
  age: number;
  birthday: string; // YYYY-MM-DD
  joinedAt: string;
  tags: string[];
  lastConversation: string;
  conversationCount: number;
  struggles: string[];
  prayerPoints: PrayerPoint[];
  conversations: Conversation[];
  avatar: string; // initials backed color
};

export type PrayerPoint = {
  id: string;
  text: string;
  createdAt: string;
  status: "active" | "answered" | "ongoing";
};

export type Conversation = {
  id: string;
  date: string;
  summary: string;
  mood: "great" | "good" | "neutral" | "concerned";
  leaderId: string;
};

export type Event = {
  id: string;
  title: string;
  date: string; // ISO
  endDate?: string;
  location: string;
  description: string;
  capacity: number;
  signups: number;
  type: "service" | "social" | "study" | "outreach";
  cover: string;
};

export type AgendaItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: "meeting" | "service" | "social" | "personal";
  attendees: string[];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  category: string;
};

export type Message = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  reactions: { emoji: string; count: number }[];
  comments: number;
  pinned?: boolean;
};

/**
 * Static leader metadata for display purposes (avatars in feeds, dropdowns, etc.).
 * The real authoritative source for users/auth is the `users` table.
 * Keep this in sync with the users seeded by scripts/seed-users.mjs.
 */
export const leaders: Leader[] = [
  {
    id: "l1",
    name: "Giorgio Simson",
    role: "Hoofdleider",
    email: "giorgio@youthchurchleader.nl",
    initials: "GS",
    color: "#7c3aed",
  },
  {
    id: "l2",
    name: "Jeliy Gomes",
    role: "Leider",
    email: "jeliy@youthchurchleader.nl",
    initials: "JG",
    color: "#a855f7",
  },
  {
    id: "l3",
    name: "Tersio Demming",
    role: "Leider",
    email: "tersio@youthchurchleader.nl",
    initials: "TD",
    color: "#c026d3",
  },
];

// Legacy export: only used as a "loading state" placeholder.
// All authenticated components use `useCurrentUser()` from `@/lib/use-current-user`.
export const currentUser: Leader = leaders[0];

const palette = ["#1c1917", "#b45309", "#15803d", "#7c3aed", "#0e7490", "#be123c", "#a16207", "#4338ca"];

function color(i: number) {
  return palette[i % palette.length];
}

export const youth: Youth[] = [
  {
    id: "y1",
    name: "Ana de Boer",
    age: 17,
    birthday: "2008-05-19",
    joinedAt: "2024-09-01",
    tags: ["geloof", "school"],
    lastConversation: "2026-04-28",
    conversationCount: 7,
    struggles: [
      "Twijfels over haar geloof na een lastig gesprek op school",
      "Stress door eindexamens",
      "Moeite om stille tijd vol te houden",
    ],
    prayerPoints: [
      { id: "p1", text: "Rust en focus tijdens examens", createdAt: "2026-04-28", status: "active" },
      { id: "p2", text: "Doorbraak in haar twijfels", createdAt: "2026-04-14", status: "ongoing" },
      { id: "p3", text: "Vrijmoedigheid om over geloof te praten", createdAt: "2026-03-30", status: "answered" },
    ],
    conversations: [
      { id: "c1", date: "2026-04-28", summary: "Open gesprek over twijfels — heeft een vriendin gevonden om mee te bidden.", mood: "good", leaderId: "l1" },
      { id: "c2", date: "2026-04-14", summary: "Worstelt met de druk van school. Samen Psalm 23 gelezen.", mood: "neutral", leaderId: "l1" },
      { id: "c3", date: "2026-03-30", summary: "Vertelde over een spannend gesprek met klasgenoten — God gaf moed.", mood: "great", leaderId: "l2" },
    ],
    avatar: color(0),
  },
  {
    id: "y2",
    name: "Lucas Bakker",
    age: 16,
    birthday: "2009-08-04",
    joinedAt: "2025-01-15",
    tags: ["identiteit", "familie"],
    lastConversation: "2026-05-05",
    conversationCount: 5,
    struggles: ["Spanning thuis met ouders", "Onzeker over wat hij wil studeren"],
    prayerPoints: [
      { id: "p4", text: "Wijsheid en rust in zijn gezin", createdAt: "2026-05-05", status: "active" },
      { id: "p5", text: "Duidelijkheid over zijn toekomst", createdAt: "2026-04-20", status: "ongoing" },
    ],
    conversations: [
      { id: "c4", date: "2026-05-05", summary: "Goed gesprek over zijn rol in het gezin. Voelt zich gehoord.", mood: "good", leaderId: "l3" },
      { id: "c5", date: "2026-04-20", summary: "Stil maar geopend toen we het over zijn vader hadden.", mood: "concerned", leaderId: "l1" },
    ],
    avatar: color(1),
  },
  {
    id: "y3",
    name: "Sara El Idrissi",
    age: 15,
    birthday: "2010-11-22",
    joinedAt: "2024-10-10",
    tags: ["vriendschap", "geloof"],
    lastConversation: "2026-04-12",
    conversationCount: 4,
    struggles: ["Voelt zich soms buitengesloten in haar vriendengroep"],
    prayerPoints: [
      { id: "p6", text: "Goede vrienden die haar geloof versterken", createdAt: "2026-04-12", status: "active" },
    ],
    conversations: [
      { id: "c6", date: "2026-04-12", summary: "Vertelde over een ruzie met haar beste vriendin. Erg open.", mood: "neutral", leaderId: "l2" },
    ],
    avatar: color(2),
  },
  {
    id: "y4",
    name: "Tim Janssen",
    age: 18,
    birthday: "2007-12-30",
    joinedAt: "2023-09-01",
    tags: ["geloof", "leiderschap"],
    lastConversation: "2026-05-08",
    conversationCount: 12,
    struggles: ["Wil meer verantwoordelijkheid maar weet niet hoe te beginnen"],
    prayerPoints: [
      { id: "p7", text: "Roeping en bevestiging in leiderschap", createdAt: "2026-05-08", status: "active" },
    ],
    conversations: [
      { id: "c7", date: "2026-05-08", summary: "Sprak over zijn verlangen om jongeren te bemoedigen. Mooi gesprek!", mood: "great", leaderId: "l1" },
    ],
    avatar: color(3),
  },
  {
    id: "y5",
    name: "Noa Visser",
    age: 14,
    birthday: "2011-05-15",
    joinedAt: "2025-09-01",
    tags: ["familie", "school"],
    lastConversation: "2026-04-30",
    conversationCount: 3,
    struggles: ["Aanpassing aan middelbare school"],
    prayerPoints: [
      { id: "p8", text: "Vrede in haar overgang naar de brugklas", createdAt: "2026-04-30", status: "active" },
    ],
    conversations: [
      { id: "c8", date: "2026-04-30", summary: "Eerste echte gesprek — voelt zich klein op school maar groeit.", mood: "good", leaderId: "l2" },
    ],
    avatar: color(4),
  },
  {
    id: "y6",
    name: "Jonas van Dijk",
    age: 17,
    birthday: "2008-05-25",
    joinedAt: "2024-02-01",
    tags: ["identiteit"],
    lastConversation: "2026-03-15",
    conversationCount: 6,
    struggles: ["Zoektocht naar identiteit, vergelijkt zich veel"],
    prayerPoints: [
      { id: "p9", text: "Innerlijke rust en identiteit in Christus", createdAt: "2026-03-15", status: "ongoing" },
    ],
    conversations: [
      { id: "c9", date: "2026-03-15", summary: "Worstelt met social media druk. Goede stappen gezet.", mood: "neutral", leaderId: "l3" },
    ],
    avatar: color(5),
  },
  {
    id: "y7",
    name: "Eva Hofstra",
    age: 16,
    birthday: "2009-07-08",
    joinedAt: "2024-11-20",
    tags: ["geloof", "familie"],
    lastConversation: "2026-05-10",
    conversationCount: 8,
    struggles: ["Ouders zijn niet gelovig — voelt soms eenzaam"],
    prayerPoints: [
      { id: "p10", text: "Haar ouders mogen God leren kennen", createdAt: "2026-05-10", status: "ongoing" },
      { id: "p11", text: "Bemoediging op moeilijke dagen", createdAt: "2026-04-25", status: "active" },
    ],
    conversations: [
      { id: "c10", date: "2026-05-10", summary: "Bemoedigend gesprek — God werkt zichtbaar in haar leven.", mood: "great", leaderId: "l1" },
    ],
    avatar: color(6),
  },
  {
    id: "y8",
    name: "Daan Mulder",
    age: 15,
    birthday: "2010-06-02",
    joinedAt: "2025-04-15",
    tags: ["school"],
    lastConversation: "2026-04-22",
    conversationCount: 2,
    struggles: ["Faalangst, presteert onder zijn niveau"],
    prayerPoints: [
      { id: "p12", text: "Zelfvertrouwen en focus", createdAt: "2026-04-22", status: "active" },
    ],
    conversations: [
      { id: "c11", date: "2026-04-22", summary: "Stilzwijgend maar openhartig. Bidden hielp hem.", mood: "neutral", leaderId: "l3" },
    ],
    avatar: color(7),
  },
];

export const events: Event[] = [
  {
    id: "e1",
    title: "Jongerendienst — Vrijheid",
    date: "2026-05-15T19:30:00",
    endDate: "2026-05-15T22:00:00",
    location: "De Hoeksteen, Hoofdzaal",
    description: "Een avond over wat het betekent om vrij te zijn in Christus. Met worship, gebed en een korte preek door Giorgio.",
    capacity: 80,
    signups: 47,
    type: "service",
    cover: "#4c1d95",
  },
  {
    id: "e2",
    title: "Bowling Avond",
    date: "2026-05-22T19:00:00",
    endDate: "2026-05-22T22:30:00",
    location: "Bowling Centrum Centrum",
    description: "Ontspannen avond, eerste 20 jongeren €5 korting!",
    capacity: 40,
    signups: 23,
    type: "social",
    cover: "#a855f7",
  },
  {
    id: "e3",
    title: "Bijbelstudie — Romeinen 8",
    date: "2026-05-19T20:00:00",
    endDate: "2026-05-19T21:30:00",
    location: "Bovenzaal kerk",
    description: "Diepgaande studie. Neem je Bijbel en notitieblok mee.",
    capacity: 25,
    signups: 18,
    type: "study",
    cover: "#6d28d9",
  },
  {
    id: "e4",
    title: "Outreach in het Park",
    date: "2026-06-07T14:00:00",
    endDate: "2026-06-07T17:00:00",
    location: "Vondelpark, hoofdingang",
    description: "Naar buiten, mensen ontmoeten, getuigen. Aanrader voor iedereen!",
    capacity: 30,
    signups: 12,
    type: "outreach",
    cover: "#7c3aed",
  },
];

export const agenda: AgendaItem[] = [
  { id: "a1", title: "Leidersoverleg", date: "2026-05-12", time: "20:00", duration: 90, type: "meeting", attendees: ["l1", "l2", "l3"] },
  { id: "a2", title: "1-op-1 met Ana", date: "2026-05-13", time: "16:00", duration: 60, type: "personal", attendees: ["l1"] },
  { id: "a3", title: "Voorbereiding Jongerendienst", date: "2026-05-14", time: "19:30", duration: 120, type: "meeting", attendees: ["l1", "l2"] },
  { id: "a4", title: "Jongerendienst — Vrijheid", date: "2026-05-15", time: "19:30", duration: 150, type: "service", attendees: ["l1", "l2", "l3"] },
  { id: "a5", title: "Koffie met Tim", date: "2026-05-16", time: "11:00", duration: 60, type: "personal", attendees: ["l1"] },
  { id: "a6", title: "Bijbelstudie", date: "2026-05-19", time: "20:00", duration: 90, type: "service", attendees: ["l1", "l3"] },
  { id: "a7", title: "Bowling Avond", date: "2026-05-22", time: "19:00", duration: 210, type: "social", attendees: ["l1", "l2", "l3"] },
];

export const tasks: Task[] = [
  { id: "t1", title: "Preek voorbereiden — Vrijheid", description: "Romeinen 6-8 als basis, max 25 minuten", assigneeId: "l1", dueDate: "2026-05-14", priority: "high", status: "in_progress", category: "Jongerendienst" },
  { id: "t2", title: "Worship setlist maken", assigneeId: "l2", dueDate: "2026-05-13", priority: "high", status: "todo", category: "Jongerendienst" },
  { id: "t3", title: "Stoelen klaarzetten", assigneeId: "l3", dueDate: "2026-05-15", priority: "medium", status: "todo", category: "Jongerendienst" },
  { id: "t4", title: "Verjaardagskaart Eva", assigneeId: "l2", dueDate: "2026-05-11", priority: "low", status: "done", category: "Pastoraal" },
  { id: "t5", title: "Bowling reservering bevestigen", assigneeId: "l1", dueDate: "2026-05-18", priority: "medium", status: "todo", category: "Activiteit" },
  { id: "t6", title: "Maandbudget bijwerken", assigneeId: "l1", dueDate: "2026-05-20", priority: "low", status: "todo", category: "Administratie" },
  { id: "t7", title: "Flyer voor outreach ontwerpen", assigneeId: "l3", dueDate: "2026-05-25", priority: "medium", status: "in_progress", category: "Outreach" },
];

export const messages: Message[] = [
  {
    id: "m1",
    authorId: "l1",
    content: "Team, mooie meeting gisteren! Vergeet niet dat we vrijdag om 19:30 starten met de jongerendienst. Worship om 19:00 voor soundcheck.",
    createdAt: "2026-05-11T09:14:00",
    reactions: [{ emoji: "🙏", count: 3 }, { emoji: "🔥", count: 2 }],
    comments: 2,
    pinned: true,
  },
  {
    id: "m2",
    authorId: "l2",
    content: "Heb met Sara gepraat — moeilijke week voor haar gehad. Laten we extra om haar denken in onze gebeden deze week.",
    createdAt: "2026-05-10T20:43:00",
    reactions: [{ emoji: "🙏", count: 3 }, { emoji: "❤️", count: 2 }],
    comments: 1,
  },
  {
    id: "m3",
    authorId: "l3",
    content: "Mooie respons op de uitnodiging voor de outreach! 12 aanmeldingen al. We zoeken nog 2 mensen die kunnen helpen met materiaal.",
    createdAt: "2026-05-09T18:22:00",
    reactions: [{ emoji: "🙌", count: 2 }],
    comments: 3,
  },
  {
    id: "m4",
    authorId: "l1",
    content: "Quote van vanochtend in mijn stille tijd: \"Het Koninkrijk van God is niet alleen gepraat, maar kracht.\" 1 Kor 4:20. Laten we daarin blijven wandelen deze week 💪",
    createdAt: "2026-05-08T07:30:00",
    reactions: [{ emoji: "🔥", count: 4 }, { emoji: "🙏", count: 3 }, { emoji: "📖", count: 1 }],
    comments: 0,
  },
];

export function leaderById(id: string) {
  return leaders.find((l) => l.id === id) ?? currentUser;
}

export function youthById(id: string) {
  return youth.find((y) => y.id === id);
}

export type Verse = {
  text: string;
  reference: string;
};

export const verses: Verse[] = [
  { text: "Wees sterk en moedig. De HEER is met je, waar je ook gaat.", reference: "Jozua 1:9" },
  { text: "Ik vermag alle dingen in Hem die mij kracht geeft.", reference: "Filippenzen 4:13" },
  { text: "De HEER is mijn herder, het ontbreekt mij aan niets.", reference: "Psalm 23:1" },
  { text: "Geliefden, laten wij elkaar liefhebben, want de liefde is uit God.", reference: "1 Johannes 4:7" },
  { text: "Verheug u altijd in de Heer. Nogmaals zeg ik: Verheug u!", reference: "Filippenzen 4:4" },
  { text: "Werp al uw zorgen op Hem, want Hij zorgt voor u.", reference: "1 Petrus 5:7" },
  { text: "Want zo lief heeft God de wereld gehad, dat Hij Zijn eniggeboren Zoon gegeven heeft.", reference: "Johannes 3:16" },
];

export function verseOfTheDay(date = new Date()): Verse {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return verses[dayOfYear % verses.length];
}
