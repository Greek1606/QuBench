# Product Requirements Document (PRD)
## BIO-Q LAB — Hybrid Quantum ML Platform for Early Disease Detection
### Frontend Implementation Blueprint (SIH 2026 · PS 26139 · Egreen Quanta)

**Audience:** AI coding agent generating production code
**Environment:** Vite + React 19.2.8 + React Router DOM 7.18.3 + Tailwind CSS v4 (`@tailwindcss/vite`) + Redux Toolkit 2.12.0 + react-redux 9.3.0
**Backend:** FastAPI (existing, separate repo/process) — base URL supplied via `VITE_API_BASE_URL`

---

## 0. AI Agent Directives

Before writing any code, the agent **must**:

1. Open and visually analyze the three reference mockups at `Frontend-draft/Context-references/screen1.jpeg`, `screen2.jpeg`, `screen3.jpeg`. These are the single source of truth for spacing, border radius, shadow depth, font sizing, icon choice, and color values. Wherever this PRD's description and the image disagree, **the image wins**.
2. Extract and reuse consistent design tokens across all three screens — do not let each page invent its own card radius, padding, or shadow. The three screens share one design system (defined in §2).
3. Treat this document as the component/state/API contract. Do not invent additional pages, routes, or Redux slices beyond what is specified. Do not rename actions, thunks, or state keys defined in §4.
4. Do not modify `src/app/store.js`'s existing structure beyond adding the three new reducers — assume other slices may already be registered there for unrelated features.
5. Write all styling using Tailwind v4's CSS-first configuration (`@theme` block in `src/index.css`), **not** a `tailwind.config.js` file with a `theme.extend` object — this project uses `@tailwindcss/vite`, which reads design tokens from CSS.
6. No inline hex codes in components. Every color must resolve to a Tailwind utility class backed by a CSS variable defined in `src/index.css`.
7. This PRD deliberately does not include actual `.jsx` code — implement each component from the structural description, prop contract, and visual reference given.

---

## 1. Additional Libraries to Install

| Package | Purpose | Notes |
|---|---|---|
| `recharts` | Bar histogram (Cellular Density Score), line chart (Convergence Curve) | Already React 19-compatible; avoid chart libs requiring class components |
| `react-dropzone` | Drag-and-drop diagnostic image upload zone | Handles the dashed-border zone's drag state + file-type validation (PNG/DICOM/TIFF/NIFTI) |
| `lucide-react` | All icons (upload arrow, check, chevron-down, home, cpu/microchip, bar-chart, activity) | Matches the thin-stroke icon style in the mockups |
| `clsx` | Conditional className composition (active nav tab, badge color variants, status pill states) | Lightweight, avoids messy ternary strings |
| `react-hook-form` | **Already in `package.json` (^7.87.0)** — use it for the Live Inference sample-vector input (validation: must parse as a comma-separated float array) | Do not add a second form library |

Do **not** add: axios (RTK Query's built-in `fetchBaseQuery` covers all API calls), a second charting library, a UI kit (shadcn/MUI/AntD) — all visual components are custom-built per the mockups, or moment/dayjs (no dates are rendered in these three screens).

Install command for the agent to run:
```
npm install recharts react-dropzone lucide-react clsx
```

---

## 2. Design System (extracted from mockups — approximate; agent must sample exact values from the images)

Define in `src/index.css` inside a Tailwind v4 `@theme` block:

| Token | Approx. value | Usage |
|---|---|---|
| `--color-bg-base` | `#F3EFFB` → `#EAE2F8` (subtle diagonal gradient) | App background behind sidebar + content |
| `--color-surface` | `#FFFFFF` | All cards |
| `--color-surface-muted` | `#F6F3FC` | Parameter chips, table zebra rows |
| `--color-text-primary` | `#161022` | Headings, table body text |
| `--color-text-secondary` | `#6B7280` | Subtitles, labels, captions |
| `--color-accent-purple` | `#6D28D9` | Primary buttons, links, active nav, quantum accents |
| `--color-accent-purple-soft` | `#EDE7FB` | Badge backgrounds, hover states |
| `--color-success` | `#16A34A` | Status dots, "High" confidence badge, checkmarks |
| `--color-success-soft` | `#DCFCE7` | "High" badge background |
| `--color-warning` | `#92400E` | "Medium" badge text |
| `--color-warning-soft` | `#FEF3C7` | "Medium" badge background |
| `--color-info-blue` | `#2563EB` | SVM/classical model accents (distinct from quantum purple) |
| `--color-panel-dark` | `#140B24` | Circuit topology panel, heatmap image container |
| `--radius-card` | `20px` | All white cards |
| `--radius-pill` | `9999px` | Buttons, badges, status pills |
| `--shadow-card` | soft, low-opacity, large blur | All white cards on the lavender background |

Typography: `Inter` (fallback `system-ui, sans-serif`), loaded via `@import` or a `<link>` in `index.html`. Headings use `font-semibold`/`font-bold`; body/table text `font-medium`/`font-normal`; labels use `text-xs uppercase tracking-wide text-secondary`.

---

## 3. Component Architecture

```
src/
├── app/
│   ├── store.js                     # add analysisReducer, modelsReducer, benchmarkApi.reducer
│   └── router.jsx                   # React Router v7 route tree (NEW)
├── assets/
│   └── ...                          # existing
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx             # renders Sidebar + <Outlet/>, shared page padding
│   │   └── Sidebar.jsx              # BIO-Q LAB logo, subtitle, 3 nav tabs (NavLink)
│   └── ui/
│       ├── Card.jsx                 # generic white rounded-2xl shadow container
│       ├── Button.jsx               # variants: primary (dark pill), secondary (outline pill)
│       ├── Badge.jsx                # confidence pill: High / Medium / G-State / Q-State
│       ├── StatusPill.jsx           # dot + label, variants: success / neutral / info
│       ├── ProgressBar.jsx          # horizontal filled bar (Accuracy Delta, Expressibility)
│       ├── SelectDropdown.jsx       # bordered rounded dropdown w/ chevron (model pickers)
│       └── ParameterGrid.jsx        # 2x2 (or N-col) label/value chip grid
│
├── features/
│   ├── analysis/                                    # Screen 1
│   │   ├── AnalysisPage.jsx                          # composes the page, reads/dispatches Redux
│   │   ├── analysisSlice.js                          # state + uploadImage thunk (§4)
│   │   └── components/
│   │       ├── UploadZone.jsx                        # react-dropzone wrapper, dashed border
│   │       ├── UploadStatusBar.jsx                   # green dot status row + feature count
│   │       ├── FeatureTable.jsx                      # Feature ID / Name / Confidence(Badge)
│   │       ├── HeatmapPanel.jsx                       # dark panel, heatmap <img>
│   │       └── DensityHistogram.jsx                   # recharts BarChart, Q-State pill + score
│   │
│   ├── models/                                       # Screen 2
│   │   ├── ModelsPage.jsx
│   │   ├── modelsSlice.js                             # state + executeModels thunk (§4)
│   │   └── components/
│   │       ├── QuantumModelCard.jsx                   # dropdown + ParameterGrid + CircuitTopology
│   │       ├── ClassicalModelCard.jsx                 # dropdown + ParameterGrid + Baseline status
│   │       ├── CircuitTopologyVisual.jsx              # dark panel, SVG qubit/gate nodes on a line
│   │       └── ExecutionStatusBar.jsx                 # "Execution Completed" row + READY pill
│   │
│   └── benchmarks/                                    # Screen 3
│       ├── BenchmarksPage.jsx
│       ├── benchmarkApi.js                            # RTK Query api slice (§4)
│       ├── benchmarkSlice.js                          # local UI state (inference input/result)
│       └── components/
│           ├── MetricsSummaryCard.jsx                 # reused for VQC block and SVM block
│           ├── ConvergenceChart.jsx                   # recharts LineChart, 2 series
│           ├── DeltaProgressPanel.jsx                  # 2x ProgressBar + caption
│           ├── RecommendedModelBanner.jsx              # purple heading + Export Report button
│           └── LiveInferencePanel.jsx                  # react-hook-form input + Run Inference
│
├── App.jsx                                             # <RouterProvider router={router} />
├── App.css
├── index.css                                           # @theme tokens (§2) + Tailwind import
└── main.jsx
```

**Routing (`src/app/router.jsx`, React Router 7 `createBrowserRouter`):**

| Path | Element | Nav label |
|---|---|---|
| `/` (index) or `/overview` | `<AnalysisPage/>` | Overview |
| `/models` | `<ModelsPage/>` | QML Models |
| `/benchmarks` | `<BenchmarksPage/>` | Benchmarks |

All three routes are children of `AppShell` so the sidebar persists across navigation. "Proceed →" and "Proceed to Evaluation →" buttons call `navigate('/models')` and `navigate('/benchmarks')` respectively (React Router's `useNavigate`), they do **not** just dispatch Redux state.

---

## 4. Redux Toolkit State Management

**Decision:** Use `createAsyncThunk` for the two mutating, single-shot calls that involve payload upload/side effects (`/upload`, `/predict`-execute, `/predict`-infer). Use **RTK Query** (`createApi`) for `/benchmarks`, since it's a cacheable GET, benefits from automatic loading/error state, and can be refetched/invalidated after the models are (re)executed — wire `modelsSlice`'s successful `executeModels` thunk to `benchmarkApi.util.invalidateTags(['Benchmark'])`.

### 4.1 `src/features/analysis/analysisSlice.js`
```
state: {
  file: { name: null, sizeLabel: null },
  uploadStatus: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: null,
  featureCount: null,
  features: [ { id, name, confidence: 'High'|'Medium'|'G-State'|'Q-State' } ],
  heatmapUrl: null,
  densityHistogram: [ { bucket: number, score: number } ],
  densityConfidenceValue: null,      // e.g. 0.9412 shown top-right of histogram
}
thunk: uploadImage(file) -> POST /upload (multipart/form-data)
```

### 4.2 `src/features/models/modelsSlice.js`
```
state: {
  quantum: {
    selectedModel: 'Variational Quantum Classifier (VQC)',
    parameters: { ansatzArchitecture, optimizerAlgorithm, featureMapType, quantumBackend },
    circuitTopology: [ ...node/gate data for CircuitTopologyVisual ],
    status: 'idle' | 'running' | 'completed' | 'failed',
  },
  classical: {
    selectedModel: 'Support Vector Machine (RBF Kernel)',
    parameters: { kernelCoefficient, regularization, tolerance, decisionFunction },
    status: 'idle' | 'ready' | 'failed',
    trainingNote: 'Pre-trained on 10,000 reference samples',
  },
  execution: { status: 'idle'|'running'|'completed', sampleCount, elapsedSeconds },
}
thunk: executeModels({ quantumModel, classicalModel, featureSetId }) -> POST /predict
  onFulfilled: also dispatch benchmarkApi.util.invalidateTags(['Benchmark'])
```

### 4.3 `src/features/benchmarks/benchmarkApi.js` (RTK Query)
```
createApi({
  reducerPath: 'benchmarkApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
  tagTypes: ['Benchmark'],
  endpoints: (builder) => ({
    getBenchmarks: builder.query({
      query: (runId) => `/benchmarks/${runId}`,
      providesTags: ['Benchmark'],
    }),
  }),
})
// response shape consumed by the page:
{
  vqc: { accuracy, f1Score, inferenceMs },
  svm: { accuracy, f1Score, inferenceMs },
  convergenceCurve: [ { epoch, vqcLoss, svmLoss } ],
  accuracyDeltaPct: 5.6,
  expressibilityIndexPct: number,
  advantageNote: "Quantum model demonstrates 3.75x faster convergence...",
  recommendedModel: { label: "VQC + Hilbert Feature Map", summary: "Outperformed classical SVM by 5.6% higher accuracy and 3.75x faster" },
}
```

### 4.4 `src/features/benchmarks/benchmarkSlice.js` (local, non-server UI state)
```
state: {
  inferenceInput: '',                 // raw textarea/input string, validated via react-hook-form
  inferenceStatus: 'idle'|'loading'|'succeeded'|'failed',
  inferenceResult: null,              // { prediction, confidence, latencyMs }
}
thunk: runInference(vectorArray) -> POST /predict  (live single-sample inference variant)
```

### 4.5 Store registration (`src/app/store.js`)
Add `analysis: analysisReducer`, `models: modelsReducer`, `[benchmarkApi.reducerPath]: benchmarkApi.reducer` to the root reducer, and append `benchmarkApi.middleware` to `getDefaultMiddleware().concat(...)`.

---

## 5. API Integration Map

| UI Trigger | Redux Action | HTTP Call | Endpoint | Consumed By |
|---|---|---|---|---|
| File dropped/selected in `UploadZone` | `dispatch(uploadImage(file))` | `POST` multipart | `/upload` | `UploadStatusBar`, `FeatureTable`, `HeatmapPanel`, `DensityHistogram` |
| Page mount of `ModelsPage` (optional, if backend serves model catalogs) | — (can be static dropdown options for MVP) | `GET` | `/models/available` | `SelectDropdown` options in both cards |
| "Proceed to Evaluation →" clicked on `ModelsPage` | `dispatch(executeModels({...}))` | `POST` | `/predict` | Updates `models` slice status; navigates to `/benchmarks` |
| Mount of `BenchmarksPage` | `useGetBenchmarksQuery(runId)` | `GET` | `/benchmarks/{runId}` | `MetricsSummaryCard` ×2, `ConvergenceChart`, `DeltaProgressPanel`, `RecommendedModelBanner` |
| "Run Inference" clicked in `LiveInferencePanel` | `dispatch(runInference(vector))` | `POST` | `/predict` (single-sample variant, or a dedicated `/infer` if the backend exposes one — confirm against the FastAPI router before wiring) | `LiveInferencePanel` result readout |
| "Export Report" clicked in `RecommendedModelBanner` | none (client-side) | — | — | Trigger a client-side PDF/CSV export of the current `benchmarkApi` cache data; no new backend call required for MVP |

All requests read the base URL from `import.meta.env.VITE_API_BASE_URL` (already present per `.env` / `.env.sample` in the project root). Loading states use `uploadStatus` / `execution.status` / RTK Query's `isLoading` — every card that depends on async data must render a skeleton or disabled state, not a blank layout, while pending.

---

## 6. Step-by-Step Implementation Guide

1. **Design tokens first.** Update `src/index.css` with the Tailwind v4 `@theme` block from §2 and the Inter font import. Do not touch `vite.config.js` (the `@tailwindcss/vite` plugin is already configured).
2. **Install dependencies** listed in §1.
3. **Build the `ui/` primitives** (`Card`, `Button`, `Badge`, `StatusPill`, `ProgressBar`, `SelectDropdown`, `ParameterGrid`) fully generic and prop-driven, styled per §2 tokens. These are consumed by all three feature pages — get their variants right before building pages.
4. **Build `components/layout/Sidebar.jsx` and `AppShell.jsx`.** Sidebar: "BIO-Q LAB" wordmark (bold, dark), "QUANTUM RESEARCH SYSTEM" subtitle (uppercase, tracked, gray, small), three `NavLink`s with `lucide-react` icons (`Home`, `Cpu`, `BarChart3`) — active tab gets a white rounded pill background per screen1/2/3. Wire routes from §3.
5. **Set up `src/app/router.jsx`** with the three routes nested under `AppShell`, and mount it in `App.jsx` via `RouterProvider`.
6. **Scaffold the three Redux units** (`analysisSlice`, `modelsSlice`, `benchmarkApi` + `benchmarkSlice`) exactly per §4's state shapes and thunk signatures, and register them in `store.js`.
7. **Build Screen 1 (`AnalysisPage`)** bottom-up: `UploadZone` (react-dropzone, dashed border, purple circular icon badge, accepts `.png,.dcm,.tiff,.nii`) → `UploadStatusBar` → `FeatureTable` (scrollable body, `Badge` per confidence value, monospace-style `#FT-00X` IDs) → `HeatmapPanel` (dark rounded panel wrapping the returned heatmap image) → `DensityHistogram` (recharts `BarChart`, purple bars, `Q-State` `Badge` + big bold confidence number positioned top-right of the chart per screen1.jpeg). Wire `UploadZone`'s `onDrop` to `dispatch(uploadImage(file))`. Add the primary `Button` "Proceed →" bottom-right, calling `navigate('/models')` (gate it as disabled until `uploadStatus === 'succeeded'`).
8. **Build Screen 2 (`ModelsPage`)**: two equal-width `Card`s in a responsive `grid grid-cols-1 lg:grid-cols-2 gap-6`. Each card: label → `SelectDropdown` → "MODEL PARAMETERS" label → `ParameterGrid` (2 columns × 2 rows) → for the quantum card, `CircuitTopologyVisual` (dark panel, render qubit nodes as small squares connected by a horizontal line using inline SVG — sample exact node styling from screen2.jpeg); for the classical card, a `StatusPill`/note row ("Baseline Ready — Pre-trained on 10,000 reference samples"). Below both cards, a full-width `ExecutionStatusBar` ("Execution Completed" + elapsed time/sample count + green "READY" pill). Primary `Button` "Proceed to Evaluation →" dispatches `executeModels(...)` then navigates to `/benchmarks` on fulfillment.
9. **Build Screen 3 (`BenchmarksPage`)**: call `useGetBenchmarksQuery`. Render two `MetricsSummaryCard`s (VQC in purple heading, SVM in blue heading) each with three stat chips (Accuracy / F1 Score / Inference-per-Sample) using large bold numerals per screen3.jpeg. Below: `ConvergenceChart` (recharts `LineChart`, solid purple VQC line + dashed gray SVM line, legend dots matching color) beside `DeltaProgressPanel` (two `ProgressBar`s — Accuracy Delta, Expressibility Index — plus the italic/gray advantage caption). Then `RecommendedModelBanner` (purple label + bold purple summary line + secondary "Export Report" `Button`). Finally `LiveInferencePanel`: `react-hook-form`-controlled input styled as a full-width bordered field with the placeholder pattern `Input Sample Vector: [0.94, 0.89, ...]`, validated to parse as a float array, paired with a primary `Button` "Run Inference" dispatching `runInference`.
10. **Wire loading/empty/error states** for every async-backed component: `UploadZone` shows a spinner state on `uploadStatus === 'loading'`; `ModelsPage`'s `ExecutionStatusBar` shows a "Running…" variant while `execution.status === 'running'`; `BenchmarksPage` shows skeleton cards while `isLoading` from RTK Query is true, and a clear inline error state (not a blank page) on `isError`.
11. **Responsive pass.** Sidebar collapses to icon-only or a top bar below `lg` breakpoint; the two-column cards on Screens 2 and 3 stack to one column below `lg`; the `FeatureTable`/`HeatmapPanel` pair on Screen 1 stacks below `md`.
12. **Final visual QA against the three source images** — re-open `screen1.jpeg`, `screen2.jpeg`, `screen3.jpeg` side-by-side with the rendered app and check card radii, spacing rhythm, badge colors, and button pill shapes match before considering the build complete.
