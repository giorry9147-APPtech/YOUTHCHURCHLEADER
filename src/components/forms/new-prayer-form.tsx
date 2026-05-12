"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPrayerPoint, type PrayerStatus } from "@/lib/jongeren";
import { cn } from "@/lib/utils";

const statuses: { value: PrayerStatus; label: string; hint: string }[] = [
  { value: "active", label: "Actief", hint: "Aandacht nu" },
  { value: "ongoing", label: "Doorlopend", hint: "Langere termijn" },
];

export function NewPrayerButton({
  jongereId,
  onCreated,
  className,
}: {
  jongereId: string;
  onCreated?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PrayerStatus>("active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const text = (fd.get("text") as string)?.trim();
    if (!text) {
      setError("Vul een gebedspunt in.");
      setSubmitting(false);
      return;
    }

    try {
      await createPrayerPoint(jongereId, { text, status });
      setOpen(false);
      setStatus("active");
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
        <Button size="sm" className={cn("bg-white text-primary hover:bg-white/90", className)}>
          <Plus className="h-3.5 w-3.5" />
          Nieuw gebedspunt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw gebedspunt</DialogTitle>
          <DialogDescription>
            Een concreet punt om voor te bidden. Later kun je hem markeren als verhoord.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text" required>
              Gebedspunt
            </Label>
            <Textarea
              id="text"
              name="text"
              placeholder="Bv. Vrede in haar overgang naar de brugklas"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="status">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                    status === s.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div>{s.label}</div>
                  <div className="text-xs font-normal text-muted-foreground mt-0.5">{s.hint}</div>
                </button>
              ))}
            </div>
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
              {submitting ? "Bezig…" : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
