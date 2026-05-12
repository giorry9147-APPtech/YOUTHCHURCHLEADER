"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Calendar, Copy, Download, MapPin, Share2, Users } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { events, youth } from "@/lib/mock-data";

const typeLabel: Record<string, string> = {
  service: "Dienst",
  social: "Sociaal",
  study: "Studie",
  outreach: "Outreach",
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const ev = events.find((e) => e.id === params.id);
  if (!ev) notFound();

  const date = new Date(ev.date);
  const signupUrl = `https://jongerenleider.app/signup/${ev.id}`;
  // Pick some "signed up" attendees from youth as mock
  const attendees = youth.slice(0, Math.min(ev.signups, youth.length));

  return (
    <>
      <Topbar title={ev.title} subtitle={typeLabel[ev.type]} />
      <div className="p-4 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Terug naar events
        </Link>

        {/* Hero */}
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
            <div className="absolute bottom-6 left-6 text-white space-y-2">
              <Badge variant="muted" className="bg-white/15 backdrop-blur text-white border-0">
                {typeLabel[ev.type]}
              </Badge>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight max-w-2xl">
                {ev.title}
              </h2>
              <div className="flex items-center gap-4 text-sm opacity-90 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} · {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} uur
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {ev.location}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold tracking-tight">Over dit event</h3>
                <p className="text-foreground/90 leading-relaxed">{ev.description}</p>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h3 className="font-semibold tracking-tight">Aanmeldingen</h3>
                  <p className="text-sm text-muted-foreground">{ev.signups} mensen aangemeld via QR</p>
                </div>
                <Badge variant="muted">
                  <Users className="h-3 w-3 mr-1" />
                  {ev.signups}/{ev.capacity}
                </Badge>
              </div>
              <CardContent className="pt-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  {attendees.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
                      <Avatar name={a.name} color={a.avatar} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.age} jaar</div>
                      </div>
                      <Badge variant="success">Aangemeld</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: QR */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-semibold tracking-tight">QR-aanmelden</h3>
                  <p className="text-xs text-muted-foreground">
                    Toon deze QR op de jongerendienst — scannen en aanmelden
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
                  <Button variant="outline" size="sm">
                    <Copy className="h-3.5 w-3.5" />
                    Kopieer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3.5 w-3.5" />
                    Deel
                  </Button>
                </div>
                <Button className="w-full" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  Download als PDF
                </Button>
              </CardContent>
            </Card>

            {/* Quick stats */}
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
                  <span className="font-medium">{ev.capacity - ev.signups}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bezetting</span>
                  <span className="font-medium">{Math.round((ev.signups / ev.capacity) * 100)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
