"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, CheckCircle2, Loader2, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo, Wordmark } from "@/components/logo";
import { getEvent, rsvpToEvent, type ChurchEvent } from "@/lib/events";

const typeLabel: Record<string, string> = {
  service: "Jeugdavond",
  social: "Sociaal",
  study: "Bijbelstudie",
  outreach: "Outreach",
};

export default function EventSignupPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [ev, setEv] = useState<ChurchEvent | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const e = await getEvent(id);
      setEv(e);
    } catch (err) {
      console.error(err);
      setEv(null);
      setError(err instanceof Error ? err.message : "Event niet gevonden");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !ev) return;
    setError(null);
    setSubmitting(true);
    try {
      await rsvpToEvent(ev.id, name.trim());
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Aanmelden mislukt");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Branded header */}
      <header className="px-4 lg:px-8 py-6 flex items-center gap-3 max-w-2xl mx-auto">
        <Logo size={40} />
        <div className="leading-tight">
          <Wordmark className="text-base" />
          <div className="text-xs text-muted-foreground mt-0.5">Aanmelden voor event</div>
        </div>
      </header>

      <main className="px-4 lg:px-8 pb-12 max-w-2xl mx-auto space-y-5">
        {ev === undefined && (
          <div className="flex flex-col items-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Event laden…</p>
          </div>
        )}

        {ev === null && (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="font-semibold tracking-tight text-lg">Event niet gevonden</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Deze link werkt niet meer of het event is verwijderd.
              </p>
            </CardContent>
          </Card>
        )}

        {ev && !done && (
          <>
            <Card className="overflow-hidden border-0 shadow-lg shadow-primary/10">
              <div
                className="h-40 relative"
                style={{
                  backgroundColor: ev.cover,
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                  <Badge variant="muted" className="bg-white/15 backdrop-blur text-white border-0">
                    {typeLabel[ev.type] ?? ev.type}
                  </Badge>
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{ev.title}</h1>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(ev.date).toLocaleDateString("nl-NL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  ·{" "}
                  {new Date(ev.date).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  uur
                </div>
                {ev.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {ev.location}
                  </div>
                )}
                {ev.description && (
                  <p className="text-sm text-foreground/80 leading-relaxed pt-1">
                    {ev.description}
                  </p>
                )}
                {ev.capacity > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {ev.signups} van {ev.capacity} plekken bezet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold tracking-tight text-lg">Meld je aan 🎉</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" required>
                      Je naam
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Voor- en achternaam"
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3">
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Bezig…" : "Aanmelden"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {done && (
          <Card className="bg-hero-gradient text-white border-0 overflow-hidden relative shadow-lg shadow-primary/20">
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
            <CardContent className="relative p-8 text-center space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Aangemeld, {name.split(" ")[0]}!
              </h2>
              <p className="text-white/85 leading-relaxed max-w-sm mx-auto">
                Tot {ev && new Date(ev.date).toLocaleDateString("nl-NL", { weekday: "long" })}. We
                kijken ernaar uit. <Sparkles className="inline h-4 w-4" />
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
