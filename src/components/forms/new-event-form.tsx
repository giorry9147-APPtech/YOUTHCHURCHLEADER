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
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createEvent, type EventType } from "@/lib/events";
import { cn } from "@/lib/utils";

const typeOptions: { value: EventType; label: string; emoji: string }[] = [
  { value: "service", label: "Jeugdavond", emoji: "🔥" },
  { value: "study", label: "Bijbelstudie", emoji: "📖" },
  { value: "social", label: "Sociaal", emoji: "🎉" },
  { value: "outreach", label: "Outreach", emoji: "🌍" },
];

export function NewEventButton({
  onCreated,
  variant = "primary",
}: {
  onCreated?: (id: string) => void;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<EventType>("service");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const endTime = (fd.get("endTime") as string) || "";
    const location = (fd.get("location") as string)?.trim();
    const description = (fd.get("description") as string)?.trim();
    const capacityRaw = fd.get("capacity") as string;
    const capacity = parseInt(capacityRaw, 10);

    if (!title || !date || !time || !location) {
      setError("Vul titel, datum, tijd en locatie in.");
      setSubmitting(false);
      return;
    }
    if (!capacity || capacity < 1) {
      setError("Geef een geldige capaciteit op.");
      setSubmitting(false);
      return;
    }

    const startIso = `${date}T${time}:00`;
    const endIso = endTime ? `${date}T${endTime}:00` : undefined;

    try {
      const id = await createEvent({
        title,
        date: startIso,
        endDate: endIso,
        location,
        description,
        capacity,
        type,
      });
      setOpen(false);
      setType("service");
      onCreated?.(id);
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
        <Button variant={variant === "primary" ? "primary" : "secondary"}>
          <Plus className="h-4 w-4" />
          Nieuw event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw event aanmaken</DialogTitle>
          <DialogDescription>
            Maak een jongerendienst, bijbelstudie, sociale avond of outreach. Jongeren kunnen zich aanmelden via QR.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" required>
              Titel
            </Label>
            <Input id="title" name="title" placeholder="Bv. Vrijdag Jeugdavond" autoFocus required />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                    type === t.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 sm:col-span-1">
              <Label htmlFor="date" required>
                Datum
              </Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <Label htmlFor="time" required>
                Start
              </Label>
              <Input id="time" name="time" type="time" required defaultValue="19:30" />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <Label htmlFor="endTime">Eind</Label>
              <Input id="endTime" name="endTime" type="time" defaultValue="22:00" />
            </div>
          </div>

          <div>
            <Label htmlFor="location" required>
              Locatie
            </Label>
            <Input id="location" name="location" placeholder="De Hoeksteen, Hoofdzaal" required />
          </div>

          <div>
            <Label htmlFor="capacity" required>
              Capaciteit
            </Label>
            <Input id="capacity" name="capacity" type="number" min={1} defaultValue={40} required />
          </div>

          <div>
            <Label htmlFor="description" hint="optioneel">
              Beschrijving
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Wat staat er op het programma? Waar gaat het over?"
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
              {submitting ? "Bezig…" : "Event aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
