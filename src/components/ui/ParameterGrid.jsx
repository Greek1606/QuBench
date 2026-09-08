import clsx from "clsx";

export default function ParameterGrid({ parameters = {}, className }) {
  const entries = Object.entries(parameters);

  return (
    <div className={clsx("grid grid-cols-2 gap-2", className)}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl bg-surface-muted px-3 py-2"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary truncate">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
