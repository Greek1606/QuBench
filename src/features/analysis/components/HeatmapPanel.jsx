import { useSelector } from "react-redux";
import { ImageIcon } from "lucide-react";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
import SectionHeading from "../../../components/ui/SectionHeading";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function HeatmapPanel() {
  const { uploadStatus, heatmapUrl } = useSelector((state) => state.analysis);

  if (uploadStatus === "loading") {
    return (
      <Card className="flex flex-col">
        <SectionHeading className="mb-3">Feature Heatmap</SectionHeading>
        <Skeleton className="flex h-56 items-center justify-center rounded-card bg-panel-dark">
          <span className="text-xs text-white/30">Loading heatmap…</span>
        </Skeleton>
      </Card>
    );
  }

  if (uploadStatus !== "succeeded" || !heatmapUrl) return null;

  const fullUrl = heatmapUrl.startsWith("http") ? heatmapUrl : `${API_BASE}${heatmapUrl}`;

  return (
    <Card className="flex flex-col">
      <SectionHeading className="mb-3">Feature Heatmap</SectionHeading>
      <div className="flex items-center justify-center overflow-hidden rounded-card bg-panel-dark p-4">
        <img
          src={fullUrl}
          alt="Feature heatmap"
          className="max-h-64 w-full object-contain"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="hidden flex-col items-center gap-2 text-white/40">
          <ImageIcon size={32} />
          <span className="text-xs">Heatmap unavailable</span>
        </div>
      </div>
    </Card>
  );
}
