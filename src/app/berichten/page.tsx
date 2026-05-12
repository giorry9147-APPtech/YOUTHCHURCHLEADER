"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Pin, Send, Trash2 } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  createMessage,
  deleteMessage,
  listMessages,
  togglePinMessage,
  type Message,
} from "@/lib/messages";
import { currentUser, leaderById } from "@/lib/mock-data";

export default function BerichtenPage() {
  const [items, setItems] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pinNext, setPinNext] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await listMessages();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Kon berichten niet laden.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await createMessage({
        authorId: currentUser.id,
        content: text,
        pinned: pinNext,
      });
      setContent("");
      setPinNext(false);
      await load();
      textareaRef.current?.focus();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Bericht kon niet geplaatst worden.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePin(m: Message) {
    setItems(
      (prev) => prev?.map((x) => (x.id === m.id ? { ...x, pinned: !m.pinned } : x)) ?? null
    );
    try {
      await togglePinMessage(m.id, !m.pinned);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  async function handleDelete(m: Message) {
    if (!confirm("Bericht verwijderen?")) return;
    setItems((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
    try {
      await deleteMessage(m.id);
    } catch (err) {
      console.error(err);
      load();
    }
  }

  const loading = items === null;
  const pinned = items?.filter((m) => m.pinned) ?? [];
  const rest = items?.filter((m) => !m.pinned) ?? [];

  return (
    <>
      <Topbar title="Berichtenbord" subtitle="Voor het hele team — iedereen kan meelezen" />
      <div className="p-4 lg:p-8 space-y-5 max-w-3xl w-full mx-auto">
        {/* Composer */}
        <Card>
          <form onSubmit={handlePost}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar name={currentUser.name} color={currentUser.color} size={40} />
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Deel iets met het team…"
                  className="flex-1 min-h-[80px] rounded-xl border border-border bg-subtle p-3.5 text-sm leading-relaxed resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  disabled={submitting}
                />
              </div>
              <div className="flex items-center justify-between pl-[3.5rem]">
                <button
                  type="button"
                  onClick={() => setPinNext((v) => !v)}
                  className={
                    pinNext
                      ? "inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary px-3 py-1.5 text-xs font-semibold"
                      : "inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 text-xs font-medium transition-colors"
                  }
                >
                  <Pin className="h-3 w-3" />
                  Vastpinnen
                </button>
                <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? "Bezig…" : "Plaatsen"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft text-danger p-4 text-sm">
            <strong>Oeps:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm">Berichten laden…</p>
          </div>
        )}

        {!loading && items && items.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="text-center py-12 px-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight">Nog geen berichten</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                Plaats het eerste bericht hierboven. Het hele team kan meelezen.
              </p>
            </CardContent>
          </Card>
        )}

        {pinned.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <Pin className="h-3 w-3" /> Vastgepind
            </div>
            {pinned.map((m) => (
              <MessageCard
                key={m.id}
                m={m}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="space-y-3">
            {rest.map((m) => (
              <MessageCard
                key={m.id}
                m={m}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MessageCard({
  m,
  onTogglePin,
  onDelete,
}: {
  m: Message;
  onTogglePin: (m: Message) => void;
  onDelete: (m: Message) => void;
}) {
  const author = leaderById(m.authorId);
  const created = m.createdAt ? new Date(m.createdAt) : null;
  const isOwn = m.authorId === currentUser.id;

  return (
    <Card className={m.pinned ? "border-primary/30" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={author.name} color={author.color} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">{author.role}</span>
              {created && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    {created.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} ·{" "}
                    {created.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </>
              )}
              {m.pinned && <Badge variant="accent">Vastgepind</Badge>}
            </div>
            <p className="text-[15px] leading-relaxed mt-1.5 whitespace-pre-wrap">{m.content}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onTogglePin(m)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Pin className="h-3 w-3" />
                {m.pinned ? "Losmaken" : "Vastpinnen"}
              </button>
              {isOwn && (
                <button
                  onClick={() => onDelete(m)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Verwijderen
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
