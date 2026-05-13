"use client";

import { useSession } from "next-auth/react";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  image: string | null;
};

const FALLBACK: CurrentUser = {
  id: "l1",
  name: "",
  email: "",
  role: "leider",
  color: "#7c3aed",
  image: null,
};

/** Always returns a user-shaped object. While the session loads it returns
 *  a placeholder so components don't have to handle null everywhere. */
export function useCurrentUser(): CurrentUser {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) return FALLBACK;
  const u = session.user;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    role: u.role ?? "leider",
    color: u.color ?? "#7c3aed",
    image: u.image ?? null,
  };
}
