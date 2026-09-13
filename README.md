# Hybrid Quantum Machine Learning Platform for Early Disease Detection

**Smart India Hackathon 2026 · Problem Statement 26139**

A web platform that benchmarks **classical ML against quantum ML on identical
features**, for cardiovascular disease detection from ECG images — with
user-configurable preprocessing and quantum encoding.

The claim we are testing is not "quantum is better". It is: _given the same
928 images, the same preprocessing, the same ResNet18 embedding and the same
8 principal components, does a quantum kernel separate the classes better than
an RBF kernel?_ Every number the platform reports is a controlled comparison.

---

## Why ECG images specifically

We scoped deliberately to ECG images rather than general biomedical imaging.
Published work already shows quantum kernel methods beating classical
baselines on this exact task — QuCardio (IEEE Access, 2023) reports a quantum
SVC outperforming its classical counterpart by roughly 10 percentage points of
accuracy on a four-class ECG image dataset, and a quanvolutional network
reaching about 97%. We are building on an established result rather than
gambling on an arbitrary dataset.

Dataset: 928 ECG images from the Ch. Pervaiz Elahi Institute of Cardiology,
Multan, across four classes — Normal, Abnormal Heartbeat, Myocardial
Infarction, and History of MI.

---

## The architecture in one page

### The invariant

```
ingest → preprocess → embed → project → encode → train → evaluate
```

Everything upstream of the model layer collapses to exactly:

```
X : float32[n, N]     y : int[n]     class_names : list[str]
```

Models never see images. Models never see file paths. `n_classes` is always a
constructor argument, inferred from the upload — never hardcoded.

### The six seams

Each is a plain Python dict. Adding an implementation means writing a function
and adding one dict entry. Nothing else changes, ever.

| #   | Seam             | File                 | Phase 1 contents                |
| --- | ---------------- | -------------------- | ------------------------------- |
| 1   | Ingest adapter   | `core/ingest.py`     | `image_folder`                  |
| 2   | Preprocessing op | `core/preprocess.py` | 9 composable ECG ops + 2 locked |

| 3.5 | Encoding | `core/encodings.py` | `angle_y`, `angle_x2`, `zz`, `amplitude` |
| 4 | Model registry | `core/registry.py` | `svc`, `rf`, `qsvc`, `vqc` |
| 5 | Job runner | `backend/jobs.py` | BackgroundTasks + dict |
| 6 | Store | `backend/store.py` | JSON files |

### Phasing

- **Phase 1 (now)** — working frontend + backend, 2 classical + 2 quantum
  models, 2–3 ECG image datasets.
- **Phase 2** — more models. Touches **only seam 4**. Zero frontend work,
  because the UI renders from catalog endpoints.
- **Phase 3** — other modalities, Celery, SQLite. Touches **only seams
  1, 2, 3, 5, 6**.

Phase 1 is built so Phases 2 and 3 are _additions, not rewrites_. That is the
pitch, and the seams are how we back it up.

### Quantum framework

**PennyLane only.** No Qiskit anywhere. `qml.specs(level="device")` gives real
depth and gate counts for the telemetry table in one call, and
`diff_method="backprop"` on `default.qubit` differentiates the simulator
directly — so the VQC needs no deep-learning framework at all. The model layer
depends only on numpy, scikit-learn and PennyLane; torch is confined to
`embed.py`, where a pretrained CNN genuinely requires it.

Two implementation choices worth knowing:

_The Gram matrix is built from cached statevectors._ Simulating each sample
once and taking inner products is O(n) simulations plus one BLAS call, rather
than the O(n²) compute-uncompute circuits a pairwise fidelity kernel would
need. Identical numbers, minutes into seconds. It is exact statevector
simulation — noiseless, no shot noise — so say "noiseless simulation", never
"we ran it on a quantum computer".

_The kernel bandwidth is cross-validated, not assumed._ Fidelity kernels
concentrate: too wide and every state is orthogonal to every other, too narrow
and they are all identical, and the usable window is narrower for `zz` than for
`angle_y` because the pairwise term grows quadratically in the input scale. An
untuned quantum kernel can score below chance for reasons that have nothing to
do with whether quantum helps. Measured on our data: `zz` scores 0.774 untuned
and 0.903 tuned.

---

## Quickstart

Requires **Python 3.11+** (PennyLane 0.45 will not install on 3.10) and
Node 18+.

```bash
git clone <repo> && cd sih-draft

# --- backend -------------------------------------------------------------
python3 -m venv .venv
source .venv/bin/activate

# CPU torch FIRST — the default PyPI wheel drags in ~2.5 GB of CUDA packages
# this project never executes.
pip install torch==2.14.0 torchvision==0.29.0 \
    --index-url https://download.pytorch.org/whl/cpu
pip install -r backend/requirements.txt

uvicorn backend.main:app --reload --reload-dir backend --port 8000

# --- frontend (second terminal) ------------------------------------------
cd frontend && npm install && npm run dev
```

- API docs: <http://localhost:8000/docs>
- App: <http://localhost:5173>
- What's wired: <http://localhost:8000/health>

Detailed setup, invariant checks and troubleshooting live in
[`backend/README.md`](backend/README.md).

---

## Repo layout

```
backend/          FastAPI service; core/ is pure Python with no web stack
frontend/         React + Vite + Tailwind; every fetch() lives in api.js
fixtures/         hand-written JSON per endpoint, so the UI builds without a server
scripts/          pipeline.py — the whole pipeline with no web layer at all
storage/          datasets, embedding cache, checkpoints, JSON metadata
```

---

## Workstreams

|                             | Owner of                                                                                                                    | Done when                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **W1** design / integration | `contracts.py`, `paths.py`, `schemas.py`, fixtures, deck                                                                    | any stream can answer "what does this endpoint return?" without asking                                 |
| **W2** frontend             | everything in `frontend/`. Never edits Python                                                                               | `MOCK=true` gives a fully clickable app with no backend running                                        |
| **W3** backend              | `main.py`, `jobs.py`, `store.py`, `validate.py`, `core/ingest.py`, `core/preprocess.py`                                     | the full flow works via `curl` and `/docs` with no frontend                                            |
| **W4** models               | `core/embed.py`, `encodings.py`, `project.py`, `registry.py`, `models_*.py`, `benchmark.py`, `estimate.py`, `checkpoint.py` | `scripts/pipeline.py` prints a complete metrics table, and the same command works on a 2-class dataset |

### Rules that protect the pitch

- No `import fastapi` at or below `backend/core/`.
- No hardcoded model, op, encoding or class names in JSX. Everything comes
  from catalog endpoints. A literal `"qsvc"` in a component breaks Phase 2.
- PCA and scalers fit on **train only**.
- Every model implements the full `BaseModel` ABC including `telemetry()`.
- Telemetry uses one identical key set for classical and quantum, quantum
  fields nullable, so one table renders both.

Three greps. All three must print nothing:

```bash
grep -rn "fastapi\|pydantic" backend/core/
grep -rn "qiskit" backend/
grep -rn "fetch(" frontend/src --include=*.jsx
```

---

## Status

| Layer                                                                                                        | State                          |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `core/contracts.py`, `core/paths.py`                                                                         | done, frozen                   |
| `backend/store.py`, `jobs.py`, `validate.py`, `schemas.py`, `main.py`                                        | done                           |
| `core/ingest.py`, `core/preprocess.py`                                                                       | done                           |
| `core/encodings.py`, `registry.py`, `models_*.py`, `embed.py`, `project.py`, `benchmark.py`, `checkpoint.py` | done (W4)                      |
| `core/estimate.py`                                                                                           | **the last stub**              |
| `fixtures/`                                                                                                  | 17 generated, one per endpoint |
| `frontend/`                                                                                                  | scaffolded, components empty   |

Sixteen of seventeen endpoints are live — upload, configure, run, poll,
results, leaderboard and single-image diagnosis all work end to end.
`POST /runs/estimate` is the one exception and returns a readable 503 naming
the missing file.

| 3 | Backbone | `core/embed.py` | `resnet18`, `resnet50`, `resnet50_pool1`, `pixels` |

Measured at 742 training samples, 8 features, 4 classes:

|                            | fit               | predict | note                    |
| -------------------------- | ----------------- | ------- | ----------------------- |
| SVC (grid-searched)        | 6.6s              | 0.00s   | 26 candidates x 5 folds |
| Random Forest              | 0.6s              | 0.02s   |                         |
| QSVC (bandwidth + C tuned) | 0.9s              | 0.01s   | `angle_y`               |
| QSVC (bandwidth + C tuned) | 1.8s              | 0.04s   | `zz`                    |
| VQC                        | ~30s at 15 epochs | 0.03s   | ~80s at the default 40  |

A live demo run of SVC + RF + QSVC completes in about 8 seconds. The budget is
spent on ResNet18 embedding, not on the quantum layer. Keep VQC out of the live
run and show it from a pre-computed one.

Every module self-tests. Run them from the repo root:

```bash
python scripts/status.py --test
```
