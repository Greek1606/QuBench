import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function SelectDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  className,
}) {
  return (
    <div className={clsx("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full appearance-none rounded-pill border border-gray-200 bg-surface px-4 py-2.5 pr-10 text-sm font-medium text-text-primary outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 cursor-pointer"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
      />
    </div>
  );
}
