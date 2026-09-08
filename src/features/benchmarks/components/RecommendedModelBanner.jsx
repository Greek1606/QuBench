import { Download } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";

export default function RecommendedModelBanner({ label, summary, loading = false }) {
  if (loading) {
    return (
      <Card className="flex flex-col">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="mt-2 h-5 w-3/4 rounded" />
      </Card>
    );
  }

  if (!label && !summary) return null;

  const handleExport = () => {
    const data = { label, summary, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bioqlab-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {label && (
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-purple">
            Recommended Model
          </p>
        )}
        {summary && (
          <p className="mt-1 text-sm font-bold text-text-primary">{summary}</p>
        )}
      </div>
      <Button variant="secondary" onClick={handleExport} className="shrink-0">
        <Download size={14} />
        Export Report
      </Button>
    </Card>
  );
}
