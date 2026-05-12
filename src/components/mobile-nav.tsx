"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardCheck, Home, Menu, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/taken", label: "Taken", icon: ClipboardCheck },
  { href: "/sheets", label: "Jongeren", icon: Users },
  { href: "/meer", label: "Meer", icon: Menu },
];

const moreRoutes = ["/meer", "/berichten", "/events", "/verjaardagen"];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          let active = false;
          if (it.href === "/") {
            active = pathname === "/";
          } else if (it.href === "/meer") {
            active = moreRoutes.some((r) => pathname.startsWith(r));
          } else {
            active = pathname.startsWith(it.href);
          }
          return (
            <li key={it.href} className="relative">
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-10 rounded-b-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={cn("text-[11px]", active ? "font-semibold" : "font-medium")}>
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
