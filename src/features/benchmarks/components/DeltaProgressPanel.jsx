import Card from "../../../components/ui/Card";
import ProgressBar from "../../../components/ui/ProgressBar";
import Skeleton from "../../../components/ui/Skeleton";
import SectionHeading from "../../../components/ui/SectionHeading";

export default function DeltaProgressPanel({
  accuracyDeltaPct,
  expressibilityIndexPct,
  advantageNote,
  loading = false,
}) {
  if (loading) {
    return (
      <Card className="flex flex-col">
        <SectionHeading className="mb-3">Performance Delta</SectionHeading>
        <div className="space-y-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </Card>
    );
  }

  if (accuracyDeltaPct == null && expressibilityIndexPct == null) return null;

  return (
    <Card className="flex flex-col">
      <SectionHeading className="mb-4">Performance Delta</SectionHeading>
      <div className="space-y-4">
        <ProgressBar label="Accuracy Delta" value={accuracyDeltaPct ?? 0} max={20} color="bg-accent-purple" />
        <ProgressBar label="Expressibility Index" value={expressibilityIndexPct ?? 0} max={100} color="bg-info-blue" />
      </div>
      {advantageNote && (
        <p className="mt-4 text-xs italic text-text-secondary leading-relaxed">{advantageNote}</p>
      )}
    </Card>
  );
}
