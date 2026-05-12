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
import { Button } from "@/components/ui/button";
import { createJongere } from "@/lib/jongeren";

export function NewJongereButton({
  onCreated,
  variant = "primary",
  className,
}: {
  onCreated?: (id: string) => void;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string)?.trim();
    const birthday = fd.get("birthday") as string;
    const tagsRaw = (fd.get("tags") as string) ?? "";
    const struggleRaw = (fd.get("struggle") as string) ?? "";

    if (!name) {
      setError("Vul een naam in.");
      setSubmitting(false);
      return;
    }
    if (!birthday) {
      setError("Vul een geboortedatum in.");
      setSubmitting(false);
      return;
    }

    const age = computeAge(birthday);

    try {
      const id = await createJongere({
        name,
        age,
        birthday,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        struggles: struggleRaw.trim() ? [struggleRaw.trim()] : [],
      });
      setOpen(false);
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
        <Button
          variant={variant === "primary" ? "primary" : "secondary"}
          className={className}
        >
          <Plus className="h-4 w-4" />
          Nieuw profiel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe jongere toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een jongere toe aan je pastorale zorg. Alleen leiders kunnen dit profiel zien.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" required>
              Naam
            </Label>
            <Input id="name" name="name" placeholder="Bv. Ana de Boer" autoFocus required />
          </div>

          <div>
            <Label htmlFor="birthday" required>
              Geboortedatum
            </Label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div>
            <Label htmlFor="tags" hint="komma-gescheiden">
              Tags
            </Label>
            <Input id="tags" name="tags" placeholder="geloof, school, familie" />
          </div>

          <div>
            <Label htmlFor="struggle" hint="optioneel">
              Eerste worsteling
            </Label>
            <Textarea
              id="struggle"
              name="struggle"
              placeholder="Waar worstelt deze jongere mee? Je kunt later meer toevoegen."
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
              {submitting ? "Bezig met opslaan…" : "Profiel aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function computeAge(birthdayIso: string): number {
  const today = new Date();
  const b = new Date(birthdayIso);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return Math.max(0, age);
}
