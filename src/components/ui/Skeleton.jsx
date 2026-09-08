import clsx from "clsx";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx("animate-pulse rounded-xl bg-surface-muted", className)}
      {...props}
    />
  );
}
