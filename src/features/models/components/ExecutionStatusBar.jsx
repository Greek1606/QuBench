import { useSelector } from "react-redux";
import { CheckCircle2, Loader2 } from "lucide-react";
import StatusPill from "../../../components/ui/StatusPill";

export default function ExecutionStatusBar() {
  const { execution } = useSelector((state) => state.models);
  const { status, sampleCount, elapsedSeconds } = execution;

  if (status === "idle") return null;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface px-5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {status === "completed" && (
          <CheckCircle2 size={18} className="shrink-0 text-success" />
        )}
        {status === "running" && (
          <Loader2 size={18} className="shrink-0 text-amber-500 animate-spin" />
        )}
        {status === "failed" && (
          <span className="inline-block h-[18px] w-[18px] shrink-0 rounded-full bg-red-500/20 text-center text-[10px] leading-[18px] text-red-500 font-bold">!</span>
        )}

        <div>
          <p className="text-sm font-medium text-text-primary">
            {status === "completed"
              ? "Execution Completed"
              : status === "running"
              ? "Running…"
              : "Execution Failed"}
          </p>
          {status === "completed" && sampleCount != null && (
            <p className="text-xs text-text-secondary">
              {sampleCount.toLocaleString()} samples processed
              {elapsedSeconds != null && ` · ${elapsedSeconds.toFixed(1)}s elapsed`}
            </p>
          )}
        </div>
      </div>

      <StatusPill
        status={
          status === "completed"
            ? "success"
            : status === "running"
            ? "running"
            : "neutral"
        }
        label={
          status === "completed"
            ? "READY"
            : status === "running"
            ? "RUNNING"
            : "FAILED"
        }
        className="self-start sm:self-auto"
      />
    </div>
  );
}
