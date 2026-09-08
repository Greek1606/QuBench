import clsx from "clsx";

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  color = "bg-accent-purple",
  className,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span className="font-medium text-text-primary">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
