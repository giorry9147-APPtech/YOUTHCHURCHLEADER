import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

export function emojiFor(greetingWord: string) {
  switch (greetingWord) {
    case "Goedemorgen":
      return "👋";
    case "Goedemiddag":
      return "☀️";
    case "Goedenavond":
      return "🌙";
    default:
      return "✨";
  }
}

export function formatRelativeDays(date: Date, now = new Date()) {
  const diff = Math.round(
    (date.getTime() - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Vandaag";
  if (diff === 1) return "Morgen";
  if (diff === -1) return "Gisteren";
  if (diff > 0 && diff < 7) return `Over ${diff} dagen`;
  if (diff < 0 && diff > -7) return `${Math.abs(diff)} dagen geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
