import { neon } from "@neondatabase/serverless";

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "POSTGRES_URL not set. Run `vercel env pull .env.local` or check Vercel project Neon integration."
  );
}

export const sql = neon(url);
