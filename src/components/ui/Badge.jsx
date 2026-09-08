import clsx from "clsx";

const colorMap = {
  High: "bg-success-soft text-success",
  Medium: "bg-warning-soft text-warning",
  "G-State": "bg-accent-purple-soft text-accent-purple",
  "Q-State": "bg-accent-purple-soft text-accent-purple",
  info: "bg-blue-50 text-info-blue",
};

export default function Badge({ variant = "High", className, children }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        colorMap[variant] || colorMap.High,
        className
      )}
    >
      {children || variant}
    </span>
  );
}
