import { cn } from "@/lib/utils";

export function Logo({
  size = 36,
  className,
  withRing = true,
}: {
  size?: number;
  className?: string;
  withRing?: boolean;
}) {
  return (
    <div
      className={cn(
        withRing &&
          "inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
        className
      )}
      style={withRing ? { width: size, height: size } : undefined}
      aria-hidden
    >
      <svg
        width={withRing ? size * 0.55 : size}
        height={withRing ? size * 0.55 : size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Foliage — three leafy circles forming a soft canopy */}
        <circle cx="16" cy="7" r="4.5" fill="currentColor" />
        <circle cx="9" cy="11" r="3.8" fill="currentColor" />
        <circle cx="23" cy="11" r="3.8" fill="currentColor" />
        <circle cx="12.5" cy="6.5" r="3" fill="currentColor" />
        <circle cx="19.5" cy="6.5" r="3" fill="currentColor" />
        {/* Trunk */}
        <path
          d="M14.6 12 Q14.6 16 14 19 L14 21 L18 21 L18 19 Q17.4 16 17.4 12 Z"
          fill="currentColor"
        />
        {/* Roots — three branches fanning out */}
        <path
          d="M16 21 Q14 24 10 26"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M16 21 L16 27"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M16 21 Q18 24 22 26"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Root tips */}
        <circle cx="10" cy="26" r="1" fill="currentColor" />
        <circle cx="16" cy="27.2" r="1" fill="currentColor" />
        <circle cx="22" cy="26" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-foreground leading-none", className)}>
      Rooted <span className="text-primary">Youth</span>
    </span>
  );
}
