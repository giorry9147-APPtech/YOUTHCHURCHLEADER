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
import { createTask, type Priority } from "@/lib/tasks";
import { leaders, currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Laag" },
  { value: "medium", label: "Normaal" },
  { value: "high", label: "Hoog" },
];

export function NewTaskButton({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const description = (fd.get("description") as string)?.trim();
    const assigneeId = fd.get("assigneeId") as string;
    const dueDate = fd.get("dueDate") as string;
    const category = (fd.get("category") as string)?.trim();

    if (!title) {
      setError("Vul een titel in.");
      setSubmitting(false);
      return;
    }
    if (!dueDate) {
      setError("Geef een deadline op.");
      setSubmitting(false);
      return;
    }

    try {
      await createTask({
        title,
        description,
        assigneeId: assigneeId || currentUser.id,
        dueDate,
        priority,
        category,
      });
      setOpen(false);
      setPriority("medium");
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
        <Button>
          <Plus className="h-4 w-4" />
          Nieuwe taak
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe taak aanmaken</DialogTitle>
          <DialogDescription>
            Wijs een taak toe aan jou of een collega-leider met een deadline.
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
              placeholder="Bv. Preek voorbereiden — Vrijheid"
              autoFocus
              required
            />
          </div>

          <div>
            <Label htmlFor="description" hint="optioneel">
              Toelichting
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Extra info over de taak"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="assigneeId">Wie</Label>
              <Select id="assigneeId" name="assigneeId" defaultValue={currentUser.id}>
                {leaders.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate" required>
                Deadline
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Prioriteit</Label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    priority === p.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="category" hint="optioneel">
              Categorie
            </Label>
            <Input
              id="category"
              name="category"
              placeholder="Bv. Jongerendienst, Outreach, Administratie"
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
              {submitting ? "Bezig…" : "Taak aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
