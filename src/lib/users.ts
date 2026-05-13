"use server";

import { compare, hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { auth } from "@/auth";

export type ProfileUpdateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Niet ingelogd." };

  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Vul huidig en nieuw wachtwoord in." };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: "Nieuw wachtwoord moet minstens 8 tekens zijn." };
  }

  const rows = (await sql`
    SELECT password_hash FROM users WHERE id = ${session.user.id} LIMIT 1
  `) as { password_hash: string }[];

  if (!rows[0]) return { ok: false, error: "Gebruiker niet gevonden." };

  const ok = await compare(currentPassword, rows[0].password_hash);
  if (!ok) return { ok: false, error: "Huidig wachtwoord klopt niet." };

  const newHash = await hash(newPassword, 12);
  await sql`
    UPDATE users SET password_hash = ${newHash}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;

  return { ok: true };
}

export async function updateAvatar(avatarUrl: string | null): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Niet ingelogd." };

  await sql`
    UPDATE users SET avatar_url = ${avatarUrl}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;
  return { ok: true };
}

export async function updateDisplayName(name: string): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Niet ingelogd." };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Naam te kort." };

  await sql`
    UPDATE users SET name = ${trimmed}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;
  return { ok: true };
}

/** Upload an avatar image to Vercel Blob and persist URL. */
export async function uploadAvatar(formData: FormData): Promise<ProfileUpdateResult & { url?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Niet ingelogd." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Geen bestand ontvangen." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Bestand te groot (max 4 MB)." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Alleen afbeeldingen toegestaan." };
  }

  const { put } = await import("@vercel/blob");
  const ext = (file.name.split(".").pop() ?? "jpg").slice(0, 4);
  const pathname = `avatars/${session.user.id}-${Date.now()}.${ext}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  await sql`
    UPDATE users SET avatar_url = ${blob.url}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;
  return { ok: true, url: blob.url };
}
