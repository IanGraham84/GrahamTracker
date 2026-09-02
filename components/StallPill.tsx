export default function StallPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stall-light text-stall text-xs font-medium px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-stall" />
      {label}
    </span>
  );
}
