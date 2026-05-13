"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo, Wordmark } from "@/components/logo";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell><Loader2 className="h-6 w-6 animate-spin text-primary" /></LoginShell>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 lg:px-8 py-6 flex items-center gap-3 max-w-md w-full mx-auto">
        <Logo size={40} />
        <div className="leading-tight">
          <Wordmark className="text-base" />
          <div className="text-xs text-muted-foreground mt-0.5">Leiders Dashboard</div>
        </div>
      </header>
      <main className="flex-1 px-4 lg:px-8 max-w-md w-full mx-auto flex items-center justify-center py-8">
        {children}
      </main>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

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
    <LoginShell>
      <Card className="w-full overflow-hidden shadow-lg shadow-primary/10">
        <div className="bg-hero-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]" />
          <svg
            className="absolute inset-y-0 right-2 h-full opacity-[0.10] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <path d="M45 15 L55 15 L55 45 L85 45 L85 55 L55 55 L55 95 L45 95 L45 55 L15 55 L15 45 L45 45 Z" fill="white" />
          </svg>
          <div className="relative px-6 py-7">
            <h1 className="text-2xl font-semibold tracking-tight">Welkom terug</h1>
            <p className="text-white/80 text-sm mt-1">
              Log in om de leiders-dashboard te openen
            </p>
          </div>
        </div>

        <CardContent className="p-6">
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
              />
            </div>

            {error && (
              <div className="rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm p-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bezig…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Inloggen
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Wachtwoord vergeten? Vraag een leider om hem te resetten.
            </p>
          </form>
        </CardContent>
      </Card>
    </LoginShell>
  );
}
