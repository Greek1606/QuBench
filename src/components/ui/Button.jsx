import clsx from "clsx";

const variants = {
  primary:
    "bg-accent-purple text-white hover:bg-accent-purple/90 active:bg-accent-purple/80",
  secondary:
    "border border-accent-purple text-accent-purple bg-transparent hover:bg-accent-purple-soft active:bg-accent-purple-soft/70",
};

export default function Button({
  variant = "primary",
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
