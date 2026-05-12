"use client";

import { Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo, Wordmark } from "@/components/logo";
import { currentUser } from "@/lib/mock-data";

export function Topbar({
  title,
  subtitle,
  hideBranding = false,
}: {
  title?: string;
  subtitle?: string;
  hideBranding?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border lg:border-b-0">
      <div className="flex items-center gap-3 h-16 px-4 md:px-8">
        {/* Mobile: show full branding (logo + wordmark + sublabel) */}
        {!hideBranding && (
          <div className="lg:hidden flex items-center gap-3 min-w-0 flex-1">
            <Logo size={40} />
            <div className="leading-tight min-w-0">
              <Wordmark className="text-base" />
              <div className="text-xs text-muted-foreground mt-0.5">Leiders Dashboard</div>
            </div>
          </div>
        )}

        {/* Desktop: page title / subtitle (sidebar already shows branding) */}
        <div className="hidden lg:block min-w-0 flex-1">
          {title && (
            <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted transition-colors"
          aria-label="Meldingen"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <Avatar name={currentUser.name} color={currentUser.color} size={40} />
      </div>

      {/* Mobile-only page title row (below brand) */}
      {!hideBranding && title && (
        <div className="lg:hidden px-4 pb-3 -mt-1">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
