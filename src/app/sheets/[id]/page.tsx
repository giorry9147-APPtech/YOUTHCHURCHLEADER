"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  HeartHandshake,
  Loader2,
  Lock,
  Plus,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewConversationButton } from "@/components/forms/new-conversation-form";
import { NewPrayerButton } from "@/components/forms/new-prayer-form";
import {
  getJongere,
  listConversations,
  listPrayerPoints,
  updatePrayerStatus,
  type Conversation,
  type Jongere,
  type PrayerPoint,
} from "@/lib/jongeren";
import { leaderById } from "@/lib/mock-data";

const moodColor: Record<string, string> = {
  great: "bg-green-100 text-green-800",
  good: "bg-emerald-100 text-emerald-800",
  neutral: "bg-stone-100 text-stone-700",
  concerned: "bg-amber-100 text-amber-800",
};
const moodLabel: Record<string, string> = {
  great: "Goed gesprek",
  good: "Positief",
  neutral: "Neutraal",
  concerned: "Aandacht nodig",
};

export default function JongereDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [jongere, setJongere] = useState<Jongere | null | undefined>(undefined);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [prayerPoints, setPrayerPoints] = useState<PrayerPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [j, convs, prayers] = await Promise.all([
        getJongere(id),
        listConversations(id),
        listPrayerPoints(id),
      ]);
      setJongere(j);
      setConversations(convs);
      setPrayerPoints(prayers);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Kon data niet laden: ${err.message}`
          : "Kon data niet laden."
      );
      setJongere(null);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (jongere === undefined) {
    return (
      <>
        <Topbar title="Jongere" subtitle="Pastorale zorg" />
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm">Profiel wordt geladen…</p>
        </div>
      </>
    );
  }

  if (jongere === null && !error) {
    notFound();
  }

  if (!jongere) {
    return (
      <>
        <Topbar title="Jongere" subtitle="Pastorale zorg" />
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <Link
            href="/sheets"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Jongeren
          </Link>
          {error && (
            <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
              <strong>Oeps:</strong> {error}
            </div>
          )}
        </div>
      </>
    );
  }

  const y = jongere;
  const firstName = y.name.split(" ")[0];
  const active = prayerPoints.filter((p) => p.status === "active");
  const ongoing = prayerPoints.filter((p) => p.status === "ongoing");
  const answered = prayerPoints.filter((p) => p.status === "answered");

  async function markAnswered(prayerId: string) {
    try {
      await updatePrayerStatus(y.id, prayerId, "answered");
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Topbar title={`Sheet — ${y.name}`} subtitle="Pastorale zorg" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        <Link
          href="/sheets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar Jongeren
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="p-5 lg:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <Avatar name={y.name} color={y.avatar} size={72} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-semibold tracking-tight">{y.name}</h2>
                  <Badge variant="muted" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Privé
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {y.age} jaar
                  {y.birthday &&
                    ` · Geboren ${new Date(y.birthday).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`}
                  {y.joinedAt &&
                    ` · Sinds ${new Date(y.joinedAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}`}
                </div>
                {y.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {y.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <NewConversationButton jongereId={y.id} onCreated={loadAll} />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left: struggles + timeline */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {/* Struggles */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Waar worstelt {firstName} mee?</h3>
                  <p className="text-sm text-muted-foreground">De thema&apos;s van haar/zijn leven</p>
                </div>
              </div>
              <CardContent className="pt-3 space-y-2">
                {y.struggles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic px-1 py-2">
                    Nog geen worstelingen toegevoegd. Voeg er een toe via &ldquo;Profiel bewerken&rdquo; (binnenkort).
                  </p>
                ) : (
                  y.struggles.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-subtle p-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft shrink-0">
                        <Heart className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed pt-0.5">{s}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Conversations timeline */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Gesprekken</h3>
                  <p className="text-sm text-muted-foreground">
                    {conversations.length} {conversations.length === 1 ? "gesprek" : "gesprekken"} bewaard
                  </p>
                </div>
                <NewConversationButton jongereId={y.id} onCreated={loadAll} size="sm" />
              </div>
              <CardContent className="pt-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-sm text-muted-foreground">
                      Nog geen gesprekken gelogd. Klik &ldquo;Nieuw gesprek&rdquo; om je eerste te bewaren.
                    </p>
                  </div>
                ) : (
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
                              <span
                                className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-medium ${moodColor[c.mood]}`}
                              >
                                {moodLabel[c.mood]}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                              {c.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Avatar name={lead.name} color={lead.color} size={20} />
                              <span>door {lead.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: prayer points + meta */}
          <div className="space-y-5 lg:space-y-6">
            <Card className="bg-hero-gradient text-white border-0 overflow-hidden relative shadow-lg shadow-primary/20">
              <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
              <CardContent className="relative p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold tracking-tight">Gebedspunten</div>
                    <div className="text-xs text-white/70">
                      {prayerPoints.length} totaal · {active.length} actief
                    </div>
                  </div>
                </div>

                {prayerPoints.length === 0 && (
                  <p className="text-sm text-white/80 leading-relaxed">
                    Nog geen gebedspunten. Voeg het eerste toe — bewaar concrete punten om in gebed te brengen.
                  </p>
                )}

                {active.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-semibold">
                      Actief
                    </div>
                    <div className="space-y-2">
                      {active.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
                          <p className="text-sm leading-snug">{p.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                              <Clock className="h-3 w-3" />
                              {p.createdAt &&
                                new Date(p.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                            </div>
                            <button
                              onClick={() => markAnswered(p.id)}
                              className="text-[11px] font-semibold text-white/90 hover:text-white inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Verhoord
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ongoing.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-semibold">
                      Doorlopend
                    </div>
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

                <NewPrayerButton jongereId={y.id} onCreated={loadAll} className="w-full" />
              </CardContent>
            </Card>

            {/* Next steps suggestion */}
            {y.tags.length > 0 && (
              <Card className="border-primary/30 bg-primary-soft/50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Volgende stap</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    Plan binnen 2 weken een vervolg-gesprek over {y.tags[0]}.
                    Vraag specifiek hoe het met de gebedspunten gaat.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
