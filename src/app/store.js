import { configureStore } from "@reduxjs/toolkit";
import analysisReducer from "../features/analysis/analysisSlice";
import modelsReducer from "../features/models/modelsSlice";
import { benchmarkApi } from "../features/benchmarks/benchmarkApi";
import benchmarkReducer from "../features/benchmarks/benchmarkSlice";

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    models: modelsReducer,
    [benchmarkApi.reducerPath]: benchmarkApi.reducer,
    benchmarks: benchmarkReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(benchmarkApi.middleware),
});
