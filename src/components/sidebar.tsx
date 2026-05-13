"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  Gift,
  Home,
  MessageSquare,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Logo, Wordmark } from "@/components/logo";
import { currentUser } from "@/lib/mock-data";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/taken", label: "Taken", icon: ClipboardCheck },
  { href: "/sheets", label: "Jongeren", icon: Users, lock: true },
  { href: "/events", label: "Events", icon: Ticket },
  { href: "/aanwezigheid", label: "Aanwezigheid", icon: UserCheck },
  { href: "/berichten", label: "Berichten", icon: MessageSquare },
  { href: "/verjaardagen", label: "Verjaardagen", icon: Gift },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <Logo size={36} />
        <div className="leading-tight">
          <Wordmark className="text-base" />
          <div className="text-xs text-muted-foreground mt-0.5">Leiders Dashboard</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
              {item.lock && (
                <span
                  className={cn(
                    "ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold",
                    active ? "bg-primary/15 text-primary" : "bg-primary-soft text-primary"
                  )}
                >
                  Privé
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted transition-colors cursor-pointer">
          <Avatar name={currentUser.name} color={currentUser.color} size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground truncate">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
