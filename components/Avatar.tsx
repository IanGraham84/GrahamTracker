function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  stalled = false,
  size = "md",
}: {
  name: string;
  stalled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  }[size];

  return (
    <div
      className={`${sizeClasses} shrink-0 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center ${
        stalled ? "ring-2 ring-stall ring-offset-2 ring-offset-background" : ""
      }`}
    >
      {initials(name)}
    </div>
  );
}
