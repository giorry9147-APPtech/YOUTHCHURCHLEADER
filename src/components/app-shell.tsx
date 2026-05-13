"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

const HIDE_NAV_PATTERNS = [/^\/login\/?$/, /^\/events\/[^/]+\/signup\/?$/];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATTERNS.some((re) => re.test(pathname));

  if (hideNav) {
    return <main className="min-h-full flex flex-col">{children}</main>;
  }

  return (
    <>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </>
  );
}
