"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo, Wordmark } from "@/components/logo";
import { verseOfTheDay } from "@/lib/mock-data";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoginShell>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </LoginShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background flex items-center justify-center">{children}</div>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const verse = verseOfTheDay(new Date());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Vul email en wachtwoord in.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email of wachtwoord klopt niet.");
        setSubmitting(false);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Inloggen mislukt.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* TOP on mobile / LEFT on desktop: gradient hero panel */}
      <aside className="bg-hero-gradient text-white relative overflow-hidden flex flex-col w-full px-6 pt-8 pb-20 lg:flex-1 lg:p-12 lg:pb-12 lg:min-h-screen">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        {/* Big floating cross silhouette */}
        <svg
          className="hidden lg:block absolute right-[-3rem] top-1/2 -translate-y-1/2 h-[120%] opacity-[0.06] pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            d="M45 15 L55 15 L55 45 L85 45 L85 55 L55 55 L55 95 L45 95 L45 55 L15 55 L15 45 L45 45 Z"
            fill="white"
          />
        </svg>

        {/* Floating purple orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

        {/* Branding (top) */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Logo size={28} withRing={false} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">
              Leaders in <span className="text-white/80">Purpose</span>
            </div>
            <div className="text-xs text-white/70 mt-0.5">Leiders Dashboard</div>
          </div>
        </div>

        {/* Center content (desktop only — pushed to middle) */}
        <div className="hidden lg:flex flex-col justify-center flex-1 relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight">
            Welkom terug.
          </h1>
          <p className="text-white/80 text-lg mt-3 leading-relaxed max-w-sm">
            Bouw vandaag verder aan de jongerengroep die God je heeft toevertrouwd.
          </p>

          {/* Bible verse card */}
          <div className="mt-10 rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-5 max-w-md">
            <p className="text-[15px] leading-relaxed text-white/95 italic">
              &ldquo;{verse.text}&rdquo;
            </p>
            <p className="text-sm text-white/70 mt-3 font-medium">— {verse.reference}</p>
          </div>
        </div>

        {/* Mobile-only content (compact) */}
        <div className="lg:hidden relative z-10 mt-6 max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight">Welkom terug</h1>
          <p className="text-white/80 text-sm mt-1.5">
            Log in om verder te bouwen aan jullie groep.
          </p>
        </div>

        {/* Footer */}
        <div className="hidden lg:flex relative z-10 items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-3.5 w-3.5" />
          Veilige verbinding · Versleutelde wachtwoorden
        </div>
      </aside>

      {/* BOTTOM on mobile / RIGHT on desktop: form panel */}
      <main className="w-full lg:w-[480px] xl:w-[520px] bg-background flex items-start lg:items-center justify-center lg:min-h-screen relative -mt-12 lg:mt-0 pb-10 lg:pb-0">
        {/* Mobile: form floats over hero with rounded top */}
        <div className="bg-card lg:bg-transparent rounded-t-[2rem] lg:rounded-none px-6 lg:px-10 pt-8 pb-8 lg:py-0 shadow-2xl shadow-foreground/10 lg:shadow-none w-full max-w-md mx-auto">
          <div className="lg:max-w-sm lg:mx-auto">
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">Inloggen</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Met je email + wachtwoord
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@youthchurchleader.nl"
                  autoComplete="email"
                  autoFocus
                  required
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="password" required>
                  Wachtwoord
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-12"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3 flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full h-12 shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transition-shadow"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Bezig…
                  </>
                ) : (
                  <>
                    Inloggen
                    <LogIn className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="pt-4 space-y-1.5 text-center">
                <p className="text-xs text-muted-foreground">
                  Wachtwoord vergeten? Vraag een collega-leider om hem te resetten.
                </p>
                <p className="lg:hidden text-[10px] text-muted-foreground/70 inline-flex items-center gap-1 justify-center">
                  <ShieldCheck className="h-3 w-3" />
                  Veilige verbinding
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
