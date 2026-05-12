import Link from "next/link";
import { ArrowRight, MapPin, Plus, QrCode, Users } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { events } from "@/lib/mock-data";

const typeLabel: Record<string, string> = {
  service: "Dienst",
  social: "Sociaal",
  study: "Studie",
  outreach: "Outreach",
};

export default function EventsPage() {
  return (
    <>
      <Topbar title="Events" subtitle="Jongerendiensten en activiteiten — met QR aanmelden" />
      <div className="p-4 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{events.length} aankomende events</p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            Nieuw event
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {events.map((ev) => {
            const date = new Date(ev.date);
            const pct = (ev.signups / ev.capacity) * 100;
            return (
              <Card key={ev.id} className="overflow-hidden group">
                <div
                  className="h-40 relative"
                  style={{
                    backgroundColor: ev.cover,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="muted" className="bg-white/15 backdrop-blur text-white border-0">
                      {typeLabel[ev.type]}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      {date.toLocaleDateString("nl-NL", { weekday: "long" })}
                    </div>
                    <div className="text-2xl font-semibold leading-tight">
                      {date.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
                    </div>
                    <div className="text-sm opacity-90 mt-0.5">
                      {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} uur
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{ev.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {ev.location}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{ev.description}</p>

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
                      <div
                        className="h-full bg-foreground transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

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
          })}
        </div>
      </div>
    </>
  );
}
