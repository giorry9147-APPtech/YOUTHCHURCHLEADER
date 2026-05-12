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
import { Avatar } from "@/components/ui/avatar";
import { createAgendaItem, type AgendaType } from "@/lib/agenda";
import { leaders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeOptions: { value: AgendaType; label: string; emoji: string }[] = [
  { value: "meeting", label: "Meeting", emoji: "💬" },
  { value: "service", label: "Dienst", emoji: "🔥" },
  { value: "personal", label: "1-op-1", emoji: "🙏" },
  { value: "social", label: "Sociaal", emoji: "🎉" },
];

const TEMPLATES: { label: string; type: AgendaType; time: string; duration: number; title: string }[] = [
  { label: "Jongerendienst — vrijdag 19:30", type: "service", time: "19:30", duration: 150, title: "Jongerendienst" },
  { label: "Bijbelstudie — woensdag 20:00", type: "service", time: "20:00", duration: 90, title: "Bijbelstudie" },
  { label: "Leidersoverleg — maandag 20:00", type: "meeting", time: "20:00", duration: 90, title: "Leidersoverleg" },
  { label: "1-op-1 gesprek", type: "personal", time: "16:00", duration: 60, title: "1-op-1 gesprek" },
];

export function NewAgendaButton({
  onCreated,
  defaultDate,
  triggerLabel = "Nieuwe planning",
  template,
}: {
  onCreated?: () => void;
  defaultDate?: string;
  triggerLabel?: string;
  template?: { type: AgendaType; time: string; duration: number; title: string };
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<AgendaType>(template?.type ?? "meeting");
  const [attendees, setAttendees] = useState<Set<string>>(new Set());

  function toggleAttendee(id: string) {
    setAttendees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const durationRaw = fd.get("duration") as string;
    const location = (fd.get("location") as string)?.trim();
    const duration = parseInt(durationRaw, 10);

    if (!title || !date || !time) {
      setError("Vul titel, datum en tijd in.");
      setSubmitting(false);
      return;
    }
    if (!duration || duration < 5) {
      setError("Geef een geldige duur (min 5 minuten).");
      setSubmitting(false);
      return;
    }

    try {
      await createAgendaItem({
        title,
        date,
        time,
        duration,
        type,
        attendees: Array.from(attendees),
        location,
      });
      setOpen(false);
      setAttendees(new Set());
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
        <Button size="sm" variant={template ? "secondary" : "primary"}>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe planning</DialogTitle>
          <DialogDescription>
            Plan een meeting, dienst, 1-op-1 of activiteit. Kies wie er aanwezig is.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" required>
              Titel
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Bv. Leidersoverleg"
              defaultValue={template?.title ?? ""}
              autoFocus
              required
            />
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date" required>
                Datum
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultDate ?? new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div>
              <Label htmlFor="time" required>
                Tijd
              </Label>
              <Input id="time" name="time" type="time" defaultValue={template?.time ?? "20:00"} required />
            </div>
          </div>

          <div>
            <Label htmlFor="duration" required>
              Duur (minuten)
            </Label>
            <Select id="duration" name="duration" defaultValue={String(template?.duration ?? 60)}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
              <option value="150">150 min</option>
              <option value="180">180 min</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" hint="optioneel">
              Locatie
            </Label>
            <Input id="location" name="location" placeholder="Bv. Bovenzaal kerk" />
          </div>

          <div>
            <Label htmlFor="attendees" hint="meerdere mogelijk">
              Wie is erbij?
            </Label>
            <div className="space-y-1.5">
              {leaders.map((l) => {
                const checked = attendees.has(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleAttendee(l.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                      checked
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <Avatar name={l.name} color={l.color} size={28} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.role}</div>
                    </div>
                    <span
                      className={cn(
                        "h-5 w-5 rounded-md border-2 inline-flex items-center justify-center text-white text-[10px] font-bold",
                        checked ? "border-primary bg-primary" : "border-border-strong"
                      )}
                    >
                      {checked && "✓"}
                    </span>
                  </button>
                );
              })}
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
              {submitting ? "Bezig…" : "Plan toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { TEMPLATES };
