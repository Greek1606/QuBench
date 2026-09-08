import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchApi } from "../../lib/api";

export const runInference = createAsyncThunk(
  "benchmarks/runInference",
  async (vectorArray, { rejectWithValue }) => {
    try {
      return await fetchApi("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vector: vectorArray, mode: "infer" }),
      });
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const initialState = {
  inferenceInput: "",
  inferenceStatus: "idle",
  inferenceResult: null,
  inferenceError: null,
};

const benchmarkSlice = createSlice({
  name: "benchmarks",
  initialState,
  reducers: {
    setInferenceInput(state, action) {
      state.inferenceInput = action.payload;
    },
    resetInference: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(runInference.pending, (state) => {
        state.inferenceStatus = "loading";
        state.inferenceError = null;
      })
      .addCase(runInference.fulfilled, (state, action) => {
        state.inferenceStatus = "succeeded";
        const d = action.payload;
        state.inferenceResult = {
          prediction: d.prediction ?? d.label ?? "N/A",
          confidence: d.confidence ?? d.score ?? null,
          latencyMs: d.latencyMs ?? d.latency_ms ?? d.inferenceMs ?? null,
        };
      })
      .addCase(runInference.rejected, (state, action) => {
        state.inferenceStatus = "failed";
        state.inferenceError = action.payload || "Inference failed";
      });
  },
});

export const { setInferenceInput, resetInference } = benchmarkSlice.actions;
export default benchmarkSlice.reducer;
