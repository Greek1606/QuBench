import { useEffect, useMemo, useRef, useState } from "react";

import { ApiError, getRun, pollJob } from "../api";
import AccuracyChart from "../components/AccuracyChart";
import Card from "../components/Card";
import ConfusionMatrix from "../components/ConfusionMatrix";
import JobProgress from "../components/JobProgress";
import MetricsTable from "../components/MetricsTable";
import PerClassBars from "../components/PerClassBars";
import Spinner from "../components/Spinner";
import TelemetryTable from "../components/TelemetryTable";
import TimeChart from "../components/TimeChart";

/**
 * Screen 3 of 5. Two states in one page: running, then results.
 *
 * The transition is automatic — pollJob resolves on done, the run is fetched,
 * and the same component swaps what it renders. A separate "results" route
 * would mean a navigation the user did not ask for at the moment they are
 * watching a progress bar.
 */
function useElapsed(active) {
  const [s, setS] = useState(0);
  const start = useRef(Date.now());
  useEffect(() => {
    if (!active) return;
    start.current = Date.now();
    const id = setInterval(
      () => setS((Date.now() - start.current) / 1000),
      1000,
    );
    return () => clearInterval(id);
  }, [active]);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function Benchmark({
  jobId,
  runId,
  estimate,
  onRunFinished,
  onDiagnose,
  onBack,
}) {
  const [job, setJob] = useState(null);
  const [run, setRun] = useState(null);
  const [error, setError] = useState(null);
  const elapsed = useElapsed(!!jobId && !runId);

  // ---- poll, then fetch ---------------------------------------------------
  useEffect(() => {
    if (!jobId || runId) return;
    const ctrl = new AbortController();
    pollJob(jobId, setJob, { signal: ctrl.signal })
      .then((final) => {
        if (final?.status === "done" && final.run_id)
          onRunFinished?.(final.run_id);
      })
      .catch((e) =>
        setError(
          e instanceof ApiError ? e.detail : "Lost contact with the run.",
        ),
      );
    return () => ctrl.abort();
  }, [jobId, runId, onRunFinished]);

  useEffect(() => {
    if (!runId) return;
    getRun(runId)
      .then(setRun)
      .catch((e) =>
        setError(e instanceof ApiError ? e.detail : "Could not load the run."),
      );
  }, [runId]);

  // ---- the comparison the whole project is about --------------------------
  const summary = useMemo(() => {
    if (!run) return null;
    const ok = run.results.filter((r) => !r.error);
    const pick = (kind) =>
      ok
        .filter((r) => r.kind === kind)
        .sort((a, b) => b.metrics.f1_macro - a.metrics.f1_macro)[0] ?? null;
    const classical = pick("classical");
    const quantum = pick("quantum");
    const best =
      [classical, quantum]
        .filter(Boolean)
        .sort((a, b) => b.metrics.f1_macro - a.metrics.f1_macro)[0] ?? null;
    return {
      classical,
      quantum,
      best,
      delta:
        classical && quantum
          ? quantum.metrics.f1_macro - classical.metrics.f1_macro
          : null,
    };
  }, [run]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] px-9 py-7">
        <p
          role="alert"
          className="rounded-lg border-l-[3px] border-alert bg-alert/5 px-4 py-3 text-[12px] text-body"
        >
          <span className="font-semibold text-ink">Something went wrong.</span>{" "}
          {error}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-[7px] border border-rule bg-white px-4 py-2 text-[13px] text-body"
        >
          Back to Configure
        </button>
      </div>
    );
  }

  // ---- running ------------------------------------------------------------
  if (!run) {
    return (
      <div className="mx-auto max-w-[1440px] px-9 py-7">
        <header>
          <h1 className="text-[25px] font-semibold text-ink">
            Running the benchmark
          </h1>
          <p className="mt-1 text-[13px] text-body">
            Every model sees identical features. You can leave this page — the
            run continues.
          </p>
        </header>
        <div className="mt-6 max-w-[760px]">
          {job ? (
            <JobProgress job={job} elapsed={elapsed} estimate={estimate} />
          ) : (
            <p className="flex items-center gap-2 text-[13px] text-muted">
              <Spinner size={15} /> Waiting for the first update
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- results ------------------------------------------------------------
  const classNames = run.class_names ?? [];
  const showcase = summary?.best;

  return (
    <div className="mx-auto max-w-[1440px] px-9 py-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-semibold text-ink">Results</h1>
          <p className="mt-1 text-[13px] text-body">
            Same images, same features, same split. Only the model changed.
          </p>
        </div>
        <button
          type="button"
          disabled={!showcase}
          onClick={() => onDiagnose?.(run.run_id, showcase.model)}
          className="rounded-[7px] bg-quantum px-5 py-2.5 text-[13px] font-semibold text-white
            disabled:opacity-40"
        >
          Use in Diagnose
        </button>
      </header>

      {/* hero */}
      {summary && (
        <div
          className="mt-6 flex flex-wrap items-start gap-x-14 gap-y-6 rounded-[10px]
          border border-rule border-l-4 border-l-quantum bg-white px-6 py-5"
        >
          <div>
            <p className="text-[11px] text-muted">Best model</p>
            <p className="mt-1 text-[22px] font-semibold text-ink">
              {summary.best?.label ?? "—"}
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {run.config.backbone} · {run.config.encoding} ·{" "}
              {run.config.n_features} features
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Macro-F1</p>
            <p className="mt-1 font-mono text-[34px] font-semibold leading-none text-quantum">
              {summary.quantum
                ? summary.quantum.metrics.f1_macro.toFixed(3)
                : "—"}
            </p>
            <p className="mt-1.5 text-[10.5px] text-muted">best quantum</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Best classical</p>
            <p className="mt-1 font-mono text-[34px] font-semibold leading-none text-classical">
              {summary.classical
                ? summary.classical.metrics.f1_macro.toFixed(3)
                : "—"}
            </p>
            <p className="mt-1.5 text-[10.5px] text-muted">
              {summary.classical?.label ?? ""}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Difference</p>
            <p className="mt-1 font-mono text-[34px] font-semibold leading-none text-ink">
              {summary.delta == null
                ? "—"
                : `${summary.delta >= 0 ? "+" : "−"}${Math.abs(summary.delta).toFixed(3)}`}
            </p>
            <p className="mt-1.5 text-[10.5px] text-muted">
              {summary.delta == null
                ? "needs both kinds"
                : summary.delta >= 0
                  ? "in favour of quantum"
                  : "in favour of classical"}
            </p>
          </div>
          <p className="max-w-[300px] rounded-lg bg-hairline px-4 py-3 text-[11px] text-body">
            Macro-F1 weights every class equally. Accuracy would reward a model
            that ignored the rarest class, and on an uneven dataset that is
            exactly what happens.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Every model, side by side">
          <MetricsTable results={run.results} />
        </Card>
        <Card title="How they compare" sub="Same axis, both lanes.">
          <div className="grid gap-8 sm:grid-cols-2">
            <AccuracyChart results={run.results} />
            <TimeChart results={run.results} />
          </div>
        </Card>
      </div>

      {showcase && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card
            title={showcase.label}
            sub="Rows are the true class, columns the prediction."
          >
            <ConfusionMatrix result={showcase} classNames={classNames} />
          </Card>
          <Card
            title="Per class"
            sub="Recall, and how many test images it had."
          >
            <PerClassBars
              perClass={showcase.per_class}
              classNames={classNames}
            />
          </Card>
        </div>
      )}

      <Card
        className="mt-6"
        title="Circuit telemetry"
        sub="One table, both kinds."
      >
        <TelemetryTable results={run.results} />
      </Card>

      <footer className="mt-6 flex items-center justify-between gap-6">
        <p className="max-w-[70ch] text-[11px] text-muted">
          The classical arm was grid-searched before this comparison, the split
          is fixed by seed, and both arms saw byte-identical features. A
          difference of a few points on a small test set is a lead worth
          chasing, not a result worth claiming.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-[7px] border border-rule bg-white px-5 py-2.5 text-[13px] text-body hover:bg-canvas"
        >
          Change the config
        </button>
      </footer>
    </div>
  );
}
