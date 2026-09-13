import { useEffect, useState } from "react";

import { getHealth } from "./api";
import StepBar from "./components/StepBar";
import TopBar from "./components/TopBar";
import Benchmark from "./pages/Benchmark";
import Configure from "./pages/Configure";
import Upload from "./pages/Upload";

/**
 * The whole app.
 *
 * NO ROUTER. This is a five-step wizard with a step bar, and the step bar is
 * the navigation — adding react-router would mean two sources of truth for
 * "where am I" and buy nothing the design asks for. If deep links to a finished
 * run are wanted later, the swap is small: `step` becomes a route param and
 * this component keeps the rest of its state.
 *
 * Three pieces of state cross screens, and nothing else does:
 *
 *   dataset  chosen on Upload, needed by Configure and the run
 *   jobId    returned by Configure, polled by Benchmark
 *   runId    set when a job finishes, read by Benchmark and Diagnose
 *
 * Each page owns everything else. A page never reaches into another page's
 * state, which is why they can be built in parallel by different people.
 */

const STEPS = ["upload", "configure", "benchmark", "diagnose", "leaderboard"];
const LABELS = {
  upload: "Upload",
  configure: "Configure",
  benchmark: "Benchmark",
  diagnose: "Diagnose",
  leaderboard: "Leaderboard",
};

export default function App() {
  const [step, setStep] = useState("upload");
  const [dataset, setDataset] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [wired, setWired] = useState(null);

  // One health check at start. It tells the top bar which endpoints are live,
  // so a control whose backend half is unwritten can be hidden rather than
  // letting someone click it and collect a 503.
  useEffect(() => {
    getHealth()
      .then((h) => setWired(h.wired))
      .catch(() => setWired(null));
  }, []);

  const enabled = {
    upload: true,
    configure: !!dataset,
    benchmark: !!jobId || !!runId,
    diagnose: !!runId,
    leaderboard: true,
  };

  const steps = STEPS.map((id, i) => ({
    id,
    label: LABELS[id],
    enabled: enabled[id],
    done: STEPS.indexOf(step) > i && enabled[id],
  }));

  const caption =
    step === "leaderboard"
      ? "all runs"
      : runId
        ? `run ${runId}`
        : jobId
          ? `job ${jobId}`
          : dataset
            ? "draft run"
            : "no run yet";

  return (
    <div className="min-h-screen bg-canvas font-sans text-body">
      <TopBar dataset={dataset} wired={wired} />
      <StepBar steps={steps} current={step} onGo={setStep} right={caption} />

      <main>
        {step === "upload" && (
          <Upload
            onContinue={(d) => {
              setDataset(d);
              // A new dataset invalidates any run in progress — carrying a
              // stale runId into Diagnose would predict with a model trained
              // on different images.
              setJobId(null);
              setRunId(null);
              setStep("configure");
            }}
          />
        )}

        {step === "configure" && (
          <Configure
            dataset={dataset}
            onBack={() => setStep("upload")}
            onRun={(id) => {
              setJobId(id);
              setRunId(null);
              setStep("benchmark");
            }}
          />
        )}

        {step === "benchmark" && (
          <Benchmark
            jobId={jobId}
            runId={runId}
            onRunFinished={setRunId}
            onDiagnose={(rid) => {
              setRunId(rid);
              setStep("diagnose");
            }}
            onBack={() => setStep("configure")}
          />
        )}

        {step === "diagnose" && (
          <Placeholder
            name="Diagnose"
            note="One image against one trained model, with per-class confidence."
            onBack={() => setStep("benchmark")}
          />
        )}

        {step === "leaderboard" && (
          <Placeholder
            name="Leaderboard"
            note="Best classical against best quantum, per dataset, across every run."
            onBack={() => setStep("upload")}
          />
        )}
      </main>
    </div>
  );
}

/**
 * Stands in for a screen that has not been built. Deliberately plain: it should
 * never be mistaken for a finished page, and it should never appear in a demo.
 *
 * To replace one, import the real page and swap the element. Nothing else in
 * this file changes.
 */
function Placeholder({ name, note, onBack }) {
  return (
    <div className="mx-auto max-w-[1440px] px-9 py-7">
      <div className="rounded-[10px] border border-dashed border-rule bg-white px-8 py-14 text-center">
        <p className="text-[25px] font-semibold text-ink">{name}</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[13px] text-body">
          {note}
        </p>
        <p className="mt-4 font-mono text-[11.5px] text-muted">not built yet</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-[7px] border border-rule px-4 py-2 text-[13px] text-body hover:bg-canvas"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
