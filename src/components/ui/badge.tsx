import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "muted" | "accent" | "success" | "warning" | "danger";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const styles: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-foreground bg-transparent",
    muted: "bg-muted text-muted-foreground",
    accent: "bg-accent-soft text-accent",
    success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
