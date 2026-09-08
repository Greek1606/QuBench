import clsx from "clsx";

export default function CardHeader({ icon: Icon, iconBg, iconColor, title, subtitle, className }) {
  return (
    <div className={clsx("mb-4 flex items-center gap-2", className)}>
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-full",
          iconBg
        )}
      >
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
