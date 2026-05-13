"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Plus, X } from "lucide-react";
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
import { uploadEventCover } from "@/lib/blob";
import { cn } from "@/lib/utils";

const typeOptions: { value: EventType; label: string; emoji: string }[] = [
  { value: "service", label: "Jeugdavond", emoji: "🔥" },
  { value: "study", label: "Bijbelstudie", emoji: "📖" },
  { value: "social", label: "Sociaal", emoji: "🎉" },
  { value: "outreach", label: "Outreach", emoji: "🌍" },
];

export function NewEventButton({
  onCreated,
}: {
  onCreated?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<EventType>("service");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("Bestand is te groot (max 8 MB).");
      return;
    }
    setError(null);

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const url = await uploadEventCover(fd);
      setCoverUrl(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload mislukt");
      setPreviewUrl(null);
      setCoverUrl(null);
    } finally {
      setUploading(false);
    }
  }

  function clearPhoto() {
    setPreviewUrl(null);
    setCoverUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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

    // Treat the date+time the user typed as their local timezone (Amsterdam).
    // new Date(...) parses naive ISO strings as local; .toISOString() converts to UTC.
    const startIso = new Date(`${date}T${time}:00`).toISOString();
    const endIso = endTime
      ? new Date(`${date}T${endTime}:00`).toISOString()
      : undefined;

    try {
      const id = await createEvent({
        title,
        date: startIso,
        endDate: endIso,
        location,
        description,
        capacity,
        type,
        coverImage: coverUrl ?? undefined,
      });
      setOpen(false);
      setType("service");
      setPreviewUrl(null);
      setCoverUrl(null);
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
        <Button>
          <Plus className="h-4 w-4" />
          Nieuw event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw event aanmaken</DialogTitle>
          <DialogDescription>
            Maak een jongerendienst, bijbelstudie, sociale avond of outreach.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div>
            <Label htmlFor="file">Cover foto</Label>
            {previewUrl ? (
              <div className="relative h-40 rounded-2xl overflow-hidden border border-border bg-muted">
                <Image src={previewUrl} alt="Cover preview" fill sizes="500px" className="object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium">
                    Bezig met uploaden…
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={uploading}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-foreground/70 text-white inline-flex items-center justify-center hover:bg-foreground transition-colors"
                  aria-label="Verwijder foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-border bg-subtle hover:border-primary hover:bg-primary-soft/30 transition-colors cursor-pointer text-center px-4"
              >
                <ImagePlus className="h-6 w-6 text-primary mb-1.5" />
                <span className="text-sm font-medium">Foto kiezen</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  JPG/PNG, max 8 MB — anders gradient placeholder
                </span>
              </label>
            )}
            <input
              ref={fileRef}
              id="file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileSelect}
            />
          </div>

          <div>
            <Label htmlFor="title" required>
              Titel
            </Label>
            <Input id="title" name="title" placeholder="Bv. Vrijdag Jeugdavond" required />
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
              <Button type="button" variant="ghost" disabled={submitting || uploading}>
                Annuleren
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? "Bezig…" : uploading ? "Wacht op upload…" : "Event aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
