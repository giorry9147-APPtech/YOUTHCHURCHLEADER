import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock,
  Heart,
  HeartHandshake,
  Lock,
  MessageSquarePlus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { leaderById, youthById, youth } from "@/lib/mock-data";

export function generateStaticParams() {
  return youth.map((y) => ({ id: y.id }));
}

export default async function SheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const y = youthById(id);
  if (!y) notFound();

  const conversations = [...y.conversations].sort((a, b) => b.date.localeCompare(a.date));
  const active = y.prayerPoints.filter((p) => p.status === "active");
  const ongoing = y.prayerPoints.filter((p) => p.status === "ongoing");
  const answered = y.prayerPoints.filter((p) => p.status === "answered");

  const moodColor: Record<string, string> = {
    great: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    neutral: "bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300",
    concerned: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  };
  const moodLabel: Record<string, string> = {
    great: "Goed gesprek",
    good: "Positief",
    neutral: "Neutraal",
    concerned: "Aandacht nodig",
  };

  return (
    <>
      <Topbar title={`Sheet — ${y.name}`} subtitle="Pastorale zorg" />
      <div className="p-4 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
        <Link href="/sheets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Terug naar sheets
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <Avatar name={y.name} color={y.avatar} size={80} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-semibold tracking-tight">{y.name}</h2>
                  <Badge variant="muted" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Privé
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {y.age} jaar · Geboren {new Date(y.birthday).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} · In de groep sinds {new Date(y.joinedAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {y.tags.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline">
                  <CalendarPlus className="h-4 w-4" />
                  Plan gesprek
                </Button>
                <Button>
                  <MessageSquarePlus className="h-4 w-4" />
                  Nieuw gesprek
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Struggles */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Waar worstelt {y.name.split(" ")[0]} mee?</h3>
                  <p className="text-sm text-muted-foreground">De thema's van haar leven, nu</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Toevoegen
                </Button>
              </div>
              <CardContent className="pt-3 space-y-2">
                {y.struggles.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-subtle p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft shrink-0">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed pt-0.5">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conversations timeline */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Gesprekken</h3>
                  <p className="text-sm text-muted-foreground">{y.conversationCount} gesprekken bewaard</p>
                </div>
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Nieuw gesprek
                </Button>
              </div>
              <CardContent className="pt-3">
                <div className="relative pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" aria-hidden />
                  <div className="space-y-5">
                    {conversations.map((c) => {
                      const lead = leaderById(c.leaderId);
                      return (
                        <div key={c.id} className="relative">
                          <div className="absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-sm font-medium">
                              {new Date(c.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-medium ${moodColor[c.mood]}`}>
                              {moodLabel[c.mood]}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">{c.summary}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Avatar name={lead.name} color={lead.color} size={20} />
                            <span>door {lead.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: prayer points + meta */}
          <div className="space-y-6">
            {/* Prayer points */}
            <Card className="bg-hero-gradient text-white border-0 overflow-hidden relative shadow-lg shadow-primary/20">
              <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
              <CardContent className="relative p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight">Gebedspunten</div>
                    <div className="text-xs text-white/70">{y.prayerPoints.length} totaal</div>
                  </div>
                </div>

                {active.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-semibold">Actief</div>
                    <div className="space-y-2">
                      {active.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
                          <p className="text-sm leading-snug">{p.text}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/70">
                            <Clock className="h-3 w-3" />
                            sinds {new Date(p.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ongoing.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-semibold">Doorlopend</div>
                    <div className="space-y-2">
                      {ongoing.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
                          <p className="text-sm leading-snug">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {answered.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Verhoord
                    </div>
                    <div className="space-y-2">
                      {answered.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white/10 border border-white/15 p-3.5 opacity-80">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-green-300 shrink-0" />
                            <p className="text-sm leading-snug line-through decoration-white/40">{p.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90">
                  <Plus className="h-3.5 w-3.5" />
                  Nieuw gebedspunt
                </Button>
              </CardContent>
            </Card>

            {/* Next steps suggestion */}
            <Card className="border-primary/30 bg-primary-soft/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Volgende stap</span>
                </div>
                <p className="text-sm leading-relaxed">
                  Plan binnen 2 weken een vervolg-gesprek over {y.tags[0]}.
                  Vraag specifiek hoe het met haar gebedspunten gaat.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Reminder instellen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
