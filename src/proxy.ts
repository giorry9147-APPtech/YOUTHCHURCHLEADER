import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [/^\/login$/, /^\/api\/auth\//];
const PUBLIC_PATH_PREFIXES = ["/_next/", "/favicon.ico"];

// Allow public access to event signup pages (QR scans from external phones)
const PUBLIC_REGEXES = [/^\/events\/[^/]+\/signup\/?$/];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return;
  if (PUBLIC_PATHS.some((re) => re.test(pathname))) return;
  if (PUBLIC_REGEXES.some((re) => re.test(pathname))) return;

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
