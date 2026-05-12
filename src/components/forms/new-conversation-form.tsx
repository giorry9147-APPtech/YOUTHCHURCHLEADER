"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createConversation, type Mood } from "@/lib/jongeren";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: "great", label: "Goed gesprek", emoji: "🔥" },
  { value: "good", label: "Positief", emoji: "🙏" },
  { value: "neutral", label: "Neutraal", emoji: "💭" },
  { value: "concerned", label: "Aandacht nodig", emoji: "⚠️" },
];

export function NewConversationButton({
  jongereId,
  onCreated,
  size = "md",
}: {
  jongereId: string;
  onCreated?: () => void;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("good");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;
    const summary = (fd.get("summary") as string)?.trim();

    if (!date || !summary) {
      setError("Vul een datum en samenvatting in.");
      setSubmitting(false);
      return;
    }

    try {
      await createConversation(jongereId, {
        date,
        summary,
        mood,
        leaderId: currentUser.id,
      });
      setOpen(false);
      setMood("good");
      onCreated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Kon niet opslaan: ${err.message}`
          : "Er ging iets mis bij het opslaan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size}>
          <MessageSquarePlus className="h-4 w-4" />
          Nieuw gesprek
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gesprek loggen</DialogTitle>
          <DialogDescription>
            Bewaar een samenvatting van het gesprek voor later. Anderen leiders kunnen dit ook lezen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" required>
              Datum van gesprek
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div>
            <Label htmlFor="mood">Hoe ging het?</Label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                    mood === m.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="summary" required>
              Samenvatting
            </Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="Wat is er besproken? Wat valt je op? Hoe gaat het?"
              className="min-h-[120px]"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Annuleren
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Bezig…" : "Gesprek opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
