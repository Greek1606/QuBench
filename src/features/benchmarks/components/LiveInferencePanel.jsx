import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Zap } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/ui/StatusPill";
import SectionHeading from "../../../components/ui/SectionHeading";
import { runInference } from "../benchmarkSlice";

export default function LiveInferencePanel() {
  const dispatch = useDispatch();
  const { inferenceStatus, inferenceResult, inferenceError } = useSelector(
    (state) => state.benchmarks
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { vector: "" } });

  const isLoading = inferenceStatus === "loading";

  const onSubmit = (data) => {
    const vector = data.vector
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (vector.length > 0) dispatch(runInference(vector));
  };

  return (
    <Card className="flex flex-col">
      <SectionHeading className="mb-4">Live Inference</SectionHeading>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <input
            {...register("vector", {
              required: "Enter a sample vector",
              validate: (val) => {
                const valid = val.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
                return valid.length > 0 || "Must be comma-separated floats, e.g. 0.94, 0.89";
              },
            })}
            placeholder="Input Sample Vector: [0.94, 0.89, ...]"
            className="w-full rounded-pill border border-gray-200 bg-surface px-4 py-2.5 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30"
            disabled={isLoading}
          />
          {errors.vector && <p className="mt-1 text-xs text-red-500">{errors.vector.message}</p>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Running…
              </>
            ) : (
              <>
                <Zap size={14} />
                Run Inference
              </>
            )}
          </Button>
          {inferenceStatus === "failed" && (
            <span className="text-xs text-red-500">{inferenceError}</span>
          )}
        </div>
      </form>

      {inferenceResult && inferenceStatus === "succeeded" && (
        <div className="mt-4 rounded-xl bg-surface-muted p-4">
          <div className="flex items-center gap-2 mb-2">
            <StatusPill status="success" label="Inference Complete" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Prediction", value: inferenceResult.prediction },
              {
                label: "Confidence",
                value: inferenceResult.confidence != null
                  ? typeof inferenceResult.confidence === "number"
                    ? inferenceResult.confidence.toFixed(4)
                    : inferenceResult.confidence
                  : "—",
              },
              { label: "Latency", value: inferenceResult.latencyMs != null ? `${inferenceResult.latencyMs}ms` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
                <p className="mt-0.5 text-sm font-bold text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
