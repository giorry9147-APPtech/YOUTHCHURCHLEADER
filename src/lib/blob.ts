"use server";

import { put } from "@vercel/blob";

/**
 * Upload an event cover image to Vercel Blob.
 * Called from client via Server Action.
 */
export async function uploadEventCover(formData: FormData): Promise<string> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Geen bestand ontvangen.");
  }
  if (file.size === 0) {
    throw new Error("Bestand is leeg.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Bestand is te groot (max 8 MB).");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Alleen afbeeldingen toegestaan.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40);
  const pathname = `events/${Date.now()}-${safeName}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return blob.url;
}
