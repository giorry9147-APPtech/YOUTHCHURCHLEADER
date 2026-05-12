"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Loader2, Plus } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewAgendaButton, TEMPLATES } from "@/components/forms/new-agenda-form";
import { listAgenda, type AgendaItem } from "@/lib/agenda";
import { leaderById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay() || 7;
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

const typeLabel: Record<string, string> = {
  service: "Dienst",
  personal: "1-op-1",
  social: "Sociaal",
  meeting: "Meeting",
};

export default function AgendaPage() {
  const [cursor, setCursor] = useState(new Date());
  const [items, setItems] = useState<AgendaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listAgenda();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon agenda niet laden.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    if (!items) return [];
    const iso = d.toISOString().slice(0, 10);
    return items.filter((a) => a.date === iso);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = items
    ?.filter((a) => a.date >= todayIso)
    .slice(0, 8) ?? [];

  return (
    <>
      <Topbar title="Agenda" subtitle="Plan en bekijk wat er op de planning staat" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl w-full mx-auto">
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
              onClick={() => setCursor(new Date())}
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
            <NewAgendaButton onCreated={load} />
          </div>
        </div>

        {/* Quick planning templates */}
        <Card className="bg-primary-soft border-primary/20">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Snelle planning:</span>
            {TEMPLATES.map((tpl) => (
              <NewAgendaButton
                key={tpl.label}
                triggerLabel={tpl.label}
                template={{ type: tpl.type, time: tpl.time, duration: tpl.duration, title: tpl.title }}
                onCreated={load}
              />
            ))}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {/* Week grid */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-border bg-subtle text-sm">
            <div />
            {days.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={cn(
                    "px-2 py-3 text-center border-l border-border",
                    isToday && "bg-primary-soft"
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                  </div>
                  <div className={cn("text-lg font-semibold mt-0.5", isToday && "text-primary")}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[3rem_repeat(7,1fr)] relative overflow-x-auto">
            <div className="border-r border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-16 text-[10px] text-muted-foreground pr-2 pt-1 text-right">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {days.map((d, di) => (
              <div key={di} className="relative border-l border-border min-h-[896px]">
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-t border-border/60" />
                ))}
                {eventsFor(d).map((ev) => {
                  const [hh, mm] = ev.time.split(":").map(Number);
                  const top = ((hh + mm / 60) - HOURS[0]) * 64;
                  const height = (ev.duration / 60) * 64;
                  const lead = ev.attendees[0] ? leaderById(ev.attendees[0]) : null;
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
                      <div className="font-medium line-clamp-2">{ev.title}</div>
                      <div className="opacity-80">{ev.time}</div>
                      {lead && (
                        <div className="absolute bottom-1 right-1">
                          <Avatar name={lead.name} color={lead.color} size={18} />
                        </div>
                      )}
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
            <p className="text-sm text-muted-foreground">
              {items === null ? "Laden…" : `${upcoming.length} ${upcoming.length === 1 ? "afspraak" : "afspraken"}`}
            </p>
          </div>
          <CardContent className="pt-3 space-y-2">
            {items === null && (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <p className="text-sm">Agenda laden…</p>
              </div>
            )}

            {items && upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Geen afspraken gepland. Voeg er een toe met &ldquo;Nieuwe planning&rdquo;.
              </p>
            )}

            {upcoming.map((item) => {
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
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("nl-NL", { weekday: "long" })} · {item.time} · {item.duration} min
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center -space-x-2">
                    {item.attendees.map((id) => {
                      const l = leaderById(id);
                      return (
                        <div key={id} className="ring-2 ring-card rounded-full">
                          <Avatar name={l.name} color={l.color} size={24} />
                        </div>
                      );
                    })}
                  </div>
                  <Badge variant="muted">{typeLabel[item.type] ?? item.type}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
