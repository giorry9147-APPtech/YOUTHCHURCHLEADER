import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { compare } from "bcryptjs";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  color: string;
  avatar_url: string | null;
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const sql = neon(process.env.POSTGRES_URL!);
        const rows = (await sql`
          SELECT id, email, password_hash, name, role, color, avatar_url
          FROM users WHERE email = ${email} LIMIT 1
        `) as UserRow[];
        const user = rows[0];
        if (!user) return null;

        const ok = await compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          color: user.color,
          image: user.avatar_url,
        } as unknown as { id: string; email: string; name: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { id: string; role?: string; color?: string; image?: string | null };
        token.id = u.id;
        token.role = u.role ?? "leider";
        token.color = u.color ?? "#7c3aed";
        if (u.image) token.picture = u.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const su = session.user as typeof session.user & { id?: string; role?: string; color?: string };
        su.id = token.id as string;
        su.role = (token.role as string) ?? "leider";
        su.color = (token.color as string) ?? "#7c3aed";
      }
      return session;
    },
  },
});
