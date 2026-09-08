import clsx from "clsx";

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-card bg-surface p-6 shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
