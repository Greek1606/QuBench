import clsx from "clsx";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";

const colorMap = {
  purple: { heading: "text-accent-purple", chip: "bg-accent-purple-soft" },
  blue: { heading: "text-info-blue", chip: "bg-blue-50" },
};

export default function MetricsSummaryCard({
  title,
  variant = "purple",
  accuracy,
  f1Score,
  inferenceMs,
  loading = false,
}) {
  const colors = colorMap[variant] || colorMap.purple;

  if (loading) {
    return (
      <Card className="flex flex-col">
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  const stats = [
    { label: "Accuracy", value: accuracy != null ? `${accuracy}%` : "—" },
    { label: "F1 Score", value: f1Score != null ? f1Score.toFixed(4) : "—" },
    { label: "Inference", value: inferenceMs != null ? `${inferenceMs}ms` : "—" },
  ];

  return (
    <Card className="flex flex-col">
      <h3 className={clsx("mb-4 text-sm font-bold", colors.heading)}>{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className={clsx("flex flex-col items-center justify-center rounded-xl px-3 py-3", colors.chip)}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
            <span className="mt-1 text-xl font-bold text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
