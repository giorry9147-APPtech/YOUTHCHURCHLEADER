import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Gift,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { currentUser, leaders } from "@/lib/mock-data";

const sections: {
  title: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; hint?: string }[];
}[] = [
  {
    title: "Modules",
    items: [
      { href: "/berichten", label: "Berichten", icon: MessageSquare, hint: "Team feed" },
      { href: "/events", label: "Events", icon: Ticket, hint: "Diensten & activiteiten" },
      { href: "/verjaardagen", label: "Verjaardagen", icon: Gift, hint: "Niemand vergeten" },
    ],
  },
  {
    title: "Instellingen",
    items: [
      { href: "/meer/notificaties", label: "Meldingen", icon: Bell },
      { href: "/meer/privacy", label: "Privacy & toegang", icon: ShieldCheck },
      { href: "/meer/voorkeuren", label: "Voorkeuren", icon: Settings },
    ],
  },
];

export default function MeerPage() {
  return (
    <>
      <Topbar title="Meer" subtitle="Alle modules en instellingen" />
      <div className="p-4 lg:p-8 space-y-5 max-w-3xl w-full mx-auto">
        {/* Profile card */}
        <Card className="overflow-hidden">
          <div className="bg-hero-gradient h-20 relative">
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
          </div>
          <div className="px-5 pb-5 -mt-10 flex items-end gap-4">
            <div className="ring-4 ring-card rounded-full">
              <Avatar name={currentUser.name} color={currentUser.color} size={72} />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="font-semibold tracking-tight text-lg truncate">
                {currentUser.name}
              </div>
              <div className="text-sm text-muted-foreground">{currentUser.role}</div>
            </div>
          </div>
        </Card>

        {/* Team */}
        <Card>
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Jullie leiderschap
            </h3>
          </div>
          <div className="px-3 pb-3 space-y-1">
            {leaders.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50 transition-colors"
              >
                <Avatar name={l.name} color={l.color} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.role}</div>
                </div>
                {l.id === currentUser.id && (
                  <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                    Jij
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Sections */}
        {sections.map((sec) => (
          <div key={sec.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
              {sec.title}
            </h3>
            <Card>
              <ul className="divide-y divide-border">
                {sec.items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{it.label}</div>
                          {it.hint && (
                            <div className="text-xs text-muted-foreground">{it.hint}</div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        ))}

        {/* App info */}
        <Card>
          <div className="p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Rooted Youth</div>
              <div className="text-xs text-muted-foreground">Versie 0.1 · Preview</div>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <button className="w-full text-sm font-medium text-danger flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card hover:bg-danger-soft transition-colors">
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </>
  );
}
