"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, MapPin, QrCode, Ticket, Users } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewEventButton } from "@/components/forms/new-event-form";
import { listEvents, type ChurchEvent } from "@/lib/events";

const typeLabel: Record<string, string> = {
  service: "Jeugdavond",
  social: "Sociaal",
  study: "Bijbelstudie",
  outreach: "Outreach",
};

export default function EventsPage() {
  const [items, setItems] = useState<ChurchEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listEvents();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Kon data niet laden: ${err.message}`
          : "Kon data niet laden."
      );
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = items === null;
  const now = Date.now();
  const upcoming = items?.filter((e) => new Date(e.date).getTime() >= now - 86_400_000) ?? [];
  const past = items?.filter((e) => new Date(e.date).getTime() < now - 86_400_000) ?? [];

  return (
    <>
      <Topbar title="Events" subtitle="Jongerendiensten en activiteiten — met QR aanmelden" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {loading ? "Laden…" : `${upcoming.length} ${upcoming.length === 1 ? "aankomend event" : "aankomende events"}`}
          </p>
          <NewEventButton onCreated={load} />
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Events laden…</p>
          </div>
        )}

        {!loading && upcoming.length === 0 && past.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">Nog geen events</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                Maak je eerste event aan. Jongeren kunnen zich aanmelden via een QR-code.
              </p>
              <div className="mt-5">
                <NewEventButton onCreated={load} />
              </div>
            </CardContent>
          </Card>
        )}

        {upcoming.length > 0 && (
          <>
            {past.length > 0 && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Aankomend
              </h2>
            )}
            <div className="grid md:grid-cols-2 gap-5">
              {upcoming.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              Geweest
            </h2>
            <div className="grid md:grid-cols-2 gap-5 opacity-75">
              {past.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function EventCard({ ev }: { ev: ChurchEvent }) {
  const date = new Date(ev.date);
  const pct = ev.capacity > 0 ? (ev.signups / ev.capacity) * 100 : 0;
  return (
    <Card className="overflow-hidden group">
      <div
        className="h-40 relative"
        style={
          ev.coverImage
            ? undefined
            : {
                backgroundColor: ev.cover,
                backgroundImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)",
              }
        }
      >
        {ev.coverImage && (
          <Image
            src={ev.coverImage}
            alt={ev.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
        {!ev.coverImage && (
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="muted" className="bg-white/20 backdrop-blur text-white border-0">
            {typeLabel[ev.type] ?? ev.type}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 text-white drop-shadow">
          <div className="text-[10px] uppercase tracking-wider opacity-90">
            {date.toLocaleDateString("nl-NL", { weekday: "long" })}
          </div>
          <div className="text-2xl font-semibold leading-tight">
            {date.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
          </div>
          <div className="text-sm opacity-95 mt-0.5">
            {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} uur
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{ev.title}</h3>
          {ev.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {ev.location}
            </div>
          )}
        </div>

        {ev.description && (
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
            {ev.description}
          </p>
        )}

        {ev.capacity > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Aanmeldingen
              </span>
              <span className="font-medium">
                {ev.signups} / {ev.capacity}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link href={`/events/${ev.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/events/${ev.id}`}>
            <Button size="sm">
              <QrCode className="h-3.5 w-3.5" />
              QR
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
