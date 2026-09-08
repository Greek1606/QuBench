import { useSelector } from "react-redux";
import { CheckCircle2, XCircle } from "lucide-react";
import StatusPill from "../../../components/ui/StatusPill";

const STATUS_LABEL = {
  loading: "Analyzing…",
  succeeded: "Upload complete",
  failed: "Upload failed",
};

export default function UploadStatusBar() {
  const { file, uploadStatus, featureCount, error } = useSelector(
    (state) => state.analysis
  );

  if (uploadStatus === "idle") return null;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface px-5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {uploadStatus === "succeeded" && <CheckCircle2 size={18} className="text-success" />}
        {uploadStatus === "failed" && <XCircle size={18} className="text-red-500" />}
        {uploadStatus === "loading" && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent-purple border-t-transparent" />
        )}
        <div>
          <p className="text-sm font-medium text-text-primary">{STATUS_LABEL[uploadStatus]}</p>
          {file.name && <p className="text-xs text-text-secondary">{file.name}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {uploadStatus === "succeeded" && featureCount != null && (
          <span className="text-xs font-medium text-text-secondary">
            {featureCount} features detected
          </span>
        )}
        {uploadStatus === "succeeded" && <StatusPill status="success" label="Ready" />}
        {uploadStatus === "failed" && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}
