"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { agenda, leaderById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00–21:00

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay() || 7; // Sunday -> 7
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

const typeColor: Record<string, string> = {
  meeting: "#7c3aed",
  service: "#5b21b6",
  personal: "#a855f7",
  social: "#ec4899",
};

export default function AgendaPage() {
  const [cursor, setCursor] = useState(new Date("2026-05-12"));
  const weekStart = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekLabel = `${weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} – ${days[6].toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`;

  function shift(dx: number) {
    const d = new Date(cursor);
    d.setDate(d.getDate() + dx * 7);
    setCursor(d);
  }

  function eventsFor(d: Date) {
    const iso = d.toISOString().slice(0, 10);
    return agenda.filter((a) => a.date === iso);
  }

  return (
    <>
      <Topbar title="Agenda" subtitle="Plan en bekijk wat er op de planning staat" />
      <div className="p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => shift(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-medium"
              onClick={() => setCursor(new Date("2026-05-12"))}
            >
              Vandaag
            </Button>
            <Button variant="outline" size="icon" onClick={() => shift(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-base font-medium tracking-tight">{weekLabel}</div>
          <div className="sm:ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nieuwe planning
            </Button>
          </div>
        </div>

        {/* Quick planning suggestions */}
        <Card className="bg-accent-soft/40 border-accent/20">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Snelle planning:</span>
            {[
              "Jongerendienst — vrijdag 19:30",
              "Bijbelstudie — woensdag 20:00",
              "Leidersoverleg — maandag 20:00",
              "1-op-1 gesprek",
            ].map((tpl) => (
              <button
                key={tpl}
                className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium hover:border-foreground/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                {tpl}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Week grid */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border bg-subtle text-sm">
            <div />
            {days.map((d, i) => {
              const isToday = d.toDateString() === new Date("2026-05-12").toDateString();
              return (
                <div
                  key={i}
                  className={cn(
                    "px-2 py-3 text-center border-l border-border",
                    isToday && "bg-accent-soft/40"
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                  </div>
                  <div className={cn("text-lg font-semibold mt-0.5", isToday && "text-accent")}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[3rem_repeat(7,1fr)] relative">
            {/* Hour labels column */}
            <div className="border-r border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-16 text-[10px] text-muted-foreground pr-2 pt-1 text-right">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {/* Day columns */}
            {days.map((d, di) => (
              <div key={di} className="relative border-l border-border">
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-t border-border/60" />
                ))}
                {eventsFor(d).map((ev) => {
                  const [hh, mm] = ev.time.split(":").map(Number);
                  const top = ((hh + mm / 60) - HOURS[0]) * 64;
                  const height = (ev.duration / 60) * 64;
                  const lead = leaderById(ev.attendees[0]);
                  return (
                    <div
                      key={ev.id}
                      className="absolute left-1 right-1 rounded-lg p-2 text-[11px] leading-tight overflow-hidden text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        top,
                        height: Math.max(height, 36),
                        backgroundColor: typeColor[ev.type] ?? "#7c3aed",
                      }}
                    >
                      <div className="font-medium line-clamp-1">{ev.title}</div>
                      <div className="opacity-80">{ev.time}</div>
                      <div className="absolute bottom-1 right-1">
                        <Avatar name={lead.name} color={lead.color} size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming list */}
        <Card>
          <div className="px-5 pt-5">
            <h3 className="font-semibold tracking-tight">Komende afspraken</h3>
            <p className="text-sm text-muted-foreground">Volledige planning, deze week</p>
          </div>
          <CardContent className="pt-3 space-y-2">
            {agenda.map((item) => {
              const d = new Date(item.date);
              return (
                <div key={item.id} className="flex items-center gap-4 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                  <div className="w-14 shrink-0 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {d.toLocaleDateString("nl-NL", { month: "short" })}
                    </div>
                    <div className="text-lg font-semibold leading-tight">{d.getDate()}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("nl-NL", { weekday: "long" })} · {item.time} · {item.duration} min
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    {item.attendees.map((id) => {
                      const l = leaderById(id);
                      return <Avatar key={id} name={l.name} color={l.color} size={24} />;
                    })}
                  </div>
                  <Badge variant="muted">
                    {item.type === "service"
                      ? "Dienst"
                      : item.type === "personal"
                      ? "1-op-1"
                      : item.type === "social"
                      ? "Sociaal"
                      : "Meeting"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
