"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Loader2,
  MapPin,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteEvent,
  getEvent,
  listEventSignups,
  type ChurchEvent,
} from "@/lib/events";
import { useRouter } from "next/navigation";

const typeLabel: Record<string, string> = {
  service: "Jeugdavond",
  social: "Sociaal",
  study: "Bijbelstudie",
  outreach: "Outreach",
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [ev, setEv] = useState<ChurchEvent | null | undefined>(undefined);
  const [signups, setSignups] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [e, s] = await Promise.all([getEvent(id), listEventSignups(id)]);
      setEv(e);
      setSignups(s);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Kon data niet laden: ${err.message}`
          : "Kon data niet laden."
      );
      setEv(null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (ev === undefined) {
    return (
      <>
        <Topbar title="Event" />
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm">Event wordt geladen…</p>
        </div>
      </>
    );
  }

  if (ev === null && !error) notFound();

  if (!ev) {
    return (
      <>
        <Topbar title="Event" />
        <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar events
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

  const date = new Date(ev.date);
  const signupUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${ev.id}/signup`
      : `https://youthchurchleader.vercel.app/events/${ev.id}/signup`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: ev?.title ?? "Event",
          text: `Meld je aan voor ${ev?.title ?? "het event"}`,
          url: signupUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      }
    } else {
      handleCopy();
    }
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit event wilt verwijderen?")) return;
    setDeleting(true);
    try {
      await deleteEvent(ev!.id);
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Verwijderen mislukt");
      setDeleting(false);
    }
  }

  return (
    <>
      <Topbar title={ev.title} subtitle={typeLabel[ev.type] ?? ev.type} />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar events
        </Link>

        <Card className="overflow-hidden border-0">
          <div
            className="h-48 md:h-64 relative"
            style={{
              backgroundColor: ev.cover,
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.40) 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <Badge variant="muted" className="bg-white/15 backdrop-blur text-white border-0">
                {typeLabel[ev.type] ?? ev.type}
              </Badge>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight max-w-2xl">
                {ev.title}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-90 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                  {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} uur
                </span>
                {ev.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {ev.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {ev.description && (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold tracking-tight">Over dit event</h3>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {ev.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Aanmeldingen</h3>
                  <p className="text-sm text-muted-foreground">
                    {ev.signups} {ev.signups === 1 ? "aanmelding" : "aanmeldingen"} via QR
                  </p>
                </div>
                <Badge variant="muted">
                  <Users className="h-3 w-3 mr-1" />
                  {ev.signups}/{ev.capacity}
                </Badge>
              </div>
              <CardContent className="pt-3">
                {signups.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-1 py-4">
                    Nog niemand aangemeld. Toon de QR-code op de jongerendienst.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {signups.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center text-primary text-sm font-semibold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{s.name}</div>
                        </div>
                        <Badge variant="success">Aangemeld</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="ghost" onClick={handleDelete} disabled={deleting} className="text-danger">
              <Trash2 className="h-4 w-4" />
              {deleting ? "Verwijderen…" : "Event verwijderen"}
            </Button>
          </div>

          <div className="space-y-5 lg:space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-semibold tracking-tight">QR-aanmelden</h3>
                  <p className="text-xs text-muted-foreground">
                    Laat scannen om zich aan te melden
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 flex justify-center border border-border">
                  <QRCodeSVG
                    value={signupUrl}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#1c1917"
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 text-xs font-mono break-all text-center text-muted-foreground">
                  {signupUrl}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Gekopieerd!" : "Kopieer"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-3.5 w-3.5" />
                    Deel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Statistieken
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capaciteit</span>
                  <span className="font-medium">{ev.capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aangemeld</span>
                  <span className="font-medium">{ev.signups}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plekken open</span>
                  <span className="font-medium">{Math.max(0, ev.capacity - ev.signups)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bezetting</span>
                  <span className="font-medium">
                    {ev.capacity > 0 ? Math.round((ev.signups / ev.capacity) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
