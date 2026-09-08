import clsx from "clsx";

export default function SectionHeading({ children, className }) {
  return (
    <h3
      className={clsx(
        "text-xs font-semibold uppercase tracking-wider text-text-secondary",
        className
      )}
    >
      {children}
    </h3>
  );
}
