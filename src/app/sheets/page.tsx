"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, HeartHandshake, Loader2, Lock, Search, Users } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { NewJongereButton } from "@/components/forms/new-jongere-form";
import { listJongeren, type Jongere } from "@/lib/jongeren";
import { formatRelativeDays } from "@/lib/utils";

export default function JongerenPage() {
  const [items, setItems] = useState<Jongere[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listJongeren();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Kon data niet laden: ${err.message}`
          : "Kon data niet laden. Check Firestore rules + env vars."
      );
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = items === null;
  const allTags = items ? Array.from(new Set(items.flatMap((j) => j.tags))) : [];
  const filtered = items?.filter((j) => !activeTag || j.tags.includes(activeTag)) ?? [];

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
                Deze profielen zijn alleen zichtbaar voor jou en je mede-leiders.
              </p>
            </div>
            <NewJongereButton
              onCreated={load}
              className="shrink-0 bg-white text-primary hover:bg-white/90"
            />
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {/* Filters */}
        {(loading || (items && items.length > 0)) && (
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center h-11 flex-1 rounded-full bg-card border border-border px-4 text-sm gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Zoek op naam, tag of gebedspunt…</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
              <button
                onClick={() => setActiveTag(null)}
                className={
                  activeTag === null
                    ? "inline-flex items-center rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap"
                    : "inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
                }
              >
                Alle ({items?.length ?? 0})
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t === activeTag ? null : t)}
                  className={
                    activeTag === t
                      ? "inline-flex items-center rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap"
                      : "inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Jongeren worden geladen…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && items && items.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">Nog geen jongeren toegevoegd</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                Begin met je eerste jongere. Per profiel kun je gesprekken loggen, gebedspunten bijhouden en groei volgen.
              </p>
              <div className="mt-5">
                <NewJongereButton onCreated={load} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((y) => {
              const lastConv = y.lastConversation ? new Date(y.lastConversation) : null;
              const daysSince = lastConv
                ? Math.round((Date.now() - lastConv.getTime()) / 86_400_000)
                : null;
              const stale = daysSince !== null && daysSince > 21;
              return (
                <Link key={y.id} href={`/sheets/${y.id}`} className="block group">
                  <Card className="hover:border-border-strong hover:shadow-md transition-all h-full">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={y.name} color={y.avatar} size={48} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold tracking-tight truncate">{y.name}</div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                          <div className="text-sm text-muted-foreground">{y.age} jaar</div>
                        </div>
                      </div>

                      {y.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {y.tags.map((t) => (
                            <Badge key={t} variant="muted" className="font-normal">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Laatste gesprek</span>
                          <span className={stale ? "text-primary font-semibold" : "font-medium"}>
                            {lastConv ? formatRelativeDays(lastConv) : "Nog geen"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Gesprekken</span>
                          <span className="font-medium">{y.conversationCount}</span>
                        </div>
                      </div>

                      {stale && (
                        <div className="text-xs rounded-lg bg-primary-soft text-primary px-3 py-2 font-semibold">
                          Plan binnenkort een gesprek
                        </div>
                      )}

                      {!lastConv && (
                        <div className="text-xs rounded-lg bg-primary-soft text-primary px-3 py-2 font-semibold inline-flex items-center gap-1.5">
                          <HeartHandshake className="h-3.5 w-3.5" />
                          Plan een eerste gesprek
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
