export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-2 rounded-full bg-primary-light overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
