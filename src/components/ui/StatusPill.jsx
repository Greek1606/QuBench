import clsx from "clsx";

const dotColors = {
  success: "bg-success",
  neutral: "bg-text-secondary",
  info: "bg-info-blue",
  running: "bg-amber-500 animate-pulse",
};

export default function StatusPill({
  status = "success",
  label,
  className,
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium text-text-primary bg-surface-muted",
        className
      )}
    >
      <span
        className={clsx(
          "inline-block h-2 w-2 rounded-full shrink-0",
          dotColors[status] || dotColors.neutral
        )}
      />
      {label}
    </span>
  );
}
