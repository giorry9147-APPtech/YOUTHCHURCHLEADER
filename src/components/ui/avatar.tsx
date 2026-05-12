import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = 40,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white shrink-0 select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? "#1c1917",
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function AvatarStack({
  items,
  max = 3,
  size = 28,
}: {
  items: { name: string; color?: string }[];
  max?: number;
  size?: number;
}) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((it, i) => (
        <div
          key={i}
          className="ring-2 ring-card rounded-full"
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={it.name} color={it.color} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card font-medium"
          style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
