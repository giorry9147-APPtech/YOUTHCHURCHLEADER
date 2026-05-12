import Link from "next/link";
import { ChevronRight, Lock, Plus, Search } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { youth } from "@/lib/mock-data";
import { formatRelativeDays } from "@/lib/utils";

const allTags = Array.from(new Set(youth.flatMap((y) => y.tags)));

export default function SheetsPage() {
  return (
    <>
      <Topbar title="Jongeren" subtitle="Pastorale zorg — alleen zichtbaar voor leiders" />
      <div className="p-4 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl w-full mx-auto">
        {/* Privacy banner */}
        <Card className="bg-hero-gradient text-white border-0 overflow-hidden relative shadow-lg shadow-primary/20">
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
          <CardContent className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 lg:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold tracking-tight">Privé voor leiders</h3>
              <p className="text-sm text-white/85 mt-0.5">
                Deze profielen zijn alleen zichtbaar voor jou, Mirjam en Daniel.
              </p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 shrink-0">
              <Plus className="h-4 w-4" />
              Nieuw profiel
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center h-11 flex-1 rounded-full bg-card border border-border px-4 text-sm gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Zoek op naam, tag of gebedspunt…</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
            <button className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap">
              Alle ({youth.length})
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {youth.map((y) => {
            const lastConv = new Date(y.lastConversation);
            const daysSince = Math.round((new Date("2026-05-12").getTime() - lastConv.getTime()) / 86_400_000);
            const stale = daysSince > 21;
            return (
              <Link
                key={y.id}
                href={`/sheets/${y.id}`}
                className="block group"
              >
                <Card className="hover:border-border-strong hover:shadow-md transition-all h-full">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={y.name} color={y.avatar} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold tracking-tight">{y.name}</div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="text-sm text-muted-foreground">{y.age} jaar</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {y.tags.map((t) => (
                        <Badge key={t} variant="muted" className="font-normal">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Laatste gesprek</span>
                        <span className={stale ? "text-primary font-semibold" : "font-medium"}>
                          {formatRelativeDays(lastConv, new Date("2026-05-12"))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gesprekken</span>
                        <span className="font-medium">{y.conversationCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Open gebedspunten</span>
                        <span className="font-medium">
                          {y.prayerPoints.filter((p) => p.status !== "answered").length}
                        </span>
                      </div>
                    </div>

                    {stale && (
                      <div className="text-xs rounded-lg bg-primary-soft text-primary px-3 py-2 font-semibold">
                        Plan binnenkort een gesprek
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
