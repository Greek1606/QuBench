import { useGetBenchmarksQuery } from "./benchmarkApi";
import MetricsSummaryCard from "./components/MetricsSummaryCard";
import ConvergenceChart from "./components/ConvergenceChart";
import DeltaProgressPanel from "./components/DeltaProgressPanel";
import RecommendedModelBanner from "./components/RecommendedModelBanner";
import LiveInferencePanel from "./components/LiveInferencePanel";
import { AlertTriangle } from "lucide-react";

export default function BenchmarksPage() {
  const { data, isLoading, isError, error } = useGetBenchmarksQuery("latest");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Benchmarks</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Compare quantum vs classical model performance and run live inference.
        </p>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-3 rounded-card bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          <span>
            Failed to load benchmarks:{" "}
            {error?.data?.detail || error?.error || "Unknown error"}
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetricsSummaryCard title="VQC" loading />
            <MetricsSummaryCard title="SVM" loading />
          </div>
          <ConvergenceChart loading />
          <DeltaProgressPanel loading />
          <RecommendedModelBanner loading />
        </>
      )}

      {/* Loaded state */}
      {data && (
        <>
          {/* Two metrics cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetricsSummaryCard
              title="Variational Quantum Classifier"
              variant="purple"
              accuracy={data.vqc?.accuracy}
              f1Score={data.vqc?.f1Score}
              inferenceMs={data.vqc?.inferenceMs}
            />
            <MetricsSummaryCard
              title="Support Vector Machine"
              variant="blue"
              accuracy={data.svm?.accuracy}
              f1Score={data.svm?.f1Score}
              inferenceMs={data.svm?.inferenceMs}
            />
          </div>

          {/* Chart + Delta panel side by side */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ConvergenceChart data={data.convergenceCurve} />
            <DeltaProgressPanel
              accuracyDeltaPct={data.accuracyDeltaPct}
              expressibilityIndexPct={data.expressibilityIndexPct}
              advantageNote={data.advantageNote}
            />
          </div>

          {/* Recommended model banner */}
          <RecommendedModelBanner
            label={data.recommendedModel?.label}
            summary={data.recommendedModel?.summary}
          />
        </>
      )}

      {/* Empty state when no data and not loading */}
      {!isLoading && !isError && !data && (
        <div className="rounded-card bg-surface p-10 text-center shadow-card">
          <p className="text-sm text-text-secondary">
            No benchmark data available. Run model execution from the QML Models page first.
          </p>
        </div>
      )}

      {/* Live inference panel — always visible */}
      <LiveInferencePanel />
    </div>
  );
}
