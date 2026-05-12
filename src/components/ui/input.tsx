import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm transition-colors",
        "placeholder:text-muted-foreground/70",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm transition-colors leading-relaxed resize-none",
        "placeholder:text-muted-foreground/70",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export function Label({
  htmlFor,
  children,
  className,
  hint,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-foreground mb-1.5", className)}
    >
      {children}
      {required && <span className="text-primary ml-0.5">*</span>}
      {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
