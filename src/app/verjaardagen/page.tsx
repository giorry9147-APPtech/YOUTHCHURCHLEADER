"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Cake, Gift, Loader2, PartyPopper } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { listJongeren, type Jongere } from "@/lib/jongeren";

const monthNames = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

type BirthdayInfo = {
  y: Jongere;
  next: Date;
  days: number;
  turning: number;
};

export default function VerjaardagenPage() {
  const [items, setItems] = useState<Jongere[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await listJongeren());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon data niet laden.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const computed: BirthdayInfo[] =
    items?.flatMap((y) => {
      if (!y.birthday) return [];
      const [, m, d] = y.birthday.split("-").map(Number);
      const next = new Date(today.getFullYear(), m - 1, d);
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
      const turning = next.getFullYear() - new Date(y.birthday).getFullYear();
      return [{ y, next, days, turning }];
    }) ?? [];

  const sorted = [...computed].sort((a, b) => a.days - b.days);
  const thisWeek = sorted.filter((b) => b.days <= 7);

  const byMonth = new Map<number, BirthdayInfo[]>();
  sorted.forEach((b) => {
    const m = b.next.getMonth();
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(b);
  });

  const loading = items === null;

  return (
    <>
      <Topbar title="Verjaardagen" subtitle="Niemand wordt vergeten" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-5xl w-full mx-auto">
        <Card className="bg-primary-soft border-primary/30">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Verjaardagen volgen jongeren-data</h3>
              <p className="text-sm text-foreground/80 mt-0.5">
                Iedereen die je toevoegt op de Jongeren pagina verschijnt automatisch hier op zijn/haar verjaardag.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Instellingen
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Verjaardagen laden…</p>
          </div>
        )}

        {!loading && computed.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                <Cake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">Nog geen jongeren</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                Voeg jongeren toe op de Jongeren pagina. Hun verjaardagen verschijnen hier automatisch.
              </p>
            </CardContent>
          </Card>
        )}

        {thisWeek.length > 0 && (
          <Card>
            <div className="px-5 pt-5">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-primary" />
                Deze week jarig
              </h3>
              <p className="text-sm text-muted-foreground">
                {thisWeek.length} {thisWeek.length === 1 ? "jongere" : "jongeren"}
              </p>
            </div>
            <CardContent className="pt-3">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {thisWeek.map(({ y, days, turning, next }) => (
                  <div
                    key={y.id}
                    className="rounded-2xl border border-border bg-subtle p-5 flex items-center gap-4 hover:border-primary/40 transition-colors"
                  >
                    <Avatar name={y.name} color={y.avatar} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold tracking-tight truncate">{y.name}</div>
                      <div className="text-sm text-muted-foreground">Wordt {turning} jaar</div>
                      <div className="text-xs mt-1.5">
                        <Badge variant={days === 0 ? "accent" : "muted"}>
                          {days === 0
                            ? "Vandaag!"
                            : days === 1
                            ? "Morgen"
                            : `${next.toLocaleDateString("nl-NL", { weekday: "long" })} (${days} dgn)`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {Array.from(byMonth.entries()).map(([m, list]) => (
            <div key={m}>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {monthNames[m]}
                </h3>
                <span className="text-xs text-muted-foreground">{list.length} jarig</span>
              </div>
              <Card>
                <CardContent className="p-2">
                  {list.map(({ y, next, days, turning }) => (
                    <div
                      key={y.id}
                      className="flex items-center gap-4 rounded-xl p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-14 shrink-0 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {next.toLocaleDateString("nl-NL", { weekday: "short" })}
                        </div>
                        <div className="text-xl font-semibold leading-tight">{next.getDate()}</div>
                      </div>
                      <Avatar name={y.name} color={y.avatar} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{y.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Cake className="h-3 w-3" />
                          Wordt {turning} jaar
                        </div>
                      </div>
                      <Badge variant={days <= 7 ? "accent" : "muted"}>
                        {days === 0 ? "Vandaag!" : days === 1 ? "Morgen" : `${days} dgn`}
                      </Badge>
                      <Button variant="ghost" size="icon" aria-label="Stuur bericht">
                        <Gift className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
