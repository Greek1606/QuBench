import { useSelector } from "react-redux";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
import SectionHeading from "../../../components/ui/SectionHeading";

export default function FeatureTable() {
  const { uploadStatus, features } = useSelector((state) => state.analysis);

  if (uploadStatus === "loading") {
    return (
      <Card className="flex flex-col">
        <SectionHeading className="mb-3">Detected Features</SectionHeading>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (uploadStatus !== "succeeded" || features.length === 0) return null;

  return (
    <Card className="flex flex-col">
      <SectionHeading className="mb-3">Detected Features</SectionHeading>

      <div className="hidden grid-cols-[auto_1fr_auto] gap-2 sm:grid sm:gap-4 border-b border-gray-100 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
        <span>Feature ID</span>
        <span>Name</span>
        <span>Confidence</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-gray-100 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:hidden">
        <span>Name</span>
        <span>Conf.</span>
      </div>

      <div className="mt-1 max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
        {features.map((feat, i) => (
          <div
            key={feat.id ?? i}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              i % 2 === 0 ? "bg-surface-muted/50" : ""
            }`}
          >
            <div className="hidden grid-cols-[auto_1fr_auto] items-center gap-2 sm:grid sm:gap-4">
              <span className="font-mono text-xs text-text-secondary">{feat.id}</span>
              <span className="font-medium text-text-primary truncate">{feat.name}</span>
              <Badge variant={feat.confidence} />
            </div>
            <div className="flex items-center justify-between gap-2 sm:hidden">
              <span className="font-medium text-text-primary truncate text-xs">{feat.name}</span>
              <Badge variant={feat.confidence} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
