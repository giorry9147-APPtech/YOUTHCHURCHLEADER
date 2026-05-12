import { Bell, Cake, Gift, PartyPopper } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { youth } from "@/lib/mock-data";

const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

export default function VerjaardagenPage() {
  const today = new Date("2026-05-12");

  const withNext = youth.map((y) => {
    const [, m, d] = y.birthday.split("-").map(Number);
    const next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
    const turning = today.getFullYear() - new Date(y.birthday).getFullYear() + (next.getFullYear() > today.getFullYear() ? 1 : 0);
    return { y, next, days, turning };
  });

  const sorted = [...withNext].sort((a, b) => a.days - b.days);
  const thisWeek = sorted.filter((b) => b.days <= 7);

  // Group by month of "next"
  const byMonth = new Map<number, typeof withNext>();
  sorted.forEach((b) => {
    const m = b.next.getMonth();
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(b);
  });

  return (
    <>
      <Topbar title="Verjaardagen" subtitle="Niemand wordt vergeten — herinneringen via push" />
      <div className="p-4 md:p-8 space-y-6 max-w-5xl w-full mx-auto">
        {/* Notification settings card */}
        <Card className="bg-accent-soft/40 border-accent/30">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Automatische herinneringen actief</h3>
              <p className="text-sm text-foreground/80 mt-0.5">
                Je krijgt een push 7 dagen van tevoren en op de dag zelf. Aanpasbaar per persoon.
              </p>
            </div>
            <Button variant="outline" size="sm">Instellingen</Button>
          </CardContent>
        </Card>

        {/* Highlight: this week */}
        {thisWeek.length > 0 && (
          <Card>
            <div className="px-5 pt-5">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-accent" />
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
                    className="rounded-2xl border border-border bg-subtle p-5 flex items-center gap-4 hover:border-accent/40 transition-colors"
                  >
                    <Avatar name={y.name} color={y.avatar} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold tracking-tight">{y.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Wordt {turning} jaar
                      </div>
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

        {/* Year timeline by month */}
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
                        <div className="font-medium">{y.name}</div>
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
