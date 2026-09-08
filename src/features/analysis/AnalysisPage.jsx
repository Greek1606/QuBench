import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";
import UploadZone from "./components/UploadZone";
import UploadStatusBar from "./components/UploadStatusBar";
import FeatureTable from "./components/FeatureTable";
import HeatmapPanel from "./components/HeatmapPanel";
import DensityHistogram from "./components/DensityHistogram";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { uploadStatus } = useSelector((state) => state.analysis);
  const canProceed = uploadStatus === "succeeded";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Overview</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a diagnostic image to extract quantum features and analyze cellular density.
        </p>
      </div>

      {/* Upload zone */}
      <UploadZone />

      {/* Status bar */}
      <UploadStatusBar />

      {/* Feature table + Heatmap side by side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FeatureTable />
        <HeatmapPanel />
      </div>

      {/* Density histogram */}
      <DensityHistogram />

      {/* Proceed button */}
      <div className="flex justify-end pt-2">
        <Button
          disabled={!canProceed}
          onClick={() => navigate("/models")}
        >
          Proceed
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
