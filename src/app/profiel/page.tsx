"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Camera, Check, ImagePlus, Lock, X } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { changePassword, updateAvatar, uploadAvatar } from "@/lib/users";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ProfielPage() {
  const currentUser = useCurrentUser();
  const { update: refreshSession } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUser.image);

  // Password form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Avatar state
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadAvatar(fd);
      if (res.ok && res.url) {
        setAvatarUrl(res.url);
        await refreshSession();
      } else if (!res.ok) {
        setAvatarError(res.error);
      }
    } catch (err) {
      console.error(err);
      setAvatarError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!confirm("Profielfoto verwijderen?")) return;
    const res = await updateAvatar(null);
    if (res.ok) {
      setAvatarUrl(null);
      await refreshSession();
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (newPw !== newPw2) {
      setPwError("Nieuwe wachtwoorden komen niet overeen.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Nieuw wachtwoord moet minstens 8 tekens zijn.");
      return;
    }
    setPwSubmitting(true);
    try {
      const res = await changePassword(currentPw, newPw);
      if (res.ok) {
        setPwSuccess(true);
        setCurrentPw("");
        setNewPw("");
        setNewPw2("");
      } else {
        setPwError(res.error);
      }
    } catch (err) {
      console.error(err);
      setPwError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Mijn profiel" subtitle="Naam, foto en wachtwoord" />
      <div className="p-4 lg:p-8 space-y-5 max-w-3xl w-full mx-auto">
        <Link href="/meer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Terug naar Meer
        </Link>

        {/* Header card */}
        <Card className="overflow-hidden">
          <div className="bg-hero-gradient h-24 relative">
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
          </div>
          <div className="px-5 pb-5 -mt-12 flex items-end gap-4">
            <div className="relative">
              {avatarUrl ? (
                <div className="relative h-20 w-20 rounded-full ring-4 ring-card overflow-hidden bg-muted">
                  <Image src={avatarUrl} alt={currentUser.name} fill sizes="80px" className="object-cover" />
                </div>
              ) : (
                <div className="ring-4 ring-card rounded-full">
                  <Avatar name={currentUser.name} color={currentUser.color} size={80} />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-md ring-2 ring-card hover:bg-primary/90 transition-colors"
                aria-label="Foto wijzigen"
              >
                {uploading ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="font-semibold tracking-tight text-lg truncate">
                {currentUser.name || "…"}
              </div>
              <div className="text-sm text-muted-foreground">{currentUser.role}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</div>
            </div>
          </div>
          {avatarError && (
            <div className="mx-5 mb-5 rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3">
              {avatarError}
            </div>
          )}
          {avatarUrl && (
            <div className="px-5 pb-5 -mt-2">
              <button
                onClick={handleRemoveAvatar}
                className="text-xs text-muted-foreground hover:text-danger transition-colors inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Foto verwijderen (terug naar initialen)
              </button>
            </div>
          )}
        </Card>

        {/* Password change */}
        <Card>
          <div className="px-5 pt-5">
            <h3 className="font-semibold tracking-tight flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Wachtwoord wijzigen
            </h3>
            <p className="text-sm text-muted-foreground">
              Kies een sterk wachtwoord — min. 8 tekens
            </p>
          </div>
          <CardContent className="pt-3">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPw" required>
                  Huidig wachtwoord
                </Label>
                <Input
                  id="currentPw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPw" required>
                  Nieuw wachtwoord
                </Label>
                <Input
                  id="newPw"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="newPw2" required>
                  Herhaal nieuw wachtwoord
                </Label>
                <Input
                  id="newPw2"
                  type="password"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              {pwError && (
                <div className="rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm p-3 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Wachtwoord bijgewerkt.
                </div>
              )}

              <Button type="submit" disabled={pwSubmitting}>
                {pwSubmitting ? "Bezig…" : "Wachtwoord wijzigen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
