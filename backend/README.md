# Backend — Hybrid QML Platform for Early Disease Detection

SIH 2026, PS 26139. FastAPI service that ingests ECG image datasets, runs a
configurable preprocessing → embedding → PCA → quantum-encoding pipeline, and
benchmarks classical models against QML models **on identical features**.

Everything below `backend/core/` is pure Python and runs with no web stack at
all. That is the point, not an accident.

Project overview and the architecture rationale live in the
[root README](../README.md).

---

## Requirements

- **Python 3.11+** — PennyLane 0.45 declares `Requires-Python >=3.11` and will
  not install on 3.10. Built and tested on 3.12.
- ~1 GB disk with CPU-only torch, ~3.5 GB without.
- No GPU. No database. No Docker. No Redis.

## Setup

Run everything from the **repo root**, not from `backend/`.

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Step 1 — CPU torch FIRST. Skipping this pulls ~2.5 GB of CUDA wheels
# (19 nvidia-*/cuda-* packages) that this project never executes. A correct
# install shows torch-2.14.0+cpu and zero nvidia packages.
pip install torch==2.14.0 torchvision==0.29.0 \
    --index-url https://download.pytorch.org/whl/cpu

# Step 2 — everything else
pip install -r backend/requirements.txt
```

The venv lives at the **repo root**, not inside `backend/`. That is deliberate:
`--reload-dir backend` then excludes it from the file watcher. A venv inside
`backend/` means uvicorn watches ~10,000 files in `site-packages`.

`requirements.txt` lives in `backend/`, mirroring `frontend/package.json`.
After your first successful install, freeze it and commit the result:

```bash
pip freeze > backend/requirements.lock.txt
```

## Verify the install

Every module self-tests. From the repo root:

```bash
python -c "import fastapi, cv2, PIL, sklearn, pennylane, torch; print('deps ok')"

for m in core.paths core.contracts core.ingest core.preprocess \
         store jobs validate schemas; do
  echo "── $m"; python -m backend.$m 2>&1 | tail -2
done
```

Two of those print `ERROR`/`WARNING` lines on the way through — `store` and
`jobs` deliberately corrupt files and raise exceptions to prove their recovery
paths work. If the last line says `OK`, they passed. `store` runs against a
temp directory and never touches real `storage/`.

If anything fails to import, find out which:

```bash
python -c "
import importlib
for m in ['core.paths','core.contracts','core.ingest','core.preprocess',
          'store','jobs','validate','schemas','main']:
    try: importlib.import_module('backend.'+m); print('ok  ', m)
    except Exception as e: print('FAIL', m, '->', type(e).__name__, e)
"
```

`No module named 'backend.core.X'` means a **file** is missing. `No module
named 'cv2'` means a **package** is missing. The prefix tells you whether to
reach for `ls` or for `pip`.

## Run

```bash
uvicorn backend.main:app --reload --reload-dir backend --port 8000
```

- Interactive docs: <http://localhost:8000/docs>
- What is wired: <http://localhost:8000/health>
- The frontend dev server proxies here — see `frontend/vite.config.js`.

On startup you will see a warning naming the model-layer symbols that are not
written yet. That is expected until W4 lands.

---

## Layout and ownership

```
backend/
├── __init__.py        EMPTY — makes `backend.core` importable from scripts/
├── main.py            W3   routes only, 17 endpoints, zero ML logic
├── schemas.py         W1   Pydantic mirrors of contracts.py
├── jobs.py            W3   SEAM 5 — JOBS dict, submit_job, get_job
├── store.py           W3   SEAM 6 — six functions over JSON files
├── validate.py        W3   RunConfig + DatasetMeta -> ValidationResult
├── requirements.txt        pinned; resolved as one set, do not bump in isolation
│
└── core/              ← no fastapi, no pydantic, at or below this line
    ├── __init__.py    EMPTY
    ├── paths.py       W1   every filesystem location — FROZEN
    ├── contracts.py   W1   every dataclass + BaseModel ABC — FROZEN
    ├── ingest.py      W3   SEAM 1 — ADAPTERS, load_image_folder()
    ├── preprocess.py  W3   SEAM 2 — OP_REGISTRY, PRESETS, apply_ops()
    ├── encodings.py   W4   SEAM 3.5 — ENCODINGS + catalog()   [done]
    ├── registry.py    W4   SEAM 4 — MODEL_REGISTRY + catalog() [done]
    ├── models_classical.py / models_quantum.py   W4  [done]
    ├── embed.py       W4   SEAM 3 — 4 backbones, cache, catalog() [done]
    ├── project.py     W4   split -> PCA -> scaler (train only)  [done]
    ├── benchmark.py   W4   run_benchmark + run_for_dataset + predict_single [done]
    ├── checkpoint.py  W4   bundle save/load                     [done]
    └── estimate.py    W4   estimate(cfg, ds) -> Estimate        [STUB]
```

`contracts.py` and `paths.py` are frozen. Changing either means telling all
four streams.

## The invariant

```
ingest → preprocess → embed → project → encode → train → evaluate
```

Everything upstream of the model layer collapses to exactly:

```
X : float32[n, N]     y : int[n]     class_names : list[str]
```

`BaseModel.fit()` raises if any label falls outside `[0, n_classes)`, so a
hardcoded `4` dies loudly the first time someone uploads a 2-class dataset.

## Import direction

```
scripts/      ──►  backend.core
backend/*.py  ──►  backend.core
backend.core  ──►  nothing above it
```

Three checks. All must print nothing. Run before every commit:

```bash
grep -rn "fastapi\|pydantic" backend/core/
grep -rn "from backend\.\(main\|jobs\|store\|validate\)" backend/core/
grep -rn "qiskit" backend/
```

## Endpoints

| Method | Path                        | Status                                         |
| :----- | :-------------------------- | :--------------------------------------------- |
| GET    | `/health`                   | live (not in the frozen 16; additive)          |
| POST   | `/datasets`                 | live                                           |
| GET    | `/datasets`                 | live                                           |
| GET    | `/ops/catalog`              | live                                           |
| GET    | `/presets`                  | live                                           |
| POST   | `/preprocess/preview`       | live                                           |
| POST   | `/runs/validate`            | live (encoding/model rules activate with W4)   |
| GET    | `/jobs/{job_id}`            | live                                           |
| GET    | `/runs`                     | live                                           |
| GET    | `/runs/{run_id}`            | live                                           |
| GET    | `/leaderboard`              | live                                           |
| GET    | `/encodings`                | live                                           |
| GET    | `/models/catalog`           | live                                           |
| GET    | `/backbones`                | live                                           |
| POST   | `/runs`                     | live                                           |
| POST   | `/predict/{run_id}/{model}` | live                                           |
| POST   | `/runs/estimate`            | 503 — needs `core/estimate.py` (the last stub) |

The 503s carry the missing filename in `detail`. `/docs` is complete, so W2
can build against every real shape today. `GET /health` reports which of the
six model-layer symbols are wired.

**The three catalog routes call the registries' `catalog()` accessor, not the
raw dict.** `registry.catalog()` sorts classical-first so the model picker's
two columns are stable without W2 sorting them. `embed.py` must therefore
export a `catalog()` function alongside `BACKBONES`, matching
`encodings.catalog()` and `registry.catalog()`.

**Caveat on validation:** `validate.py` skips rules whose registry is absent,
per registry. Encoding and model names are checked now; the backbone rule
switches on when `embed.py` lands. No change to `validate.py` is needed.

## Storage

```
storage/
├── datasets.json                                    list[DatasetMeta]
├── runs.json                                        list[RunRecord]
├── datasets/{ds_id}/{class_name}/*                  ingested images
├── datasets/{ds_id}/_preview/*.png                  4 thumbnails
├── artifacts/{ds_id}__{backbone}__{ops_hash}.npy    embedding cache
└── checkpoints/{run_id}__{model}.pkl                CheckpointBundle
```

Paths come from `core/paths.py`. Never write `Path("storage")` by hand — the
API and `scripts/pipeline.py` have different working directories and will
disagree.

The cache key comes from `RunConfig.embed_key()`. Never build it by hand.
Changing `n_features` or `encoding` **hits** the cache; changing `ops`
recomputes. That boundary is deliberate — users fiddle with features and
encoding constantly and should not wait for ResNet18 each time.

**Reset everything:**

```bash
rm -rf storage/ && python backend/core/paths.py    # recreates the tree
```

## Adding things later

This is the pitch: Phases 2 and 3 are additions, not rewrites.

| Want to add              | Touch                                     | Frontend work |
| :----------------------- | :---------------------------------------- | :------------ |
| A new model (Phase 2)    | `models_*.py` + one line in `registry.py` | **none**      |
| A new preprocessing op   | `preprocess.py` `OP_REGISTRY`             | **none**      |
| A new encoding           | `encodings.py` `ENCODINGS`                | **none**      |
| A new backbone           | `embed.py` `BACKBONES`                    | **none**      |
| A new modality (Phase 3) | `ingest.py` `ADAPTERS`                    | **none**      |

"None" holds only because the frontend renders from catalog endpoints. A
literal `"qsvc"` or `"crop_border"` in JSX breaks it. `ParamControl` builds its
widgets from `params_schema`; keep it generic.

## Troubleshooting

**`Form data requires "python-multipart" to be installed`** — it is pinned in
`backend/requirements.txt`; your venv is stale or not activated.

**`ModuleNotFoundError: No module named 'backend'`** — run from the repo root.

**`paths.ROOT resolved to ..., which has no backend/ directory`** —
`core/paths.py` was moved. It expects `backend/core/paths.py` and uses
`parents[2]`.

**`datasets.json was unreadable; moved to datasets.corrupt-*.json`** — a write
was interrupted or the file was hand-edited. The store quarantines it and
starts clean; your old data is in the `.corrupt-*` file. Reads never raise, so
one bad record only skips that record.

**CORS errors in the browser** — `main.py` allows `localhost:5173`. If Vite
picked a different port, add it there.

**Uploads succeed but `/datasets` is empty** — `store.list_datasets` skipped
the row. Run with `logging.basicConfig(level=logging.INFO)` and look for
`skipping bad DatasetMeta record`.

**A class silently vanished after upload** — every file in it failed the
header check in `ingest._store_images`. They were not readable images.

**A job hangs at 60%** — training. Usually VQC: about 30s at 15 epochs and 80s
at the default 40, versus under 2s for QSVC. There is no job timeout — Python
cannot kill a worker thread from outside — so `POST /runs/estimate` warning you
_before_ you click Run is the only defence.

**A quantum model scores near or below chance** — check the bandwidth before
suspecting anything else. A fidelity kernel at the encoding's natural range
concentrates towards the identity, and the SVC then memorises the training set.
QSVC cross-validates bandwidth automatically (leave `tune` on); VQC does not,
because a VQC fit is too expensive to cross-validate five times — read the
bandwidth QSVC picked off the benchmark table and set it manually. VQC on `zz`
at the default bandwidth of 1.0 is the known bad combination.

**`vqc needs >= 2 qubits`** — you hit `amplitude` at 2 features, which is one
qubit. `validate.py` blocks this at the Run button now; if you see it, the job
was started through `scripts/pipeline.py`, which bypasses validation.

**Reloads are slow or fire constantly** — the venv is inside `backend/`. Move
it to the repo root, or add `--reload-exclude 'backend/.venv/*'`.

---

## Current state

```bash
python scripts/status.py --test      # the authoritative answer
```

Done: every module except one. Twelve self-tests, all passing, plus an
in-process pass over all 17 routes.

Remaining: `core/estimate.py` and `scripts/pipeline.py`.

`estimate.py` matters more than its size suggests. There is no job timeout —
Python cannot kill a worker thread from outside — so the cost strip warning
_before_ the Run button is the only thing standing between a user and a config
that runs for hours.

Two things to know about the W4 layer as integrated:

- `run_benchmark(cfg, images, labels, class_names, ...)` is pure: arrays in,
  dicts out, no disk and no `DatasetMeta`, so it is testable without an upload.
  `run_for_dataset(cfg, ds, progress)` is the wrapper `main.py` calls — it
  loads the images, replays `cfg.ops` (progress 5 -> 20), and assembles the
  `RunRecord`.
- `predict_single(checkpoint_name, bytes)` decodes to **RGB**, applies EXIF
  orientation, and replays the ops stored in the checkpoint — never the live
  config, which the user may have edited since the run.

The amplitude question is settled — it shipped, along with `angle_x2`, so the
registry holds four encodings rather than two.

Fixtures are generated, not hand-written:

```bash
python scripts/gen_fixtures.py       # 17 files, one per endpoint
```

Each is validated against its `schemas.py` response model before being
written, and the encoding, model and backbone fixtures are read from the live
registries when those exist. Re-run after any change to `contracts.py`,
`schemas.py` or a registry.
