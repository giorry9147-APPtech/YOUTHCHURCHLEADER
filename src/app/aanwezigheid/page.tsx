"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  ChevronRight,
  Loader2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  attendanceStats,
  listEventAttendance,
  type JongereAttendanceStat,
} from "@/lib/attendance";

type EventListItem = Awaited<ReturnType<typeof listEventAttendance>>[number];

export default function AanwezigheidPage() {
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const [stats, setStats] = useState<JongereAttendanceStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [ev, st] = await Promise.all([listEventAttendance(), attendanceStats(5)]);
      setEvents(ev);
      setStats(st);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon data niet laden.");
      setEvents([]);
      setStats([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = events === null || stats === null;
  const totalEvents = stats?.[0]?.totalEvents ?? 0;
  const sortedStats = [...(stats ?? [])].sort((a, b) => {
    if (b.attended !== a.attended) return b.attended - a.attended;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Topbar
        title="Aanwezigheid"
        subtitle="Track record per event en per jongere"
      />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Aanwezigheid laden…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Per-youth track record */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Track record per jongere
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {totalEvents > 0
                      ? `Laatste ${totalEvents} ${totalEvents === 1 ? "event" : "events"}`
                      : "Nog geen events geweest"}
                  </p>
                </div>
                <Link
                  href="/sheets"
                  className="text-sm font-medium text-primary inline-flex items-center gap-0.5 hover:gap-1.5 transition-all"
                >
                  Jongeren
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <CardContent className="pt-3">
                {sortedStats.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nog geen jongeren toegevoegd.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {sortedStats.map((s) => {
                      const pct = totalEvents > 0 ? (s.attended / totalEvents) * 100 : 0;
                      return (
                        <Link
                          key={s.jongereId}
                          href={`/sheets/${s.jongereId}`}
                          className="flex items-center gap-4 py-3 hover:bg-muted/40 transition-colors -mx-1 px-1 rounded-lg"
                        >
                          <Avatar name={s.name} color={s.avatar} size={40} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1.5 w-full max-w-[200px] rounded-full bg-muted overflow-hidden">
                                <div
                                  className={
                                    pct >= 80
                                      ? "h-full bg-green-500"
                                      : pct >= 50
                                      ? "h-full bg-primary"
                                      : pct > 0
                                      ? "h-full bg-warning"
                                      : "h-full bg-border-strong"
                                  }
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(pct)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-semibold tabular-nums">
                              {s.attended}
                              <span className="text-muted-foreground">/{totalEvents}</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">
                              afgelopen diensten
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past events with attendance counts */}
            <Card>
              <div className="px-5 pt-5">
                <h3 className="font-semibold tracking-tight flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Afgelopen events
                </h3>
                <p className="text-sm text-muted-foreground">
                  Klik op een event om aanwezigheid bij te werken
                </p>
              </div>
              <CardContent className="pt-3">
                {events!.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nog geen afgelopen events.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events!.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/events/${ev.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-border p-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0">
                          {ev.coverImage ? (
                            <Image
                              src={ev.coverImage}
                              alt={ev.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{
                                backgroundColor: ev.cover,
                                backgroundImage:
                                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)",
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">{ev.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ev.date).toLocaleDateString("nl-NL", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="muted">
                            <UserCheck className="h-3 w-3 mr-1 text-primary" />
                            {ev.attended} aanwezig
                          </Badge>
                          {ev.signups > 0 && (
                            <Badge variant="muted">
                              <Users className="h-3 w-3 mr-1" />
                              {ev.signups}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
